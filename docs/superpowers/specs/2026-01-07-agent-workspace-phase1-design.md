# Agent Workspace — Phase 1 Design

- **Ngày:** 2026-01-07
- **Trạng thái:** Approved (design review)
- **Nguồn yêu cầu:** `docs/project-overview.md`

## 1. Mục tiêu

Xây dựng desktop app Electron cho developer quản lý nhiều project local và chạy nhiều terminal/AI CLI agent trong workspace dạng grid.

Phase 1 là MVP:

> Project-based multi-terminal workspace manager for developers using CLI tools and AI coding agents.

Phase 1 không phải IDE, không phải AI agent platform, không phải VS Code replacement. Phase 1 chỉ tập trung làm terminal workspace thật mượt và ổn định.

## 2. Quyết định kỹ thuật

| Quyết định | Chọn | Lý do |
|---|---|---|
| Cấu trúc folder | Restructure hoàn toàn theo `project-overview.md` (features/services/ipc) | Ranh giới rõ, dễ mở rộng Phase 2+ |
| Styling | Tailwind CSS | Nhanh cho UI, phù hợp MVP |
| State management (Renderer) | Zustand | Lightweight, không boilerplate, phù hợp terminal workspace |
| Package manager | pnpm | Đã có lock file, khớp overview |
| Preload API namespace | `window.app.*` | Theo overview, thay `window.api.*` hiện tại |

## 3. Phân chia Phase (Hướng C)

Gom 7 milestones trong overview thành 5 phase deliverable độc lập:

| Phase | Nội dung | Milestone tương ứng |
|---|---|---|
| **Phase 0** | Restructure & Foundation: restructure folder, setup Tailwind + Zustand, đổi preload namespace `window.app.*`, app shell (top bar + sidebar + workspace skeleton), dark theme | Milestone 1 |
| **Phase 1** | Project Management: add/remove/select project, recent projects, local store (electron-store) | Milestone 2 |
| **Phase 2** | File Tree + Terminal Engine: file tree sidebar (lazy load, ignore folders) + terminal thật bằng node-pty + xterm.js + IPC streaming | Milestone 3 + 4 |
| **Phase 3** | Workspace Grid + Layout Persistence: react-grid-layout, split/resize/rename/duplicate/close, save/restore layout per project | Milestone 5 + 6 |
| **Phase 4** | Settings + Polish: settings UI (shell/font/theme/ignored folders), error handling, terminal exit state, process cleanup, live apply settings | Milestone 7 + polish |

Mỗi phase có thể verify bằng cách run app (`pnpm dev`).


## 4. Kiến trúc tổng thể

### 4.1 Kiến trúc 3-layer

```text
┌─────────────────────────────────────────────────┐
│  Renderer (React UI)                             │
│  ├─ Zustand stores (workspace/projects/settings) │
│  ├─ Hooks gọi window.app.* qua preload            │
│  └─ Chỉ lo UI + state cục bộ                      │
├─────────────────────────────────────────────────┤
│  Preload (Safe Bridge)                            │
│  └─ Expose window.app.{projects,files,           │
│      terminals,layouts,settings}                  │
│      contextIsolation=true, nodeIntegration=false │
├─────────────────────────────────────────────────┤
│  Main Process (Node.js + Electron)               │
│  ├─ Services (business logic, không biết UI)     │
│  ├─ IPC Handlers (điều phối, validate)            │
│  └─ AppStore (electron-store wrapper)            │
└─────────────────────────────────────────────────┘
```

### 4.2 Quy tắc ranh giới

- **Renderer** không bao giờ gọi Node API trực tiếp. Tất cả qua `window.app.*`.
- **Preload** chỉ forward IPC, không chứa logic.
- **Services** trong Main chỉ chứa logic thuần (filesystem, PTY, store). Services không import Electron — chỉ Main `index.ts` và IPC handlers gọi Electron.
- **IPC Handlers** là lớp điều phối: validate input → gọi service → return/throw.

### 4.3 Cấu trúc folder

```text
src/
├── main/
│   ├── index.ts                    # App entry, BrowserWindow, lifecycle
│   ├── ipc/
│   │   ├── index.ts                # Gom tất cả register*(), gọi 1 lần
│   │   ├── project.ipc.ts
│   │   ├── file-tree.ipc.ts
│   │   ├── terminal.ipc.ts
│   │   ├── layout.ipc.ts
│   │   └── settings.ipc.ts
│   ├── services/
│   │   ├── ProjectService.ts
│   │   ├── FileTreeService.ts
│   │   ├── TerminalService.ts
│   │   ├── LayoutService.ts
│   │   └── SettingsService.ts
│   └── store/
│       └── AppStore.ts             # electron-store wrapper, shared instance
│
├── preload/
│   └── index.ts                    # Expose window.app.* API bridge
│
├── renderer/
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   └── App.tsx             # Root, routing giữa Home ↔ Workspace
│       ├── features/
│       │   ├── projects/
│       │   │   ├── ProjectHome.tsx
│       │   │   ├── ProjectList.tsx
│       │   │   └── AddProjectButton.tsx
│       │   ├── file-tree/
│       │   │   ├── FileTree.tsx
│       │   │   └── FileTreeNode.tsx
│       │   ├── workspace/
│       │   │   ├── Workspace.tsx
│       │   │   ├── WorkspaceGrid.tsx
│       │   │   ├── TerminalPane.tsx
│       │   │   └── TerminalHeader.tsx
│       │   └── settings/
│       │       └── SettingsPanel.tsx
│       ├── stores/
│       │   ├── workspace.store.ts    # Zustand: currentProject, panes, layouts
│       │   ├── projects.store.ts     # Zustand: projects list
│       │   └── settings.store.ts     # Zustand: settings
│       ├── shared/
│       │   ├── hooks/
│       │   │   └── useTerminal.ts    # Hook bridge xterm ↔ IPC
│       │   └── components/
│       │       ├── TopBar.tsx
│       │       └── Sidebar.tsx
│       └── styles/
│           └── globals.css          # Tailwind directives + theme vars
│
└── shared/
    └── types/
        ├── project.ts
        ├── file-tree.ts
        ├── terminal.ts
        ├── layout.ts
        ├── settings.ts
        └── ipc.ts                  # Shared IPC channel names + payload types
```

Lưu ý:

- `src/shared/types/` chứa data models chia sẻ giữa Main, Preload, Renderer. Đặt ở đây vì cả 3 process đều alias `@shared`.
- Types chỉ là type definitions, import được ở mọi nơi, không chứa logic.
- Zustand stores đặt trong `renderer/src/stores/`, không pha với logic UI.

## 5. Data Model

Tất cả type đặt trong `src/shared/types/`, chia sẻ giữa 3 process.

```ts
// project.ts
export type Project = {
  id: string;
  name: string;
  path: string;
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
};

// file-tree.ts
export type FileTreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
};

// terminal.ts
export type TerminalPane = {
  id: string;
  projectId: string;
  title: string;
  cwd: string;
  shell: string;
  grid: { x: number; y: number; w: number; h: number };
};

// layout.ts
export type WorkspaceLayout = {
  projectId: string;
  panes: TerminalPane[];
  updatedAt: string;
};

// settings.ts
export type AppSettings = {
  defaultShell: string;          // auto-detect if empty
  terminalFontSize: number;      // default 14
  terminalTheme: "dark" | "light"; // default "dark"
  ignoredFolders: string[];
};
```

### 5.1 Default settings

```ts
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

## 6. IPC API Design

### 6.1 Channel naming convention

Pattern: `<domain>:<action>`. Request/response dùng `ipcRenderer.invoke` / `ipcMain.handle`. Stream events (main → renderer) dùng `webContents.send` / `ipcRenderer.on`.

Tất cả channel names định nghĩa trong `src/shared/types/ipc.ts` để tránh typo:

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
  TERMINAL_DATA: "terminal:data",   // main → renderer stream
  TERMINAL_EXIT: "terminal:exit",   // main → renderer stream

  LAYOUT_GET: "layout:get",
  LAYOUT_SAVE: "layout:save",

  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update"
} as const;
```

### 6.2 Preload API (`window.app.*`)

Preload expose object `app` với 5 namespace. Renderer chỉ thấy API này qua type inference (AppApi).

```ts
window.app = {
  projects: {
    selectFolder: () => Promise<string | null>,
    addProject: (path: string) => Promise<Project>,
    getProjects: () => Promise<Project[]>,
    getProject: (id: string) => Promise<Project | null>,
    removeProject: (id: string) => Promise<void>,
  },
  files: {
    readDirectory: (projectPath: string) => Promise<FileTreeNode[]>,
    readChildren: (folderPath: string) => Promise<FileTreeNode[]>,
  },
  terminals: {
    createTerminal: (opts: {
      projectId: string;
      cwd: string;
      shell?: string;
    }) => Promise<{ terminalId: string }>,
    write: (opts: { terminalId: string; data: string }) => Promise<void>,
    resize: (opts: { terminalId: string; cols: number; rows: number }) => Promise<void>,
    kill: (terminalId: string) => Promise<void>,
    onData: (terminalId: string, callback: (data: string) => void) => () => void,
    onExit: (terminalId: string, callback: (e: { exitCode: number }) => void) => () => void,
  },
  layouts: {
    getLayout: (projectId: string) => Promise<WorkspaceLayout | null>,
    saveLayout: (projectId: string, layout: WorkspaceLayout) => Promise<void>,
  },
  settings: {
    get: () => Promise<AppSettings>,
    update: (settings: Partial<AppSettings>) => Promise<AppSettings>,
  }
};
```

### 6.3 Quy ước onData / onExit

`onData` và `onExit` trả về hàm unsubscribe để renderer cleanup khi pane unmount — tránh memory leak listener. Stream events dùng channel dạng `terminal:data:{terminalId}` và `terminal:exit:{terminalId}` để renderer subscribe chính xác terminal đó, không nhận data của terminal khác.

### 6.4 Error contract

Mọi `invoke` throw Error nếu fail. Preload forward nguyên vẹn. Renderer catch bằng try/catch trong hook/store, hiển thị error UI.


## 7. Terminal Engine

### 7.1 TerminalService (Main Process)

Quản lý PTY processes trong memory. Không persist — chỉ sống khi app chạy.

```ts
private terminals: Map<string, {
  pty: IPty;
  projectId: string;
}>;
```

Lifecycle methods:

| Method | Chức năng |
|---|---|
| `create(projectId, cwd, shell)` | Spawn PTY bằng `node-pty.spawn(shell, [], { cwd, cols, rows })`. Sinh `terminalId` bằng `nanoid()`. Lưu vào map. Setup `pty.onData` → forward qua IPC `terminal:data:{terminalId}`. Setup `pty.onExit` → cleanup + forward `terminal:exit:{terminalId}`. |
| `write(terminalId, data)` | `pty.write(data)` — input từ renderer. |
| `resize(terminalId, cols, rows)` | `pty.resize(cols, rows)` — từ addon-fit. |
| `kill(terminalId)` | `pty.kill()` + xóa khỏi map. |
| `killByProject(projectId)` | Kill tất cả PTY của project (khi close project). |
| `killAll()` | Kill toàn bộ PTY (khi app quit). |

### 7.2 Data flow: input & output

```text
┌─ Renderer ──────────────────────────────┐
│ xterm.js Terminal instance               │
│   ├─ onData(data) → window.app.terminals.write({terminalId, data})
│   ├─ onResize({cols,rows}) → window.app.terminals.resize(...)
│   └─ onData callback ← terminal:data event (IPC)
└──────────────────────────────────────────┘
          ▲ IPC (preload forward)  ▼
┌─ Main Process ──────────────────────────┐
│ TerminalService                          │
│   ├─ pty.onData(output) → send terminal:data:{terminalId}
│   └─ write()/resize() → pty.write()/pty.resize()
└──────────────────────────────────────────┘
```

### 7.3 Shell auto-detection (Phase 1)

```ts
function detectDefaultShell(): string {
  if (process.platform === "win32") {
    return process.env.COMSPEC || "powershell.exe";
  }
  return process.env.SHELL || "/bin/bash";
}
```

Nếu settings `defaultShell` rỗng → dùng detected. Nếu user set shell cụ thể → dùng shell đó.

### 7.4 useTerminal Hook (Renderer)

Hook bridge giữa xterm.js instance và IPC. Mỗi TerminalPane mount 1 hook.

```ts
function useTerminal(opts: {
  terminalId: string;
  fontSize: number;
  theme: "dark" | "light";
  containerRef: RefObject<HTMLDivElement>;
}): {
  terminal: Terminal | null;
  exitCode: number | null;   // null = đang chạy
  restart: () => Promise<void>;
};
```

Trong hook:

1. Tạo `new Terminal({ fontSize, theme })` + `FitAddon` + `WebLinksAddon`.
2. `terminal.open(container)` → `fitAddon.fit()`.
3. `window.app.terminals.onData(terminalId, (data) => terminal.write(data))` → lưu unsubscribe.
4. `window.app.terminals.onExit(terminalId, (e) => setExitCode(e.exitCode))`.
5. `terminal.onData((data) => window.app.terminals.write({ terminalId, data }))`.
6. `terminal.onResize(({cols, rows}) => window.app.terminals.resize({ terminalId, cols, rows }))`.
7. Cleanup trên unmount: gọi unsubscribe, `terminal.dispose()`.

### 7.5 Resize handling (tránh glitch)

1. react-grid-layout emit `onResize` khi user drag.
2. TerminalPane lắng nghe container resize qua `ResizeObserver`.
3. Debounce 150ms rồi gọi `fitAddon.fit()` + `terminal.resize()` (debounce riêng cho xterm fit, độc lập với debounce save layout 500ms ở Section 8.4).
4. Không fit liên tục khi drag — chỉ fit khi dừng ~150ms.

### 7.6 Terminal exit state

Khi PTY exit, pane không tự đóng (theo overview Error Handling):

```text
┌─ Terminal Pane ─────────────────────┐
│ Title | cwd | split | rename | close│
├─────────────────────────────────────┤
│ $ pnpm dev                          │
│ (output cũ...)                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Process exited with code 0      │ │
│ │  [Restart]    [Close]           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

- `exitCode === null`: terminal đang chạy, render xterm bình thường.
- `exitCode !== null`: overlay "Process exited with code X" + nút Restart/Close.
- **Restart**: gọi `kill` + `createTerminal` mới cùng cwd/shell, bind lại hook.
- **Close**: gọi `kill` + remove pane khỏi grid.

### 7.7 App lifecycle cleanup

```ts
// main/index.ts
app.on("before-quit", () => {
  terminalService.killAll();
});
```

Tránh sót process ngầm.

## 8. Workspace Grid & Layout Persistence

### 8.1 WorkspaceGrid (react-grid-layout)

Dùng `react-grid-layout` với `WidthProvider` + `Responsive`. Layout lưu dạng `{ i, x, y, w, h }` — `i` là `terminalId`.

Grid config:

```ts
const layout: Layout[] = panes.map(p => ({
  i: p.id,
  x: p.grid.x,
  y: p.grid.y,
  w: p.grid.w,
  h: p.grid.h,
  minW: 2,    // tối thiểu 2/12 cols
  minH: 4     // tối thiểu 4 rows
}));
```

### 8.2 Pane operations

| Operation | Logic |
|---|---|
| **Add terminal** | Tạo pane mới, vị trí auto-compact (x=0, y=Infinity → RGL tự đẩy xuống). w=6, h=8 (nửa grid). Spawn terminal. |
| **Split right** | Lấy pane hiện tại, chia đôi ngang: pane cũ `w=w/2`, pane mới `x=x+w/2, w=w/2, y=y, h=h`. Spawn terminal mới cùng cwd. |
| **Split down** | Chia đôi dọc: pane cũ `h=h/2`, pane mới `x=x, y=y+h/2, w=w, h=h/2`. Spawn terminal mới cùng cwd. |
| **Duplicate cwd** | Clone pane với cùng cwd, vị trí auto-compact. |
| **Rename** | Update `pane.title` trong store → save layout. |
| **Close** | `terminalService.kill(id)` → remove pane khỏi store → save layout. |
| **Resize/Drag** | RGL `onDragStop`/`onResizeStop` → update pane.grid → save layout (debounce). |

### 8.3 Zustand workspace store

```ts
interface WorkspaceState {
  currentProject: Project | null;
  panes: TerminalPane[];

  openProject: (project: Project) => Promise<void>;
  closeProject: () => void;
  addPane: (cwd: string, shell?: string) => Promise<void>;
  splitPane: (id: string, direction: "right" | "down") => Promise<void>;
  duplicatePane: (id: string) => Promise<void>;
  renamePane: (id: string, title: string) => void;
  removePane: (id: string) => Promise<void>;
  updatePaneGrid: (id: string, grid: {x,y,w,h}) => void;
}
```

Store giữ `panes` (metadata + grid), không giữ xterm instance. xterm instance sống trong `useTerminal` hook của mỗi `TerminalPane` component.

### 8.4 Layout persistence

Khi save (debounce 500ms sau lần thay đổi cuối):

```text
Pane thay đổi (add/split/resize/rename/close)
  → updatePaneGrid/renamePane/removePane trong store
  → trigger saveLayout (debounced)
  → window.app.layouts.saveLayout(projectId, { panes, updatedAt })
  → Main: LayoutService.save() → AppStore.set()
```

Khi load (mở project):

```text
openProject(project)
  → layouts.getLayout(project.id)
  → nếu có layout: set panes = layout.panes
    → spawn fresh terminal cho mỗi pane (cùng cwd/shell, không restore command)
  → nếu không có layout: tạo 1 terminal mặc định tại project root
```

Quy ước Phase 1 (theo overview): Khi restore, app tự tạo terminal mới theo layout cũ, nhưng command bên trong là shell trống. Không restore output/command cũ.

### 8.5 LayoutService (Main)

```ts
class LayoutService {
  constructor(private store: AppStore) {}

  getLayout(projectId: string): WorkspaceLayout | null {
    const layouts = this.store.get("layouts", {});
    return layouts[projectId] ?? null;
  }

  saveLayout(projectId: string, layout: WorkspaceLayout): void {
    const layouts = this.store.get("layouts", {});
    layouts[projectId] = { ...layout, updatedAt: new Date().toISOString() };
    this.store.set("layouts", layouts);
  }
}
```

Layouts lưu trong electron-store dưới key `layouts`, keyed bởi `projectId`. Project A và B có layout riêng.


## 9. Project Management, File Tree, Settings

### 9.1 ProjectService (Main)

- `addProject(path)`: Validate path tồn tại (`fs.existsSync`). Sinh `id` bằng `nanoid()`. `name` = basename của path. Lưu vào AppStore key `projects` (array). Trả về Project object.
- `getAll()`: Đọc từ store, trả về `Project[]` thuần (không check exists ở đây). Việc check path tồn tại diễn ra khi user chọn project (xem Section 10 Error Handling).
- `get(id)`: Tìm trong array.
- `remove(id)`: Lọc khỏi array. Gọi `LayoutService.getLayout` rồi xóa layout của project đó khỏi store. Không xóa folder thật.

### 9.2 ProjectHome (Renderer)

Màn khởi đầu, 2 trạng thái:

- Chưa có project: "No project added yet." + nút `[Add Project]`.
- Có project: "Recent Projects" + list (name + path) + nút Add + remove.

AddProjectButton flow:

```text
Click [Add Project]
  → window.app.projects.selectFolder()  // dialog showOpenDialog
  → nếu chọn folder: window.app.projects.addProject(path)
  → refresh projects.store
  → tự động openProject (chuyển sang workspace)
```

### 9.3 FileTreeService (Main)

- `readDirectory(projectPath)`: Đọc root level (children trực tiếp). Trả về `FileTreeNode[]`.
- `readChildren(folderPath)`: Đọc children của folder cụ thể — lazy load khi expand.

Ignore logic: filter children whose `name` ∈ settings.ignoredFolders. Áp dụng cho cả 2 methods.

```ts
function readChildren(folderPath: string, ignoredFolders: string[]): FileTreeNode[] {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  return entries
    .filter(e => !ignoredFolders.includes(e.name))
    .map(e => ({
      name: e.name,
      path: join(folderPath, e.name),
      type: e.isDirectory() ? "directory" : "file"
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}
```

### 9.4 FileTree (Renderer)

- Load root khi mở project (`readDirectory`).
- Click folder: toggle expand → nếu chưa load children, gọi `readChildren`, cache trong Zustand local.
- Click file: hiển thị path trong status bar (Phase 1 không có editor).
- Context menu (right-click folder): `Open Terminal Here` (Phase 1 ưu tiên), `Copy Path`.

### 9.5 SettingsService (Main)

```ts
class SettingsService {
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

### 9.6 AppStore (electron-store wrapper)

```ts
class AppStore {
  private store = new Store<{
    projects: Project[];
    layouts: Record<string, WorkspaceLayout>;
    settings: AppSettings;
  }>({
    defaults: {
      projects: [],
      layouts: {},
      settings: DEFAULT_SETTINGS
    }
  });

  get<T>(key: string, defaultValue?: T): T { ... }
  set<T>(key: string, value: T): void { ... }
}
```

Single instance, inject vào tất cả services qua constructor. electron-store lưu JSON file ở userData dir (`app.getPath('userData')/config.json`).

### 9.7 SettingsPanel (Renderer)

Modal/panel với các field:

- Default shell (text input, placeholder = auto-detected).
- Font size (number input, 8–32).
- Theme (radio: dark/light).
- Ignored folders (textarea, newline-separated → parse to array khi save).

Live apply: Khi settings.update, `settings.store` push event → các TerminalPane re-render với fontSize/theme mới. TerminalPane đọc settings từ store, không cần remount xterm — chỉ `terminal.options.fontSize = newSize`.

## 10. Error Handling

| Tình huống | Xử lý |
|---|---|
| Project path không tồn tại | Khi user chọn project, main process kiểm tra `fs.existsSync(project.path)`. Nếu missing, trả error → renderer hiển thị "Project folder no longer exists." + nút "Remove from list" / "Choose new path" (reselect folder → update path). |
| Terminal spawn lỗi (shell sai) | TerminalPane hiển thị error: "Failed to start terminal. Shell not found: {shell}". Cho phép đổi shell trong pane header (dropdown) rồi Restart. |
| Folder không có quyền đọc | FileTreeNode hiển thị "Cannot read this folder" thay vì children rỗng. |
| Terminal process exited | Overlay "Process exited with code X" + [Restart] + [Close] (xem Section 7.6). |
| App crash khi close trong lúc terminal chạy | `before-quit` → `terminalService.killAll()` đảm bảo cleanup trước khi quit. |

## 11. UX Rules

### App mở lần đầu

```text
No project added yet.
[Add Project]
```

### Sau khi có project

```text
Recent Projects
- NoteMint
- FinFan Admin
- React Preview Tool
```

### Trong workspace — Top bar

```text
Project name | path | New Terminal | Save Layout | Settings
```

### Terminal pane header

```text
Title | cwd | split right | split down | rename | close
```

### File tree context menu

```text
Open Terminal Here
Copy Path
```

Phase 1 chỉ ưu tiên `Open Terminal Here` và `Copy Path`.

## 12. Acceptance Criteria (Phase 1 hoàn thành)

- App chạy được desktop local.
- Add/remove project được.
- Chọn project mở được workspace.
- Sidebar hiển thị file tree.
- Tạo terminal từ project root được.
- Tạo terminal từ folder trong file tree được.
- Chạy được ít nhất 3 terminal song song.
- Resize/drag terminal pane hoạt động ổn.
- Split right/split down hoạt động.
- Rename/close terminal hoạt động.
- Layout được lưu theo project.
- Restart app restore được layout.
- Terminal process chết khi app đóng.
- Không có crash khi close app trong lúc terminal đang chạy command.
- Chạy được các CLI phổ biến như `pnpm`, `dotnet`, `git`, `codex`, `claude`.

## 13. Rủi ro kỹ thuật & cách giảm rủi ro

### node-pty build issue

`node-pty` là native module nên có thể gặp lỗi khi build cross-platform.

Cách giảm rủi ro: dùng Electron version ổn định (đã chốt 39.x), setup build script rõ ràng, test sớm trên Windows, chốt package manager pnpm.

### Terminal resize glitch

xterm.js cần gọi fit đúng lúc khi pane resize.

Cách xử lý: dùng `@xterm/addon-fit`, debounce resize event 150ms, gọi terminal resize về main process sau khi fit.

### File tree project lớn

Project lớn có thể khiến UI lag.

Cách xử lý: ignore folder mặc định, lazy load children, không scan toàn bộ project ngay từ đầu.

### Process cleanup

Nếu app quit mà không kill process đúng, có thể sót process ngầm.

Cách xử lý: Main process giữ map terminalId → ptyProcess, kill all trong `before-quit`, kill all khi close project.

## 14. Out of Scope (Phase 1)

- Built-in code editor.
- Cloud sync or accounts.
- Remote terminals.
- Plugin system.
- MCP, memory retrieval, workflow skills, or AI agent status detection.
- True terminal session restore after the app exits (chỉ restore layout, tạo fresh terminal).
- Git UI phức tạp.
- Daemon giữ terminal sống sau khi đóng app.



