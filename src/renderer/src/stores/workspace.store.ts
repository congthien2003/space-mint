import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Project, TerminalPane, WorkspaceLayout } from "@shared/types";
import { useSettingsStore } from "./settings.store";
import {
  computeSplit,
  computeNewPanePosition
} from "@renderer/features/workspace/layout-utils";

const GRID_COLS = 12;
const DEFAULT_PANE_H = 8;

interface AddPaneOptions {
  cwd: string;
  shell?: string;
  title?: string;
  fromPaneId?: string;
  direction?: "right" | "down";
}

interface WorkspaceState {
  currentProject: Project | null;
  panes: TerminalPane[];
  exitedPanes: Record<string, number>;
  openProject: (project: Project) => Promise<void>;
  closeProject: () => Promise<void>;
  addPane: (opts: AddPaneOptions) => Promise<void>;
  removePane: (id: string) => Promise<void>;
  renamePane: (id: string, title: string) => void;
  duplicatePane: (id: string) => Promise<void>;
  updatePaneGrid: (id: string, grid: TerminalPane["grid"]) => void;
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

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentProject: null,
  panes: [],
  exitedPanes: {},

  openProject: async (project) => {
    await killAllPanes(get().panes);
    set({ currentProject: project, panes: [], exitedPanes: {} });
    try {
      const layout = await window.app.layouts.getLayout(project.id);
      if (layout && layout.panes.length > 0) {
        const shell = resolveShell();
        const restored: TerminalPane[] = [];
        for (const saved of layout.panes) {
          await window.app.terminals.createTerminal({
            id: saved.id,
            projectId: project.id,
            cwd: saved.cwd,
            shell: saved.shell || shell
          });
          restored.push({ ...saved });
        }
        set({ panes: restored });
      }
    } catch {
      // layout load failed -> empty workspace
    }
  },

  closeProject: async () => {
    await killAllPanes(get().panes);
    set({ currentProject: null, panes: [], exitedPanes: {} });
  },

  addPane: async (opts) => {
    const project = get().currentProject;
    if (!project) return;
    const shell = opts.shell || resolveShell();
    const panes = get().panes;
    let newPane: TerminalPane;
    if (opts.fromPaneId && opts.direction) {
      const from = panes.find((p) => p.id === opts.fromPaneId);
      if (!from) return;
      const { original, next } = computeSplit(from, opts.direction, GRID_COLS);
      set((state) => ({
        panes: state.panes.map((p) =>
          p.id === from.id ? { ...p, grid: original } : p
        )
      }));
      newPane = {
        id: nanoid(),
        projectId: project.id,
        title: opts.title || "Terminal",
        cwd: opts.cwd,
        shell,
        grid: next
      };
    } else {
      const pos = computeNewPanePosition(panes, GRID_COLS, DEFAULT_PANE_H);
      newPane = {
        id: nanoid(),
        projectId: project.id,
        title: opts.title || "Terminal",
        cwd: opts.cwd,
        shell,
        grid: pos
      };
    }
    await window.app.terminals.createTerminal({
      id: newPane.id,
      projectId: project.id,
      cwd: newPane.cwd,
      shell
    });
    set((state) => ({ panes: [...state.panes, newPane] }));
    scheduleSave(() => void get().saveLayout());
  },

  removePane: async (id) => {
    await window.app.terminals.kill(id);
    set((state) => {
      const exitedPanes = { ...state.exitedPanes };
      delete exitedPanes[id];
      return {
        panes: state.panes.filter((p) => p.id !== id),
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
    const pos = computeNewPanePosition(get().panes, GRID_COLS, DEFAULT_PANE_H);
    const newPane: TerminalPane = {
      id: nanoid(),
      projectId: project.id,
      title: pane.title,
      cwd: pane.cwd,
      shell: pane.shell,
      grid: pos
    };
    await window.app.terminals.createTerminal({
      id: newPane.id,
      projectId: project.id,
      cwd: newPane.cwd,
      shell: newPane.shell
    });
    set((state) => ({ panes: [...state.panes, newPane] }));
    scheduleSave(() => void get().saveLayout());
  },

  updatePaneGrid: (id, grid) => {
    set((state) => ({
      panes: state.panes.map((p) => (p.id === id ? { ...p, grid } : p))
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
    const layout: WorkspaceLayout = {
      projectId: project.id,
      panes: get().panes,
      updatedAt: new Date().toISOString()
    };
    try {
      await window.app.layouts.saveLayout(project.id, layout);
    } catch {
      // ignore persistence errors
    }
  }
}));
