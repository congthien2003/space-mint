# Phase 3 - Workspace Grid + Layout Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Implement react-grid-layout workspace with split/drag/resize/rename/duplicate/close panes. Save and restore layout per project via electron-store.

**Architecture:** react-grid-layout with WidthProvider + Responsive (12 cols). LayoutService in main persists pane metadata. workspace.store manages full lifecycle: openProject loads layout + spawns terminals, closeProject kills all. Save debounced 500ms.

**Prerequisite:** Phase 0 + 1 + 2 completed.

**Tech Stack:** react-grid-layout, Electron 39, Zustand.

**Spec reference:** `docs/superpowers/specs/2026-01-07-space-mint-phase1-design.md` (Section 8)

---

## File Structure Map

### Files to Create
| File | Responsibility |
|---|---|
| `src/main/services/LayoutService.ts` | Layout CRUD via electron-store |
| `src/main/ipc/layout.ipc.ts` | Layout IPC handlers |
| `src/renderer/src/features/workspace/WorkspaceGrid.tsx` | react-grid-layout wrapper |
| `src/renderer/src/features/workspace/TerminalHeader.tsx` | Pane header with controls |

### Files to Modify
| File | Change |
|---|---|
| `src/main/ipc/index.ts` | Register layout IPC |
| `src/main/index.ts` | Init LayoutService |
| `src/main/services/ProjectService.ts` | Remove layout when project removed |
| `src/renderer/src/stores/workspace.store.ts` | Full lifecycle: openProject, closeProject, splitPane, duplicatePane, renamePane, saveLayout debounced |
| `src/renderer/src/features/workspace/Workspace.tsx` | Use WorkspaceGrid |
| `src/renderer/src/shared/components/TopBar.tsx` | Wire + Terminal button |
| `src/renderer/src/app/App.tsx` | openProject/closeProject lifecycle |

---
## Task 1: Tao LayoutService (Main)

**Files:** Create `src/main/services/LayoutService.ts`

```ts
import type { WorkspaceLayout } from "@shared/types";
import type { AppStore } from "../store/AppStore";

export class LayoutService {
  constructor(private store: AppStore) {}

  getLayout(projectId: string): WorkspaceLayout | null {
    const layouts = this.store.get("layouts");
    return layouts[projectId] ?? null;
  }

  saveLayout(projectId: string, layout: WorkspaceLayout): void {
    const layouts = this.store.get("layouts");
    layouts[projectId] = { ...layout, updatedAt: new Date().toISOString() };
    this.store.set("layouts", layouts);
  }

  removeLayout(projectId: string): void {
    const layouts = this.store.get("layouts");
    delete layouts[projectId];
    this.store.set("layouts", layouts);
  }
}
```

Verify: `pnpm typecheck:node` -> PASS.

---

## Task 2: Tao layout.ipc.ts + Update ipc/index.ts

**Files:** Create `src/main/ipc/layout.ipc.ts`, modify `src/main/ipc/index.ts`

### layout.ipc.ts
```ts
import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { WorkspaceLayout } from "@shared/types";
import type { LayoutService } from "../services/LayoutService";

export function registerLayoutIpc(layoutService: LayoutService): void {
  ipcMain.handle(IPC.LAYOUT_GET, (_e, projectId: string) => layoutService.getLayout(projectId));
  ipcMain.handle(IPC.LAYOUT_SAVE, (_e, projectId: string, layout: WorkspaceLayout) =>
    layoutService.saveLayout(projectId, layout));
}
```

### Update ipc/index.ts
Add to imports and registerAllIpc params: `layoutService: LayoutService`, call `registerLayoutIpc(layoutService)`.

---

## Task 3: Update main/index.ts - init LayoutService

Add `const layoutService = new LayoutService(appStore)` in app.whenReady(), pass to registerAllIpc.

Update ProjectService.remove() to also call `layoutService.removeLayout(id)` (inject LayoutService via constructor or add parameter).

Verify: `pnpm typecheck:node` -> PASS.

---
## Task 4: Tao TerminalHeader component

**Files:** Create `src/renderer/src/features/workspace/TerminalHeader.tsx`

```tsx
import { useState } from "react";

interface Props {
  title: string;
  cwd: string;
  onRename: (title: string) => void;
  onSplitRight: () => void;
  onSplitDown: () => void;
  onClose: () => void;
}

export function TerminalHeader({ title, cwd, onRename, onSplitRight, onSplitDown, onClose }: Props): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const handleSave = (): void => {
    setEditing(false);
    if (editValue.trim()) onRename(editValue.trim());
  };

  return (
    <div className="flex h-8 items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2">
      {editing ? (
        <input className="w-24 rounded bg-aw-bg px-1 text-xs text-aw-text" value={editValue}
               onChange={(e) => setEditValue(e.target.value)} onBlur={handleSave}
               onKeyDown={(e) => e.key === "Enter" && handleSave()} autoFocus />
      ) : (
        <span className="cursor-pointer text-xs text-aw-text" onDoubleClick={() => setEditing(true)}>
          {title}
        </span>
      )}
      <span className="text-xs text-aw-text-soft truncate">{cwd}</span>
      <div className="ml-auto flex gap-1">
        <button className="rounded px-2 py-0.5 text-xs text-aw-text-soft hover:bg-aw-bg-mute" onClick={onSplitRight} title="Split Right">||</button>
        <button className="rounded px-2 py-0.5 text-xs text-aw-text-soft hover:bg-aw-bg-mute" onClick={onSplitDown} title="Split Down">=</button>
        <button className="rounded px-2 py-0.5 text-xs text-aw-text-soft hover:bg-aw-bg-mute" onClick={onClose} title="Close">x</button>
      </div>
    </div>
  );
}
```

---

## Task 5: Tao WorkspaceGrid component

**Files:** Create `src/renderer/src/features/workspace/WorkspaceGrid.tsx`

```tsx
import { useCallback } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useSettingsStore } from "@renderer/stores/settings.store";
import { TerminalPane } from "./TerminalPane";
import { TerminalHeader } from "./TerminalHeader";

const ResponsiveGridLayout = WidthProvider(Responsive);

export function WorkspaceGrid(): React.JSX.Element {
  const panes = useWorkspaceStore((s) => s.panes);
  const updatePaneGrid = useWorkspaceStore((s) => s.updatePaneGrid);
  const splitPane = useWorkspaceStore((s) => s.splitPane);
  const renamePane = useWorkspaceStore((s) => s.renamePane);
  const removePane = useWorkspaceStore((s) => s.removePane);

  const layout: Layout[] = panes.map((p) => ({ i: p.id, x: p.grid.x, y: p.grid.y, w: p.grid.w, h: p.grid.h, minW: 2, minH: 4 }));

  const handleDragStop: (layout: Layout[]) => void = useCallback((l) => {
    l.forEach((item) => updatePaneGrid(item.i, { x: item.x, y: item.y, w: item.w, h: item.h }));
  }, [updatePaneGrid]);

  const handleResizeStop: (layout: Layout[]) => void = useCallback((l) => {
    l.forEach((item) => updatePaneGrid(item.i, { x: item.x, y: item.y, w: item.w, h: item.h }));
  }, [updatePaneGrid]);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      compactType="vertical"
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
    >
      {panes.map((pane) => (
        <div key={pane.id} className="flex flex-col overflow-hidden">
          <TerminalHeader
            title={pane.title} cwd={pane.cwd}
            onRename={(t) => renamePane(pane.id, t)}
            onSplitRight={() => splitPane(pane.id, "right")}
            onSplitDown={() => splitPane(pane.id, "down")}
            onClose={() => removePane(pane.id)}
          />
          <div className="flex-1">
            <TerminalPane terminalId={pane.id} cwd={pane.cwd} onClose={() => removePane(pane.id)} onRestart={async () => { await removePane(pane.id); useWorkspaceStore.getState().addPane(pane.cwd); }} />
          </div>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
```

Verify: `pnpm typecheck:web` -> PASS (may need `pnpm add react-grid-layout` if not installed - check package.json).

---
## Task 6: Update workspace.store.ts - full lifecycle

**Files:** Modify `src/renderer/src/stores/workspace.store.ts`

Thay toan bo store voi day du lifecycle:

```ts
import { create } from "zustand";
import type { Project, TerminalPane } from "@shared/types";

interface WorkspaceState {
  currentProject: Project | null;
  panes: TerminalPane[];
  setCurrentProject: (p: Project | null) => void;
  openProject: (project: Project) => Promise<void>;
  closeProject: () => Promise<void>;
  addPane: (cwd: string, shell?: string) => Promise<void>;
  splitPane: (id: string, direction: "right" | "down") => Promise<void>;
  duplicatePane: (id: string) => Promise<void>;
  renamePane: (id: string, title: string) => void;
  removePane: (id: string) => Promise<void>;
  updatePaneGrid: (id: string, grid: { x: number; y: number; w: number; h: number }) => void;
  _debouncedSave: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentProject: null,
  panes: [],

  setCurrentProject: (project) => set({ currentProject: project }),

  openProject: async (project) => {
    set({ currentProject: project });
    const layout = await window.app.layouts.getLayout(project.id);
    if (layout && layout.panes.length > 0) {
      set({ panes: layout.panes });
      for (const pane of layout.panes) {
        window.app.terminals.createTerminal({ projectId: project.id, cwd: pane.cwd, shell: pane.shell || undefined })
          .catch(console.error);
      }
    } else {
      get().addPane(project.path);
    }
  },

  closeProject: async () => {
    for (const pane of get().panes) {
      await window.app.terminals.kill(pane.id).catch(() => {});
    }
    set({ currentProject: null, panes: [] });
  },

  addPane: async (cwd, shell?) => {
    const project = get().currentProject;
    if (!project) return;
    const { terminalId } = await window.app.terminals.createTerminal({ projectId: project.id, cwd, shell });
    const pane: TerminalPane = {
      id: terminalId, projectId: project.id, title: cwd.split("/").pop() || cwd, cwd, shell: shell || "",
      grid: { x: 0, y: Infinity, w: 6, h: 8 }
    };
    set((s) => ({ panes: [...s.panes, pane] }));
    get()._debouncedSave();
  },

  splitPane: async (id, direction) => {
    const pane = get().panes.find((p) => p.id === id);
    if (!pane) return;
    const project = get().currentProject;
    if (!project) return;
    const { terminalId } = await window.app.terminals.createTerminal({ projectId: project.id, cwd: pane.cwd, shell: pane.shell || undefined });
    let newGrid: { x: number; y: number; w: number; h: number };
    if (direction === "right") {
      const halfW = Math.floor(pane.grid.w / 2);
      newGrid = { x: pane.grid.x + halfW, y: pane.grid.y, w: pane.grid.w - halfW, h: pane.grid.h };
      get().updatePaneGrid(id, { ...pane.grid, w: halfW });
    } else {
      const halfH = Math.floor(pane.grid.h / 2);
      newGrid = { x: pane.grid.x, y: pane.grid.y + halfH, w: pane.grid.w, h: pane.grid.h - halfH };
      get().updatePaneGrid(id, { ...pane.grid, h: halfH });
    }
    const newPane: TerminalPane = { id: terminalId, projectId: project.id, title: pane.title + " (split)", cwd: pane.cwd, shell: pane.shell, grid: newGrid };
    set((s) => ({ panes: [...s.panes, newPane] }));
    get()._debouncedSave();
  },

  duplicatePane: async (id) => {
    const pane = get().panes.find((p) => p.id === id);
    if (!pane) return;
    await get().addPane(pane.cwd, pane.shell);
  },

  renamePane: (id, title) => {
    set((s) => ({ panes: s.panes.map((p) => (p.id === id ? { ...p, title } : p)) }));
    get()._debouncedSave();
  },

  removePane: async (id) => {
    await window.app.terminals.kill(id).catch(() => {});
    set((s) => ({ panes: s.panes.filter((p) => p.id !== id) }));
    get()._debouncedSave();
  },

  updatePaneGrid: (id, grid) => {
    set((s) => ({ panes: s.panes.map((p) => (p.id === id ? { ...p, grid } : p)) }));
    get()._debouncedSave();
  },

  _debouncedSave: () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const { currentProject, panes } = get();
      if (currentProject) {
        window.app.layouts.saveLayout(currentProject.id, { projectId: currentProject.id, panes, updatedAt: new Date().toISOString() });
      }
    }, 500);
  }
}));
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 7: Update Workspace.tsx, TopBar.tsx, App.tsx

### Workspace.tsx - replace content with WorkspaceGrid
```tsx
import { Sidebar } from "@renderer/shared/components/Sidebar";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";

export function Workspace(): React.JSX.Element {
  const project = useWorkspaceStore((s) => s.currentProject);
  const addPane = useWorkspaceStore((s) => s.addPane);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar projectPath={project?.path ?? ""} onOpenTerminal={(path) => addPane(path)} />
      <div className="flex-1 bg-aw-bg">
        <WorkspaceGrid />
      </div>
    </div>
  );
}
```

### TopBar.tsx - wire + Terminal button to workspaceStore.addPane
Add `onNewTerminal` prop, call `addPane(project.path)`.

### App.tsx - update lifecycle
When selecting project (from ProjectList), call `workspaceStore.openProject(project)`. When back, call `workspaceStore.closeProject()`.

---

## Task 8: Run verify Phase 3

Run: `pnpm dev`

- Open project -> terminal auto-creates at root (or restores layout if saved)
- + Terminal -> new pane appears
- Split Right/Down -> splits pane, new terminal same cwd
- Drag panes -> rearrange
- Resize -> terminals resize correctly
- Rename (double-click title)
- Close pane -> process killed
- Close project -> all terminals killed
- Reopen project -> layout restored, fresh terminals

---

## Phase 3 Acceptance Criteria

- [ ] Multiple terminal panes render in grid
- [ ] Split right/down works
- [ ] Drag/resize panes works
- [ ] Rename/close panes works
- [ ] Layout saved per project
- [ ] Layout restored on reopen (fresh terminals)
- [ ] Project A and B have separate layouts
