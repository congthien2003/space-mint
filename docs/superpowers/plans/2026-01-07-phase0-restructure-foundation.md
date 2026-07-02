# Phase 0 — Restructure & Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure project sang cấu trúc features/services/ipc, setup Tailwind + Zustand, đổi preload namespace sang `window.app.*`, và build app shell (top bar + sidebar + workspace skeleton) với dark theme.

**Architecture:** Electron 3-layer (Main / Preload / Renderer). Shared types đặt ở `src/shared/types/` chia sẻ giữa 3 process qua alias `@shared`. Renderer dùng Zustand cho state, Tailwind cho styling. App shell có 2 view: ProjectHome (chưa có project) và Workspace (top bar + sidebar + grid area).

**Tech Stack:** Electron 39, electron-vite, React 19, TypeScript 5.9, Tailwind CSS v3, Zustand, nanoid, clsx.

**Spec reference:** `docs/superpowers/specs/2026-01-07-space-mint-phase1-design.md` (Sections 2, 3, 4, 5, 6, 11)

---

## File Structure Map

### Files to Create

| File | Responsibility |
|---|---|
| `src/shared/types/project.ts` | Type `Project` |
| `src/shared/types/file-tree.ts` | Type `FileTreeNode` |
| `src/shared/types/terminal.ts` | Type `TerminalPane` |
| `src/shared/types/layout.ts` | Type `WorkspaceLayout` |
| `src/shared/types/settings.ts` | Type `AppSettings` + `DEFAULT_SETTINGS` |
| `src/shared/types/ipc.ts` | IPC channel names constant |
| `src/shared/types/index.ts` | Re-export all types |
| `src/main/store/AppStore.ts` | electron-store wrapper |
| `src/main/ipc/index.ts` | Gom register* functions |
| `src/main/ipc/project.ipc.ts` | Project IPC handlers |
| `src/main/ipc/settings.ipc.ts` | Settings IPC handlers |
| `src/main/services/ProjectService.ts` | Project service |
| `src/main/services/SettingsService.ts` | Settings service |
| `src/renderer/src/stores/projects.store.ts` | Zustand: projects list state |
| `src/renderer/src/stores/workspace.store.ts` | Zustand: currentProject + panes state |
| `src/renderer/src/stores/settings.store.ts` | Zustand: settings state |
| `src/renderer/src/app/App.tsx` | Root, routing Home ↔ Workspace |
| `src/renderer/src/features/projects/ProjectHome.tsx` | Màn home (placeholder) |
| `src/renderer/src/features/workspace/Workspace.tsx` | Workspace layout container |
| `src/renderer/src/shared/components/TopBar.tsx` | Top bar |
| `src/renderer/src/shared/components/Sidebar.tsx` | Sidebar container (placeholder) |
| `src/renderer/src/styles/globals.css` | Tailwind directives + theme variables |
| `tailwind.config.js` | Tailwind config |
| `postcss.config.js` | PostCSS config |

### Files to Modify

| File | Change |
|---|---|
| `src/main/index.ts` | Refactor: import services + registerIpc, dark theme window |
| `src/preload/index.ts` | Đổi namespace `window.api` → `window.app`, expose 5 namespace |
| `src/preload/index.d.ts` | Update type declaration cho `window.app` |
| `src/shared/types/global.d.ts` | Update reference sang `window.app` |
| `src/renderer/src/main.tsx` | Import globals.css thay main.css |
| `src/renderer/index.html` | Title "Space Mint" |
| `tsconfig.node.json` | Include `src/shared/**/*`, paths `@shared/*` |
| `tsconfig.web.json` | Include `src/shared/**/*`, paths `@shared/*` |
| `package.json` | Thêm zustand, tailwindcss, postcss, autoprefixer |

### Files to Delete

| File | Reason |
|---|---|
| `src/renderer/src/App.tsx` | Move sang `src/renderer/src/app/App.tsx` |
| `src/renderer/src/components/Versions.tsx` | Template demo, không dùng |
| `src/renderer/src/assets/*` | Template assets, thay bằng Tailwind |

---
## Task 1: Cài đặt dependencies (Tailwind + Zustand)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Cài zustand**

Run:
```bash
pnpm add zustand
```

Expected: `zustand` trong `dependencies` của package.json.

- [ ] **Step 2: Cài Tailwind + PostCSS + Autoprefixer**

Run:
```bash
pnpm add -D tailwindcss@3 postcss autoprefixer
```

Expected: `tailwindcss`, `postcss`, `autoprefixer` trong `devDependencies`.

> Dùng Tailwind v3 (không phải v4) vì v4 thay đổi lớn config. v3 ổn định với electron-vite.

- [ ] **Step 3: Init Tailwind config**

Run:
```bash
npx tailwindcss init -p
```

Expected: Tạo `tailwind.config.js` và `postcss.config.js` ở root.

- [ ] **Step 4: Verify**

Đọc `package.json`, confirm `zustand` trong dependencies và `tailwindcss`, `postcss`, `autoprefixer` trong devDependencies.

---

## Task 2: Cấu hình Tailwind

**Files:**
- Modify: `tailwind.config.js`
- Modify: `postcss.config.js`

- [ ] **Step 1: Cập nhật tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "aw-bg": "#1b1b1f",
        "aw-bg-soft": "#222222",
        "aw-bg-mute": "#282828",
        "aw-text": "rgba(255, 255, 245, 0.86)",
        "aw-text-soft": "rgba(235, 235, 245, 0.6)",
        "aw-border": "rgba(255, 255, 245, 0.12)",
        "aw-accent": "#6988e6"
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 2: Cập nhật postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

- [ ] **Step 3: Verify**

Run: `npx tailwindcss --help`
Expected: Hiển thị help text, không lỗi config.

---

## Task 3: Tạo shared types

**Files:**
- Create: `src/shared/types/project.ts`, `file-tree.ts`, `terminal.ts`, `layout.ts`, `settings.ts`, `ipc.ts`, `index.ts`

- [ ] **Step 1: Tạo project.ts**

```ts
export type Project = {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **Step 2: Tạo file-tree.ts**

```ts
export type FileTreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
};
```

- [ ] **Step 3: Tạo terminal.ts**

```ts
export type TerminalPane = {
  id: string;
  projectId: string;
  title: string;
  cwd: string;
  shell: string;
  grid: { x: number; y: number; w: number; h: number };
};
```

- [ ] **Step 4: Tạo layout.ts**

```ts
import type { TerminalPane } from "./terminal";

export type WorkspaceLayout = {
  projectId: string;
  panes: TerminalPane[];
  updatedAt: string;
};
```

- [ ] **Step 5: Tạo settings.ts**

```ts
export type AppSettings = {
  defaultShell: string;
  terminalFontSize: number;
  terminalTheme: "dark" | "light";
  ignoredFolders: string[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultShell: "",
  terminalFontSize: 14,
  terminalTheme: "dark",
  ignoredFolders: [
    "node_modules", ".git", "bin", "obj", "dist", "build",
    ".next", ".turbo", ".idea", ".vscode"
  ]
};
```

- [ ] **Step 6: Tạo ipc.ts**

```ts
export const IPC = {
  PROJECT_ADD: "project:add",
  PROJECT_GET_ALL: "project:get-all",
  PROJECT_GET: "project:get",
  PROJECT_REMOVE: "project:remove",
  PROJECT_SELECT_FOLDER: "project:select-folder",
  FILE_READ_DIRECTORY: "file:read-directory",
  FILE_READ_CHILDREN: "file:read-children",
  TERMINAL_CREATE: "terminal:create",
  TERMINAL_WRITE: "terminal:write",
  TERMINAL_RESIZE: "terminal:resize",
  TERMINAL_KILL: "terminal:kill",
  TERMINAL_DATA: "terminal:data",
  TERMINAL_EXIT: "terminal:exit",
  LAYOUT_GET: "layout:get",
  LAYOUT_SAVE: "layout:save",
  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update"
} as const;
```

- [ ] **Step 7: Tạo index.ts re-export**

```ts
export type { Project } from "./project";
export type { FileTreeNode } from "./file-tree";
export type { TerminalPane } from "./terminal";
export type { WorkspaceLayout } from "./layout";
export type { AppSettings } from "./settings";
export { DEFAULT_SETTINGS } from "./settings";
export { IPC } from "./ipc";
```

- [ ] **Step 8: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---
## Task 4: Cập nhật tsconfig để include shared types

**Files:**
- Modify: `tsconfig.node.json`
- Modify: `tsconfig.web.json`

- [ ] **Step 1: Cập nhật tsconfig.node.json**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.node.json",
  "include": [
    "electron.vite.config.*",
    "src/main/**/*",
    "src/preload/**/*",
    "src/shared/**/*"
  ],
  "compilerOptions": {
    "composite": true,
    "types": ["electron-vite/node"],
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@main/*": ["./src/main/*"]
    }
  }
}
```

- [ ] **Step 2: Cập nhật tsconfig.web.json**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.web.json",
  "include": [
    "src/renderer/src/env.d.ts",
    "src/renderer/src/**/*",
    "src/renderer/src/**/*.tsx",
    "src/renderer/src/**/*.d.ts",
    "src/preload/*.d.ts",
    "src/shared/**/*"
  ],
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "paths": {
      "@renderer/*": ["./src/renderer/src/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: PASS.

---

## Task 5: Tạo AppStore (electron-store wrapper)

**Files:**
- Create: `src/main/store/AppStore.ts`

- [ ] **Step 1: Tạo AppStore.ts**

```ts
import Store from "electron-store";
import type { Project, WorkspaceLayout, AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";

type StoreSchema = {
  projects: Project[];
  layouts: Record<string, WorkspaceLayout>;
  settings: AppSettings;
};

export class AppStore {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      defaults: {
        projects: [],
        layouts: {},
        settings: DEFAULT_SETTINGS
      }
    });
  }

  get<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
    return this.store.get(key);
  }

  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
    this.store.set(key, value);
  }
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---

## Task 6: Tạo services (ProjectService, SettingsService)

**Files:**
- Create: `src/main/services/ProjectService.ts`
- Create: `src/main/services/SettingsService.ts`

- [ ] **Step 1: Tạo ProjectService.ts**

```ts
import { existsSync } from "node:fs";
import { basename } from "node:path";
import { nanoid } from "nanoid";
import type { Project } from "@shared/types";
import type { AppStore } from "../store/AppStore";

export class ProjectService {
  constructor(private store: AppStore) {}

  addProject(path: string): Project {
    if (!existsSync(path)) {
      throw new Error(`Project path does not exist: ${path}`);
    }
    const now = new Date().toISOString();
    const project: Project = {
      id: nanoid(),
      name: basename(path),
      path,
      createdAt: now,
      updatedAt: now
    };
    const projects = this.store.get("projects");
    this.store.set("projects", [...projects, project]);
    return project;
  }

  getAll(): Project[] {
    return this.store.get("projects");
  }

  get(id: string): Project | null {
    return this.store.get("projects").find((p) => p.id === id) ?? null;
  }

  remove(id: string): void {
    const projects = this.store.get("projects");
    this.store.set("projects", projects.filter((p) => p.id !== id));
  }
}
```

- [ ] **Step 2: Tạo SettingsService.ts**

```ts
import type { AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";
import type { AppStore } from "../store/AppStore";

export class SettingsService {
  constructor(private store: AppStore) {}

  get(): AppSettings {
    const stored = this.store.get("settings");
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  update(partial: Partial<AppSettings>): AppSettings {
    const current = this.get();
    const updated = { ...current, ...partial };
    this.store.set("settings", updated);
    return updated;
  }
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---
## Task 7: Tạo IPC handlers

**Files:**
- Create: `src/main/ipc/project.ipc.ts`
- Create: `src/main/ipc/settings.ipc.ts`
- Create: `src/main/ipc/index.ts`

- [ ] **Step 1: Tạo project.ipc.ts**

```ts
import { ipcMain, dialog } from "electron";
import { IPC } from "@shared/types";
import type { ProjectService } from "../services/ProjectService";

export function registerProjectIpc(projectService: ProjectService): void {
  ipcMain.handle(IPC.PROJECT_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle(IPC.PROJECT_ADD, (_event, path: string) => {
    return projectService.addProject(path);
  });

  ipcMain.handle(IPC.PROJECT_GET_ALL, () => {
    return projectService.getAll();
  });

  ipcMain.handle(IPC.PROJECT_GET, (_event, id: string) => {
    return projectService.get(id);
  });

  ipcMain.handle(IPC.PROJECT_REMOVE, (_event, id: string) => {
    projectService.remove(id);
  });
}
```

- [ ] **Step 2: Tạo settings.ipc.ts**

```ts
import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { AppSettings } from "@shared/types";
import type { SettingsService } from "../services/SettingsService";

export function registerSettingsIpc(settingsService: SettingsService): void {
  ipcMain.handle(IPC.SETTINGS_GET, () => {
    return settingsService.get();
  });

  ipcMain.handle(IPC.SETTINGS_UPDATE, (_event, partial: Partial<AppSettings>) => {
    return settingsService.update(partial);
  });
}
```

- [ ] **Step 3: Tạo ipc/index.ts**

```ts
import type { ProjectService } from "../services/ProjectService";
import type { SettingsService } from "../services/SettingsService";
import { registerProjectIpc } from "./project.ipc";
import { registerSettingsIpc } from "./settings.ipc";

export function registerAllIpc(
  projectService: ProjectService,
  settingsService: SettingsService
): void {
  registerProjectIpc(projectService);
  registerSettingsIpc(settingsService);
}
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---
## Task 8: Refactor main/index.ts

**Files:**
- Modify: `src/main/index.ts`

- [ ] **Step 1: Thay toàn bộ nội dung main/index.ts**

```ts
import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { AppStore } from "./store/AppStore";
import { ProjectService } from "./services/ProjectService";
import { SettingsService } from "./services/SettingsService";
import { registerAllIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: "Space Mint",
    backgroundColor: "#1b1b1f",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.spacemint.app");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const appStore = new AppStore();
  const projectService = new ProjectService(appStore);
  const settingsService = new SettingsService(appStore);

  registerAllIpc(projectService, settingsService);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---
## Task 9: Refactor preload sang window.app namespace

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/preload/index.d.ts`
- Modify: `src/shared/types/global.d.ts`

- [ ] **Step 1: Thay toàn bộ preload/index.ts**

```ts
import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { IPC } from "@shared/types";
import type { Project, AppSettings, WorkspaceLayout, FileTreeNode } from "@shared/types";

const app = {
  projects: {
    selectFolder: (): Promise<string | null> =>
      ipcRenderer.invoke(IPC.PROJECT_SELECT_FOLDER),
    addProject: (path: string): Promise<Project> =>
      ipcRenderer.invoke(IPC.PROJECT_ADD, path),
    getProjects: (): Promise<Project[]> =>
      ipcRenderer.invoke(IPC.PROJECT_GET_ALL),
    getProject: (id: string): Promise<Project | null> =>
      ipcRenderer.invoke(IPC.PROJECT_GET, id),
    removeProject: (id: string): Promise<void> =>
      ipcRenderer.invoke(IPC.PROJECT_REMOVE, id)
  },

  files: {
    readDirectory: (projectPath: string): Promise<FileTreeNode[]> =>
      ipcRenderer.invoke(IPC.FILE_READ_DIRECTORY, projectPath),
    readChildren: (folderPath: string): Promise<FileTreeNode[]> =>
      ipcRenderer.invoke(IPC.FILE_READ_CHILDREN, folderPath)
  },

  terminals: {
    createTerminal: (opts: {
      projectId: string;
      cwd: string;
      shell?: string;
    }): Promise<{ terminalId: string }> =>
      ipcRenderer.invoke(IPC.TERMINAL_CREATE, opts),
    write: (opts: { terminalId: string; data: string }): Promise<void> =>
      ipcRenderer.invoke(IPC.TERMINAL_WRITE, opts),
    resize: (opts: {
      terminalId: string;
      cols: number;
      rows: number;
    }): Promise<void> => ipcRenderer.invoke(IPC.TERMINAL_RESIZE, opts),
    kill: (terminalId: string): Promise<void> =>
      ipcRenderer.invoke(IPC.TERMINAL_KILL, terminalId),
    onData: (
      terminalId: string,
      callback: (data: string) => void
    ): (() => void) => {
      const channel = `${IPC.TERMINAL_DATA}:${terminalId}`;
      const handler = (_event: unknown, data: string): void => callback(data);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    },
    onExit: (
      terminalId: string,
      callback: (e: { exitCode: number }) => void
    ): (() => void) => {
      const channel = `${IPC.TERMINAL_EXIT}:${terminalId}`;
      const handler = (_event: unknown, e: { exitCode: number }): void =>
        callback(e);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    }
  },

  layouts: {
    getLayout: (projectId: string): Promise<WorkspaceLayout | null> =>
      ipcRenderer.invoke(IPC.LAYOUT_GET, projectId),
    saveLayout: (
      projectId: string,
      layout: WorkspaceLayout
    ): Promise<void> => ipcRenderer.invoke(IPC.LAYOUT_SAVE, projectId, layout)
  },

  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
    update: (partial: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke(IPC.SETTINGS_UPDATE, partial)
  }
};

export type AppApi = typeof app;

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("app", app);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.app = app;
}
```

- [ ] **Step 2: Thay toàn bộ preload/index.d.ts**

```ts
import { ElectronAPI } from "@electron-toolkit/preload";
import type { AppApi } from "./index";

declare global {
  interface Window {
    electron: ElectronAPI;
    app: AppApi;
  }
}
```

- [ ] **Step 3: Thay toàn bộ shared/types/global.d.ts**

```ts
import type { AppApi } from "../../preload";

declare global {
  interface Window {
    app: AppApi;
  }
}

export {};
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`
Expected: PASS.

---
## Task 10: Tạo globals.css + Tailwind theme

**Files:**
- Create: `src/renderer/src/styles/globals.css`

- [ ] **Step 1: Tạo globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html,
  body,
  #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: #1b1b1f;
    color: rgba(255, 255, 245, 0.86);
    font-family:
      Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    user-select: none;
  }
}

.xterm .xterm-viewport {
  overflow-y: auto;
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:web`
Expected: PASS.

---

## Task 11: Tạo Zustand stores

**Files:**
- Create: `src/renderer/src/stores/projects.store.ts`
- Create: `src/renderer/src/stores/workspace.store.ts`
- Create: `src/renderer/src/stores/settings.store.ts`

- [ ] **Step 1: Tạo projects.store.ts**

```ts
import { create } from "zustand";
import type { Project } from "@shared/types";

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  addProject: (path: string) => Promise<Project | null>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  loadProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await window.app.projects.getProjects();
      set({ projects, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  addProject: async (path) => {
    try {
      const project = await window.app.projects.addProject(path);
      set((state) => ({ projects: [...state.projects, project] }));
      return project;
    } catch (err) {
      set({ error: String(err) });
      return null;
    }
  },

  removeProject: async (id) => {
    try {
      await window.app.projects.removeProject(id);
      set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    } catch (err) {
      set({ error: String(err) });
    }
  }
}));
```

- [ ] **Step 2: Tạo workspace.store.ts (skeleton, full logic ở Phase 3)**

```ts
import { create } from "zustand";
import type { Project, TerminalPane } from "@shared/types";

interface WorkspaceState {
  currentProject: Project | null;
  panes: TerminalPane[];

  setCurrentProject: (project: Project | null) => void;
  setPanes: (panes: TerminalPane[]) => void;
  addPane: (pane: TerminalPane) => void;
  removePane: (id: string) => void;
  updatePane: (id: string, partial: Partial<TerminalPane>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentProject: null,
  panes: [],

  setCurrentProject: (project) => set({ currentProject: project }),
  setPanes: (panes) => set({ panes }),
  addPane: (pane) => set((state) => ({ panes: [...state.panes, pane] })),
  removePane: (id) =>
    set((state) => ({ panes: state.panes.filter((p) => p.id !== id) })),
  updatePane: (id, partial) =>
    set((state) => ({
      panes: state.panes.map((p) => (p.id === id ? { ...p, ...partial } : p))
    }))
}));
```

- [ ] **Step 3: Tạo settings.store.ts**

```ts
import { create } from "zustand";
import type { AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";

interface SettingsState {
  settings: AppSettings;
  loading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const settings = await window.app.settings.get();
      set({ settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateSettings: async (partial) => {
    try {
      const updated = await window.app.settings.update(partial);
      set({ settings: updated });
    } catch {
      // ignore for now
    }
  }
}));
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck:web`
Expected: PASS.

---
## Task 12: Tạo app shell components

**Files:**
- Create: `src/renderer/src/shared/components/TopBar.tsx`
- Create: `src/renderer/src/shared/components/Sidebar.tsx`
- Create: `src/renderer/src/features/projects/ProjectHome.tsx`
- Create: `src/renderer/src/features/workspace/Workspace.tsx`

- [ ] **Step 1: Tạo TopBar.tsx**

```tsx
import clsx from "clsx";
import type { Project } from "@shared/types";

interface TopBarProps {
  project: Project | null;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function TopBar({ project, onBack, onOpenSettings }: TopBarProps): React.JSX.Element {
  return (
    <div className="flex h-12 items-center gap-3 border-b border-aw-border bg-aw-bg-soft px-4">
      {project ? (
        <>
          <button
            className="rounded px-2 py-1 text-sm text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text"
            onClick={onBack}
          >
            ← Projects
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-aw-text">{project.name}</span>
            <span className="text-xs text-aw-text-soft">{project.path}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className={clsx(
                "rounded px-3 py-1 text-sm",
                "bg-aw-accent text-white hover:opacity-90"
              )}
              disabled
              title="Available in Phase 2"
            >
              + Terminal
            </button>
            <button
              className="rounded px-2 py-1 text-sm text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text"
              onClick={onOpenSettings}
            >
              ⚙ Settings
            </button>
          </div>
        </>
      ) : (
        <span className="text-sm font-semibold text-aw-text">Space Mint</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Tạo Sidebar.tsx (placeholder)**

```tsx
export function Sidebar(): React.JSX.Element {
  return (
    <div className="flex h-full w-64 flex-col border-r border-aw-border bg-aw-bg-soft">
      <div className="border-b border-aw-border px-3 py-2 text-xs font-semibold uppercase text-aw-text-soft">
        Files
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 text-sm text-aw-text-soft">
        <p className="px-2 py-4 text-center text-xs">
          File tree will appear here (Phase 2)
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Tạo ProjectHome.tsx (placeholder)**

```tsx
export function ProjectHome(): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-lg font-semibold text-aw-text">Space Mint</h2>
        <p className="mb-6 text-sm text-aw-text-soft">No project added yet.</p>
        <p className="text-xs text-aw-text-soft">
          Project management UI coming in Phase 1
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Tạo Workspace.tsx (skeleton)**

```tsx
import { Sidebar } from "@renderer/shared/components/Sidebar";

export function Workspace(): React.JSX.Element {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 items-center justify-center bg-aw-bg">
        <p className="text-sm text-aw-text-soft">
          Terminal workspace will appear here (Phase 2)
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm typecheck:web`
Expected: PASS.

---
## Task 13: Tạo App.tsx + main.tsx + cleanup template

**Files:**
- Create: `src/renderer/src/app/App.tsx`
- Modify: `src/renderer/src/main.tsx`
- Delete: `src/renderer/src/App.tsx`, `src/renderer/src/components/`, `src/renderer/src/assets/`
- Modify: `src/renderer/index.html`

- [ ] **Step 1: Tạo app/App.tsx (root routing)**

```tsx
import { useEffect, useState } from "react";
import { TopBar } from "@renderer/shared/components/TopBar";
import { ProjectHome } from "@renderer/features/projects/ProjectHome";
import { Workspace } from "@renderer/features/workspace/Workspace";
import { useProjectsStore } from "@renderer/stores/projects.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useSettingsStore } from "@renderer/stores/settings.store";

export function App(): React.JSX.Element {
  const [showSettings, setShowSettings] = useState(false);
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const setCurrentProject = useWorkspaceStore((s) => s.setCurrentProject);
  const loadProjects = useProjectsStore((s) => s.loadProjects);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, [loadProjects, loadSettings]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        project={currentProject}
        onBack={() => setCurrentProject(null)}
        onOpenSettings={() => setShowSettings(true)}
      />
      {currentProject ? <Workspace /> : <ProjectHome />}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="rounded-lg bg-aw-bg-soft p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-aw-text-soft">
              Settings panel coming in Phase 4
            </p>
            <button
              className="mt-4 rounded bg-aw-bg-mute px-3 py-1 text-sm text-aw-text hover:opacity-80"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Thay toàn bộ main.tsx**

```tsx
import "./styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: Xóa template files cũ**

```bash
Remove-Item src/renderer/src/App.tsx
Remove-Item -Recurse src/renderer/src/components
Remove-Item -Recurse src/renderer/src/assets
```

Expected: Files deleted, không còn folder `components/` và `assets/`.

- [ ] **Step 4: Cập nhật index.html title**

Thay `<title>Electron</title>` thành `<title>Space Mint</title>`. Giữ nguyên phần còn lại (CSP, root div, script).

- [ ] **Step 5: Verify**

Run: `pnpm typecheck`
Expected: PASS, không lỗi "Cannot find module".

---

## Task 14: Run app để verify Phase 0

**Files:** (none — verification only)

- [ ] **Step 1: Run dev mode**

Run:
```bash
pnpm dev
```

Expected:
- Electron window mở với dark background (#1b1b1f)
- Top bar hiển thị "Space Mint"
- Body hiển thị "Space Mint" + "No project added yet."
- Không có console error trong DevTools (F12)

- [ ] **Step 2: Verify IPC hoạt động**

Trong DevTools console:
```js
await window.app.projects.getProjects()
```
Expected: Trả về `[]`.

```js
await window.app.settings.get()
```
Expected: Trả về object với default settings (fontSize 14, theme dark, ignoredFolders array).

- [ ] **Step 3: Đóng app, verify không crash**

Đóng window. Expected: process exit sạch, không error trong terminal.

---

## Phase 0 Acceptance Criteria

- [ ] App mở được trên local với dark theme.
- [ ] Top bar hiển thị.
- [ ] `window.app.*` namespace hoạt động (projects, settings).
- [ ] Renderer giao tiếp được với main process qua preload.
- [ ] Không expose Node API trực tiếp ra renderer.
- [ ] Tailwind CSS hoạt động (classes render đúng).
- [ ] Zustand stores khởi tạo được.
- [ ] Template electron-vite cũ đã dọn sạch.
- [ ] Shared types compile và import được ở cả main lẫn renderer.







