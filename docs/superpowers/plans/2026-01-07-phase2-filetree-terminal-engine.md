# Phase 2 — File Tree + Terminal Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Implement real file tree sidebar (lazy load, ignore folders) + real terminal engine using node-pty + xterm.js with IPC streaming. Wire top bar "+ Terminal" button and sidebar file tree.

**Architecture:** Main process spawns PTY processes, streams output via `webContents.send`. Renderer uses `useTerminal` hook to bridge xterm ↔ IPC. FileTree uses lazy loading with local cache, reading children only when folder expands. Context menu "Open Terminal Here" creates terminal at selected folder.

**Prerequisite:** Phase 0 + Phase 1 completed.

**Tech Stack:** Electron 39, node-pty, @xterm/xterm, @xterm/addon-fit, @xterm/addon-web-links, React 19.

**Spec reference:** `docs/superpowers/specs/2026-01-07-space-mint-phase1-design.md` (Sections 7, 9.3, 9.4, 10)

---

## File Structure Map

### Files to Create

| File | Responsibility |
|---|---|
| `src/main/services/FileTreeService.ts` | Read directory with ignore + sort |
| `src/main/services/TerminalService.ts` | PTY lifecycle, streaming |
| `src/main/ipc/file-tree.ipc.ts` | File tree IPC handlers |
| `src/main/ipc/terminal.ipc.ts` | Terminal IPC handlers |
| `src/renderer/src/features/file-tree/FileTree.tsx` | File tree container |
| `src/renderer/src/features/file-tree/FileTreeNode.tsx` | Single tree node with expand/collapse |
| `src/renderer/src/shared/hooks/useTerminal.ts` | xterm ↔ IPC bridge hook |
| `src/renderer/src/features/workspace/TerminalPane.tsx` | Terminal container + exit overlay |

### Files to Modify

| File | Change |
|---|---|
| `src/main/ipc/index.ts` | Register file-tree + terminal IPC |
| `src/main/index.ts` | Init FileTreeService, TerminalService, before-quit cleanup |
| `src/renderer/src/shared/components/Sidebar.tsx` | Replace placeholder with FileTree |
| `src/renderer/src/shared/components/TopBar.tsx` | Enable "+ Terminal" button |
| `src/renderer/src/features/workspace/Workspace.tsx` | Render TerminalPane, wire file tree callback |
| `src/renderer/src/stores/workspace.store.ts` | Add createTerminal method |
| `src/renderer/src/stores/settings.store.ts` | Expose settings for ignored folders |

---
## Task 1: Tạo FileTreeService (Main)

**Files:** Create `src/main/services/FileTreeService.ts`

```ts
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { FileTreeNode } from "@shared/types";

export class FileTreeService {
  constructor(private getIgnoredFolders: () => string[]) {}

  readDirectory(projectPath: string): FileTreeNode[] {
    return this.readChildren(projectPath);
  }

  readChildren(folderPath: string): FileTreeNode[] {
    const ignored = this.getIgnoredFolders();
    const entries = readdirSync(folderPath, { withFileTypes: true });
    return entries
      .filter((e) => !ignored.includes(e.name))
      .map((e) => ({
        name: e.name,
        path: join(folderPath, e.name),
        type: (e.isDirectory() ? "directory" : "file") as "directory" | "file"
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }
}
```

Verify: `pnpm typecheck:node` → PASS.

---
## Task 2: Tạo file-tree.ipc.ts (Main)

**Files:** Create `src/main/ipc/file-tree.ipc.ts`

```ts
import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { FileTreeService } from "../services/FileTreeService";

export function registerFileTreeIpc(fileTreeService: FileTreeService): void {
  ipcMain.handle(IPC.FILE_READ_DIRECTORY, (_event, projectPath: string) =>
    fileTreeService.readDirectory(projectPath)
  );
  ipcMain.handle(IPC.FILE_READ_CHILDREN, (_event, folderPath: string) =>
    fileTreeService.readChildren(folderPath)
  );
}
```

Verify: `pnpm typecheck:node` → PASS.

---

## Task 3: Tạo TerminalService (Main)

**Files:** Create `src/main/services/TerminalService.ts`

```ts
import { BrowserWindow } from "electron";
import { spawn, IPty } from "node-pty";
import { nanoid } from "nanoid";

interface TerminalEntry { pty: IPty; projectId: string; }

function detectDefaultShell(): string {
  if (process.platform === "win32") return process.env.COMSPEC || "powershell.exe";
  return process.env.SHELL || "/bin/bash";
}

export class TerminalService {
  private terminals = new Map<string, TerminalEntry>();
  private mainWindow: BrowserWindow | null = null;

  setWindow(window: BrowserWindow): void { this.mainWindow = window; }

  create(projectId: string, cwd: string, shell?: string): string {
    const resolvedShell = shell || detectDefaultShell();
    const pty = spawn(resolvedShell, [], { cwd, cols: 80, rows: 24, name: "xterm-256color" });
    const id = nanoid();
    this.terminals.set(id, { pty, projectId });
    pty.onData((data) => this.mainWindow?.webContents.send(`terminal:data:${id}`, data));
    pty.onExit(({ exitCode }) => {
      this.terminals.delete(id);
      this.mainWindow?.webContents.send(`terminal:exit:${id}`, { exitCode });
    });
    return id;
  }

  write(terminalId: string, data: string): void {
    this.terminals.get(terminalId)?.pty.write(data);
  }

  resize(terminalId: string, cols: number, rows: number): void {
    this.terminals.get(terminalId)?.pty.resize(cols, rows);
  }

  kill(terminalId: string): void {
    this.terminals.get(terminalId)?.pty.kill();
  }

  killByProject(projectId: string): void {
    for (const [id, entry] of this.terminals) {
      if (entry.projectId === projectId) { entry.pty.kill(); this.terminals.delete(id); }
    }
  }

  killAll(): void {
    for (const [, entry] of this.terminals) entry.pty.kill();
    this.terminals.clear();
  }
}
```

Verify: `pnpm typecheck:node` → PASS.

---

## Task 4: Tạo terminal.ipc.ts (Main)

**Files:** Create `src/main/ipc/terminal.ipc.ts`

```ts
import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { TerminalService } from "../services/TerminalService";

export function registerTerminalIpc(terminalService: TerminalService): void {
  ipcMain.handle(IPC.TERMINAL_CREATE, (_e, opts: { projectId: string; cwd: string; shell?: string }) =>
    ({ terminalId: terminalService.create(opts.projectId, opts.cwd, opts.shell) })
  );
  ipcMain.handle(IPC.TERMINAL_WRITE, (_e, opts: { terminalId: string; data: string }) =>
    terminalService.write(opts.terminalId, opts.data)
  );
  ipcMain.handle(IPC.TERMINAL_RESIZE, (_e, opts: { terminalId: string; cols: number; rows: number }) =>
    terminalService.resize(opts.terminalId, opts.cols, opts.rows)
  );
  ipcMain.handle(IPC.TERMINAL_KILL, (_e, terminalId: string) =>
    terminalService.kill(terminalId)
  );
}
```

Verify: `pnpm typecheck:node` → PASS.

---
## Task 5: Update ipc/index.ts — register file-tree + terminal IPC

**Files:** Modify `src/main/ipc/index.ts`

- [ ] **Step 1: Thay toàn bộ ipc/index.ts**

```ts
import type { ProjectService } from "../services/ProjectService";
import type { SettingsService } from "../services/SettingsService";
import type { FileTreeService } from "../services/FileTreeService";
import type { TerminalService } from "../services/TerminalService";
import { registerProjectIpc } from "./project.ipc";
import { registerSettingsIpc } from "./settings.ipc";
import { registerFileTreeIpc } from "./file-tree.ipc";
import { registerTerminalIpc } from "./terminal.ipc";

export function registerAllIpc(
  projectService: ProjectService,
  settingsService: SettingsService,
  fileTreeService: FileTreeService,
  terminalService: TerminalService
): void {
  registerProjectIpc(projectService);
  registerSettingsIpc(settingsService);
  registerFileTreeIpc(fileTreeService);
  registerTerminalIpc(terminalService);
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck:node` → PASS.

---




## Task 6: Update main/index.ts - init services + before-quit

**Files:** Modify `src/main/index.ts`

See full code in task description. Key changes from Phase 0:
- Add imports: FileTreeService, TerminalService
- Create FileTreeService with `() => settingsService.get().ignoredFolders`
- Create TerminalService, call `terminalService.setWindow(mainWindow)` in createWindow()
- Pass new services to registerAllIpc()
- Add `app.on("before-quit", () => terminalService?.killAll())`

Verify: `pnpm typecheck:node` -> PASS.

---

## Task 7: Tao FileTree + FileTreeNode (Renderer)

**Files:** Create `src/renderer/src/features/file-tree/FileTree.tsx` + `FileTreeNode.tsx`

### FileTreeNode.tsx
```tsx
import { useState } from "react";
import type { FileTreeNode as FileTreeNodeType } from "@shared/types";

interface Props {
  node: FileTreeNodeType;
  depth: number;
  onOpenTerminal: (path: string) => void;
}

export function FileTreeNode({ node, depth, onOpenTerminal }: Props): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileTreeNodeType[] | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = async (): Promise<void> => {
    if (node.type !== "directory") return;
    if (!expanded && children === null) {
      const loaded = await window.app.files.readChildren(node.path);
      setChildren(loaded);
    }
    setExpanded(!expanded);
  };

  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (node.type === "directory") setShowMenu(true);
  };

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-1 px-2 py-1 text-xs hover:bg-aw-bg-mute"
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={handleToggle}
        onContextMenu={handleContextMenu}
      >
        <span className="w-4 text-center">
          {node.type === "directory" ? (expanded ? "v" : ">") : " "}
        </span>
        <span className={node.type === "directory" ? "text-aw-accent" : "text-aw-text-soft"}>
          {node.name}
        </span>
      </div>
      {expanded && children?.map((c) => (
        <FileTreeNode key={c.path} node={c} depth={depth + 1} onOpenTerminal={onOpenTerminal} />
      ))}
      {showMenu && (
        <div className="fixed z-50 rounded border border-aw-border bg-aw-bg-soft p-1 shadow-lg"
             onClick={() => setShowMenu(false)}>
          <button className="block w-full px-3 py-1 text-left text-xs hover:bg-aw-bg-mute"
                  onClick={() => { onOpenTerminal(node.path); setShowMenu(false); }}>
            Open Terminal Here
          </button>
          <button className="block w-full px-3 py-1 text-left text-xs hover:bg-aw-bg-mute"
                  onClick={() => { navigator.clipboard.writeText(node.path); setShowMenu(false); }}>
            Copy Path
          </button>
        </div>
      )}
    </div>
  );
}
```

### FileTree.tsx
```tsx
import { useEffect, useState } from "react";
import type { FileTreeNode as FileTreeNodeType } from "@shared/types";
import { FileTreeNode } from "./FileTreeNode";

interface Props { projectPath: string; onOpenTerminal: (path: string) => void; }

export function FileTree({ projectPath, onOpenTerminal }: Props): React.JSX.Element {
  const [root, setRoot] = useState<FileTreeNodeType[]>([]);

  useEffect(() => {
    window.app.files.readDirectory(projectPath).then(setRoot).catch(console.error);
  }, [projectPath]);

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {root.map((node) => (
        <FileTreeNode key={node.path} node={node} depth={0} onOpenTerminal={onOpenTerminal} />
      ))}
    </div>
  );
}
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 8: Tao useTerminal hook (Renderer)

**Files:** Create `src/renderer/src/shared/hooks/useTerminal.ts`

```ts
import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

interface UseTerminalOptions {
  terminalId: string;
  fontSize: number;
  theme: "dark" | "light";
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseTerminalResult {
  terminal: Terminal | null;
  exitCode: number | null;
  restart: () => Promise<void>;
}

const DARK_THEME = { background: "#1b1b1f", foreground: "rgba(255,255,245,0.86)", cursor: "#6988e6" };
const LIGHT_THEME = { background: "#ffffff", foreground: "#1b1b1f", cursor: "#333" };

export function useTerminal({
  terminalId, fontSize, theme, containerRef
}: UseTerminalOptions): UseTerminalResult {
  const [exitCode, setExitCode] = useState<number | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const xtermTheme = theme === "dark" ? DARK_THEME : LIGHT_THEME;
    const term = new Terminal({ fontSize, theme: xtermTheme, cursorBlink: true });
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(container);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    const unsubData = window.app.terminals.onData(terminalId, (data) => term.write(data));
    const unsubExit = window.app.terminals.onExit(terminalId, ({ exitCode: code }) => {
      setExitCode(code);
    });

    const disposeTermData = term.onData((data) => window.app.terminals.write({ terminalId, data }));
    const disposeTermResize = term.onResize(({ cols, rows }) => {
      window.app.terminals.resize({ terminalId, cols, rows });
    });

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => fitAddon.fit(), 150);
    });
    resizeObserver.observe(container);

    return () => {
      unsubData();
      unsubExit();
      disposeTermData.dispose();
      disposeTermResize.dispose();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [terminalId, fontSize, theme, containerRef]);

  const restart = useCallback(async () => {
    // Kill current, create new - caller handles rebinding
    await window.app.terminals.kill(terminalId);
  }, [terminalId]);

  return { terminal: terminalRef.current, exitCode, restart };
}
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 9: Tao TerminalPane component (Renderer)

**Files:** Create `src/renderer/src/features/workspace/TerminalPane.tsx`

```tsx
import { useRef } from "react";
import { useTerminal } from "@renderer/shared/hooks/useTerminal";
import { useSettingsStore } from "@renderer/stores/settings.store";

interface Props {
  terminalId: string;
  cwd: string;
  onClose: () => void;
  onRestart: (terminalId: string, cwd: string) => void;
}

export function TerminalPane({ terminalId, cwd, onClose, onRestart }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const settings = useSettingsStore((s) => s.settings);
  const { exitCode, restart } = useTerminal({
    terminalId,
    fontSize: settings.terminalFontSize,
    theme: settings.terminalTheme,
    containerRef
  });

  const handleRestart = async (): Promise<void> => {
    await restart();
    onRestart(terminalId, cwd);
  };

  return (
    <div className="flex h-full flex-col bg-aw-bg">
      <div className="flex h-8 items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2">
        <span className="text-xs text-aw-text-soft">{cwd}</span>
        <div className="ml-auto flex gap-1">
          <button className="rounded px-2 py-0.5 text-xs text-aw-text-soft hover:bg-aw-bg-mute"
                  onClick={onClose}>x</button>
        </div>
      </div>
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full" />
        {exitCode !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="rounded-lg bg-aw-bg-soft p-4 text-center">
              <p className="mb-2 text-sm text-aw-text">
                Process exited with code {exitCode}
              </p>
              <div className="flex gap-2 justify-center">
                <button className="rounded bg-aw-accent px-3 py-1 text-xs"
                        onClick={handleRestart}>Restart</button>
                <button className="rounded bg-aw-bg-mute px-3 py-1 text-xs"
                        onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 10: Update Sidebar, TopBar, Workspace

**Files:** Modify Sidebar.tsx, TopBar.tsx, Workspace.tsx

### Sidebar.tsx - Replace placeholder with FileTree

```tsx
import { FileTree } from "@renderer/features/file-tree/FileTree";

interface Props { projectPath: string; onOpenTerminal: (path: string) => void; }

export function Sidebar({ projectPath, onOpenTerminal }: Props): React.JSX.Element {
  return (
    <div className="flex h-full w-64 flex-col border-r border-aw-border bg-aw-bg-soft">
      <div className="border-b border-aw-border px-3 py-2 text-xs font-semibold uppercase text-aw-text-soft">Files</div>
      <FileTree projectPath={projectPath} onOpenTerminal={onOpenTerminal} />
    </div>
  );
}
```

### TopBar.tsx - Enable + Terminal button

Update TopBar props: add `onNewTerminal` callback, remove `disabled` from the + Terminal button, wire onClick to onNewTerminal.

### Workspace.tsx - Render TerminalPane + wire file tree

```tsx
import { useState, useCallback } from "react";
import { Sidebar } from "@renderer/shared/components/Sidebar";
import { TerminalPane } from "./TerminalPane";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";

export function Workspace(): React.JSX.Element {
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const panes = useWorkspaceStore((s) => s.panes);
  const addPane = useWorkspaceStore((s) => s.addPane);
  const removePane = useWorkspaceStore((s) => s.removePane);
  const [nextId, setNextId] = useState(0);

  const handleOpenTerminal = useCallback((cwd: string) => {
    addPane(cwd);
  }, [addPane]);

  const handleClose = useCallback((id: string) => removePane(id), [removePane]);

  const handleRestart = useCallback((oldId: string, cwd: string) => {
    removePane(oldId);
    addPane(cwd);
  }, [removePane, addPane]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar projectPath={currentProject?.path ?? ""} onOpenTerminal={handleOpenTerminal} />
      <div className="flex-1 bg-aw-bg">
        {panes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-aw-text-soft">Click + Terminal to start</p>
          </div>
        ) : (
          panes.map((pane) => (
            <div key={pane.id} className="h-full">
              <TerminalPane terminalId={pane.id} cwd={pane.cwd} onClose={() => handleClose(pane.id)} onRestart={handleRestart} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 11: Update workspace.store.ts - addPane, removePane

**Files:** Modify `src/renderer/src/stores/workspace.store.ts`

Replace the addPane and removePane implementations:

```ts
addPane: async (cwd, shell?) => {
  const project = get().currentProject;
  if (!project) return;
  const { terminalId } = await window.app.terminals.createTerminal({
    projectId: project.id, cwd, shell
  });
  const pane: TerminalPane = {
    id: terminalId, projectId: project.id,
    title: cwd.split("/").pop() || cwd, cwd,
    shell: shell || "",
    grid: { x: 0, y: Infinity, w: 6, h: 8 }
  };
  set((state) => ({ panes: [...state.panes, pane] }));
},

removePane: async (id) => {
  await window.app.terminals.kill(id);
  set((state) => ({ panes: state.panes.filter((p) => p.id !== id) }));
},
```

The store should use `get` from zustand to access current state inside async actions:

```ts
import { create } from "zustand";
import type { Project, TerminalPane } from "@shared/types";

interface WorkspaceState {
  currentProject: Project | null;
  panes: TerminalPane[];
  setCurrentProject: (project: Project | null) => void;
  setPanes: (panes: TerminalPane[]) => void;
  addPane: (cwd: string, shell?: string) => Promise<void>;
  removePane: (id: string) => Promise<void>;
  updatePane: (id: string, partial: Partial<TerminalPane>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentProject: null,
  panes: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  setPanes: (panes) => set({ panes }),
  addPane: async (cwd, shell?) => {
    const project = get().currentProject;
    if (!project) return;
    const { terminalId } = await window.app.terminals.createTerminal({ projectId: project.id, cwd, shell });
    const pane: TerminalPane = { id: terminalId, projectId: project.id, title: cwd.split("/").pop() || cwd, cwd, shell: shell || "", grid: { x: 0, y: Infinity, w: 6, h: 8 } };
    set((state) => ({ panes: [...state.panes, pane] }));
  },
  removePane: async (id) => { await window.app.terminals.kill(id); set((state) => ({ panes: state.panes.filter((p) => p.id !== id) })); },
  updatePane: (id, partial) => set((state) => ({ panes: state.panes.map((p) => (p.id === id ? { ...p, ...partial } : p)) }))
}));
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 12: Run app verify Phase 2

Run: `pnpm dev`

- Click + Terminal -> terminal appears at project root
- Type commands (pnpm dev, git status, dir) -> output renders
- File tree shows project folders (no node_modules)
- Right-click folder -> Open Terminal Here -> terminal at that folder
- Close terminal -> process killed, pane removed
- Open 3+ terminals simultaneously -> all work
- Close app -> all processes killed (check Task Manager)

---

## Phase 2 Acceptance Criteria

- [ ] File tree loads with ignored folders filtered
- [ ] Expand/collapse folders with lazy load
- [ ] Right-click context menu: Open Terminal Here + Copy Path
- [ ] + Terminal creates real shell at project root
- [ ] Terminal input/output via xterm.js works
- [ ] Interactive CLI works (pnpm dev, git, etc.)
- [ ] Close pane kills process
- [ ] Close app kills all processes
- [ ] Before-quit handler cleans up PTY
- [ ] Shell auto-detection works (PowerShell on Windows)
