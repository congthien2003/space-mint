import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  LayoutDirection,
  LayoutNode,
  Project,
  TerminalPane,
  WorkspaceLayout
} from "@shared/types";
import { useSettingsStore } from "./settings.store";
import {
  appendPaneToNode,
  appendPaneToTree,
  type InsertPlacement,
  ensureTreeForPanes,
  legacyPanesToTree,
  removePaneFromTree,
  splitPaneInTree,
  updateSplitChildSizes
} from "@renderer/features/workspace/layout-utils";

interface AddPaneOptions {
  cwd: string;
  shell?: string;
  title?: string;
  fromPaneId?: string;
  direction?: "right" | "down";
}

interface AddPaneToNodeOptions {
  nodeId: string;
  direction: LayoutDirection;
  placement: InsertPlacement;
  cwd: string;
  shell?: string;
  title?: string;
}

type StoredPane = TerminalPane & {
  grid?: { x: number; y: number; w: number; h: number };
};

type StoredLayout = Omit<WorkspaceLayout, "layoutTree" | "panes"> & {
  panes: StoredPane[];
  layoutTree?: LayoutNode | null;
};

interface WorkspaceState {
  currentProject: Project | null;
  panes: TerminalPane[];
  layoutTree: LayoutNode | null;
  exitedPanes: Record<string, number>;
  openProject: (project: Project) => Promise<void>;
  closeProject: () => Promise<void>;
  addPane: (opts: AddPaneOptions) => Promise<void>;
  addPaneToNode: (opts: AddPaneToNodeOptions) => Promise<void>;
  removePane: (id: string) => Promise<void>;
  renamePane: (id: string, title: string) => void;
  duplicatePane: (id: string) => Promise<void>;
  resizeSplit: (splitId: string, sizes: number[]) => void;
  markExited: (id: string, exitCode: number) => void;
  restartPane: (id: string) => Promise<void>;
  saveLayout: () => Promise<void>;
}

function resolveShell(): string {
  return useSettingsStore.getState().settings.defaultShell;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(fn: () => void): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(fn, 400);
}

async function killAllPanes(panes: TerminalPane[]): Promise<void> {
  for (const p of panes) {
    await window.app.terminals.kill(p.id);
  }
}

function directionToLayout(direction: "right" | "down"): LayoutDirection {
  return direction === "right" ? "row" : "column";
}

function normalizeStoredPane(pane: StoredPane, projectId: string): TerminalPane {
  return {
    id: pane.id,
    projectId,
    title: pane.title || "Terminal",
    cwd: pane.cwd,
    shell: pane.shell || resolveShell()
  };
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentProject: null,
  panes: [],
  layoutTree: null,
  exitedPanes: {},

  openProject: async (project) => {
    await killAllPanes(get().panes);
    set({ currentProject: project, panes: [], layoutTree: null, exitedPanes: {} });

    try {
      const layout = (await window.app.layouts.getLayout(project.id)) as StoredLayout | null;
      if (layout && layout.panes.length > 0) {
        const restored = layout.panes.map((pane) =>
          normalizeStoredPane(pane, project.id)
        );

        for (const saved of restored) {
          await window.app.terminals.createTerminal({
            id: saved.id,
            projectId: project.id,
            cwd: saved.cwd,
            shell: saved.shell
          });
        }

        const baseTree = layout.layoutTree ?? legacyPanesToTree(layout.panes);
        set({
          panes: restored,
          layoutTree: ensureTreeForPanes(baseTree, restored)
        });
      }
    } catch {
      // layout load failed -> empty workspace
    }
  },

  closeProject: async () => {
    await killAllPanes(get().panes);
    set({ currentProject: null, panes: [], layoutTree: null, exitedPanes: {} });
  },

  addPane: async (opts) => {
    const project = get().currentProject;
    if (!project) return;

    const panes = get().panes;
    if (opts.fromPaneId && !panes.some((pane) => pane.id === opts.fromPaneId)) {
      return;
    }

    const shell = opts.shell || resolveShell();
    const newPane: TerminalPane = {
      id: nanoid(),
      projectId: project.id,
      title: opts.title || "Terminal",
      cwd: opts.cwd,
      shell
    };
    const baseTree = ensureTreeForPanes(get().layoutTree, panes);
    const nextTree =
      opts.fromPaneId && opts.direction
        ? splitPaneInTree(
            baseTree,
            opts.fromPaneId,
            newPane.id,
            directionToLayout(opts.direction)
          )
        : appendPaneToTree(baseTree, newPane.id);

    await window.app.terminals.createTerminal({
      id: newPane.id,
      projectId: project.id,
      cwd: newPane.cwd,
      shell
    });

    set((state) => ({
      panes: [...state.panes, newPane],
      layoutTree: nextTree
    }));
    scheduleSave(() => void get().saveLayout());
  },

  addPaneToNode: async (opts) => {
    const project = get().currentProject;
    if (!project) return;

    const shell = opts.shell || resolveShell();
    const newPane: TerminalPane = {
      id: nanoid(),
      projectId: project.id,
      title: opts.title || "Terminal",
      cwd: opts.cwd,
      shell
    };
    const panes = get().panes;
    const baseTree = ensureTreeForPanes(get().layoutTree, panes);
    const nextTree =
      appendPaneToNode(
        baseTree,
        opts.nodeId,
        newPane.id,
        opts.direction,
        opts.placement
      ) ??
      appendPaneToTree(baseTree, newPane.id);

    await window.app.terminals.createTerminal({
      id: newPane.id,
      projectId: project.id,
      cwd: newPane.cwd,
      shell
    });

    set((state) => ({
      panes: [...state.panes, newPane],
      layoutTree: nextTree
    }));
    scheduleSave(() => void get().saveLayout());
  },

  removePane: async (id) => {
    await window.app.terminals.kill(id);
    set((state) => {
      const exitedPanes = { ...state.exitedPanes };
      delete exitedPanes[id];
      return {
        panes: state.panes.filter((p) => p.id !== id),
        layoutTree: removePaneFromTree(state.layoutTree, id),
        exitedPanes
      };
    });
    scheduleSave(() => void get().saveLayout());
  },

  renamePane: (id, title) => {
    set((state) => ({
      panes: state.panes.map((p) => (p.id === id ? { ...p, title } : p))
    }));
    scheduleSave(() => void get().saveLayout());
  },

  duplicatePane: async (id) => {
    const project = get().currentProject;
    const pane = get().panes.find((p) => p.id === id);
    if (!pane || !project) return;

    const newPane: TerminalPane = {
      id: nanoid(),
      projectId: project.id,
      title: pane.title,
      cwd: pane.cwd,
      shell: pane.shell
    };
    const baseTree = ensureTreeForPanes(get().layoutTree, get().panes);
    const nextTree = appendPaneToTree(baseTree, newPane.id);

    await window.app.terminals.createTerminal({
      id: newPane.id,
      projectId: project.id,
      cwd: newPane.cwd,
      shell: newPane.shell
    });

    set((state) => ({
      panes: [...state.panes, newPane],
      layoutTree: nextTree
    }));
    scheduleSave(() => void get().saveLayout());
  },

  resizeSplit: (splitId, sizes) => {
    set((state) => ({
      layoutTree: updateSplitChildSizes(state.layoutTree, splitId, sizes)
    }));
    scheduleSave(() => void get().saveLayout());
  },

  markExited: (id, exitCode) => {
    set((state) => ({ exitedPanes: { ...state.exitedPanes, [id]: exitCode } }));
  },

  restartPane: async (id) => {
    const project = get().currentProject;
    const pane = get().panes.find((p) => p.id === id);
    if (!pane || !project) return;
    set((state) => {
      const exitedPanes = { ...state.exitedPanes };
      delete exitedPanes[id];
      return { exitedPanes };
    });
    await window.app.terminals.createTerminal({
      id: pane.id,
      projectId: project.id,
      cwd: pane.cwd,
      shell: pane.shell
    });
  },

  saveLayout: async () => {
    const project = get().currentProject;
    if (!project) return;
    const panes = get().panes;
    const layout: WorkspaceLayout = {
      projectId: project.id,
      panes,
      layoutTree: ensureTreeForPanes(get().layoutTree, panes),
      updatedAt: new Date().toISOString()
    };
    try {
      await window.app.layouts.saveLayout(project.id, layout);
    } catch {
      // ignore persistence errors
    }
  }
}));
