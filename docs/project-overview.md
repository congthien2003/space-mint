# Project Overview — Agent Terminal Workspace Desktop App

## 1. Mục tiêu

Xây dựng một desktop app giúp developer quản lý nhiều project và chạy nhiều terminal/AI CLI agent trong cùng một workspace dạng grid.

App tập trung vào trải nghiệm:

- Add project local.
- Chọn project để mở workspace.
- Hiển thị cây thư mục project ở sidebar trái.
- Tạo nhiều terminal trong workspace trung tâm.
- Terminal có thể resize, split, rename, close.
- Layout terminal được lưu lại theo từng project.
- App đóng thì toàn bộ terminal process dừng.
- Mở app lại thì restore layout, nhưng terminal không tự chạy lại command cũ trong Phase 1.

Định vị Phase 1:

> Project-based multi-terminal workspace manager for developers using CLI tools and AI coding agents.

Không phải IDE, không phải AI agent platform, không phải VS Code replacement.

---

## 2. Scope Phase 1

### Có trong Phase 1

#### Project Management

- Add project bằng cách chọn folder local.
- Lưu danh sách recent projects.
- Chọn project để mở workspace.
- Remove project khỏi danh sách, không xóa folder thật.
- Hiển thị tên project và đường dẫn project.

#### File Tree Sidebar

- Hiển thị cây thư mục bên trái.
- Đọc folder/file từ project path.
- Có thể expand/collapse thư mục.
- Bỏ qua các folder nặng/mặc định:

  - `node_modules`
  - `.git`
  - `bin`
  - `obj`
  - `dist`
  - `build`
  - `.next`
  - `.turbo`
  - `.idea`
  - `.vscode`

- Click file ở Phase 1 chỉ hiển thị path hoặc mở bằng external editor nếu cấu hình đơn giản.
- Chưa cần editor trong app.

#### Terminal Workspace

- Workspace nằm ở giữa app.
- Cho phép tạo nhiều terminal.
- Mỗi terminal chạy shell thật bằng PTY.
- Terminal mặc định cwd là project root.
- Có thể tạo terminal từ một folder trong file tree.
- Terminal hiển thị bằng xterm.js.
- Terminal process chết khi:

  - user close pane;
  - user đóng project;
  - user đóng app.

#### Grid Layout

- Workspace dùng layout grid.
- Terminal pane có thể:

  - resize;
  - split right;
  - split down;
  - close;
  - rename;
  - duplicate cwd.

- Layout được lưu theo project.
- Mở lại project thì restore vị trí pane.
- Không restore process/command đang chạy.

#### Settings Cơ Bản

- Default shell:

  - Windows: PowerShell hoặc CMD.
  - macOS/Linux: bash/zsh.

- Font size terminal.
- Theme terminal đơn giản: dark/light.
- Default ignored folders cho file tree.

---

## 3. Out of Scope Phase 1

Những phần chưa làm ở Phase 1:

- Không có AI agent status observer.
- Không detect agent đang thinking/running/done.
- Không có MCP.
- Không có memory retrieval.
- Không có workflow skill.
- Không có cloud sync.
- Không có account/login.
- Không có remote terminal.
- Không có daemon giữ terminal sống sau khi đóng app.
- Không có built-in code editor.
- Không có Git UI phức tạp.
- Không có plugin system.
- Không có terminal session restore thật sự.

Phase 1 chỉ tập trung làm terminal workspace thật mượt và ổn định.

---

## 4. Tech Stack Đề Xuất

### Desktop Runtime

```text
Electron
```

Lý do:

- Dễ làm desktop app bằng React/TypeScript.
- Tích hợp tốt với Node.js.
- Dùng được `node-pty` để chạy terminal thật.
- Dễ build cross-platform Windows/macOS/Linux.
- Phù hợp MVP hơn Tauri vì terminal PTY trong Electron đơn giản hơn.

### Frontend

```text
React + TypeScript + Vite
```

### Terminal

```text
xterm.js
node-pty
```

Vai trò:

- `xterm.js`: render terminal trong UI.
- `node-pty`: spawn shell process thật.

### Layout Grid

Có thể chọn một trong hai hướng:

```text
react-grid-layout
```

hoặc custom split layout.

Khuyến nghị Phase 1:

```text
react-grid-layout
```

Lý do:

- Có sẵn drag/resize.
- Dễ lưu layout dạng `{ x, y, w, h }`.
- Hợp với workspace dạng grid giống Wave Terminal.

### Local Storage

Phase 1 nên dùng:

```text
electron-store
```

hoặc JSON file local.

Sau này nếu cần query nhiều hơn thì migrate sang SQLite.

Khuyến nghị:

```text
electron-store cho Phase 1
SQLite cho Phase 2+
```

---

## 5. Kiến Trúc Tổng Quan

```text
App
├── Electron Main Process
│   ├── ProjectService
│   ├── FileTreeService
│   ├── TerminalService
│   ├── LayoutService
│   └── IPC Handlers
│
├── Electron Preload
│   └── Safe API bridge
│
└── Renderer Process
    ├── React App
    ├── Project List
    ├── File Tree
    ├── Workspace Grid
    ├── Terminal Pane
    └── Settings UI
```

---

## 6. Main Process Responsibilities

Main process quản lý các tác vụ liên quan tới hệ thống:

### ProjectService

- Add project.
- Remove project.
- Get recent projects.
- Validate project path exists.
- Store project metadata.

### FileTreeService

- Read directory tree.
- Apply ignore rules.
- Lazy load folder children.
- Return file/folder metadata to renderer.

### TerminalService

- Create terminal process.
- Write input từ renderer vào PTY.
- Send output từ PTY về renderer.
- Resize terminal.
- Kill terminal.
- Kill all terminals of a project when closing project/app.

### LayoutService

- Save workspace layout by project id.
- Load workspace layout.
- Update terminal pane metadata:

  - title;
  - cwd;
  - shell;
  - grid position.

---

## 7. Renderer Responsibilities

Renderer chỉ lo UI và gọi API qua preload bridge.

### Main Layout

```text
┌────────────────────────────────────────────────────┐
│ Top Bar                                            │
├────────────────────┬───────────────────────────────┤
│ Project/File Tree  │ Workspace Grid                │
│                    │                               │
│                    │ ┌───────────┬───────────────┐ │
│                    │ │ Terminal  │ Terminal      │ │
│                    │ ├───────────┴───────────────┤ │
│                    │ │ Terminal                  │ │
│                    │ └───────────────────────────┘ │
└────────────────────┴───────────────────────────────┘
```

### UI Components

```text
src/renderer
├── app
│   └── App.tsx
├── features
│   ├── projects
│   │   ├── ProjectHome.tsx
│   │   ├── ProjectList.tsx
│   │   └── AddProjectButton.tsx
│   ├── file-tree
│   │   ├── FileTree.tsx
│   │   └── FileTreeNode.tsx
│   ├── workspace
│   │   ├── Workspace.tsx
│   │   ├── WorkspaceGrid.tsx
│   │   └── TerminalPane.tsx
│   └── settings
│       └── SettingsPanel.tsx
├── shared
│   ├── components
│   ├── hooks
│   └── types
└── styles
```

---

## 8. Data Model

### Project

```ts
export type Project = {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
};
```

### File Tree Node

```ts
export type FileTreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
};
```

### Terminal Pane

```ts
export type TerminalPane = {
  id: string;
  projectId: string;
  title: string;
  cwd: string;
  shell: string;
  grid: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};
```

### Workspace Layout

```ts
export type WorkspaceLayout = {
  projectId: string;
  panes: TerminalPane[];
  updatedAt: string;
};
```

### App Settings

```ts
export type AppSettings = {
  defaultShell: string;
  terminalFontSize: number;
  terminalTheme: "dark" | "light";
  ignoredFolders: string[];
};
```

---

## 9. IPC API Design

Renderer không gọi trực tiếp Node API. Tất cả đi qua preload.

### Project API

```ts
window.app.projects.addProject();
window.app.projects.getProjects();
window.app.projects.removeProject(projectId);
window.app.projects.getProject(projectId);
```

### File Tree API

```ts
window.app.files.readDirectory(projectPath);
window.app.files.readChildren(folderPath);
```

### Terminal API

```ts
window.app.terminals.createTerminal({
  projectId,
  cwd,
  shell
});

window.app.terminals.write({
  terminalId,
  data
});

window.app.terminals.resize({
  terminalId,
  cols,
  rows
});

window.app.terminals.kill(terminalId);

window.app.terminals.onData(terminalId, callback);

window.app.terminals.onExit(terminalId, callback);
```

### Layout API

```ts
window.app.layouts.getLayout(projectId);
window.app.layouts.saveLayout(projectId, layout);
```

### Settings API

```ts
window.app.settings.get();
window.app.settings.update(settings);
```

---

## 10. Terminal Lifecycle

### Create Terminal

```text
User click "New Terminal"
↓
Renderer gọi createTerminal(projectId, cwd)
↓
Main process spawn shell bằng node-pty
↓
Main process lưu terminal process vào memory map
↓
Renderer mount xterm.js
↓
PTY output stream về xterm.js
```

### Close Terminal

```text
User close pane
↓
Renderer gọi kill(terminalId)
↓
Main process kill PTY
↓
Renderer remove pane khỏi grid
↓
Layout được save lại
```

### Close App

```text
before-quit
↓
Main process kill all active PTY processes
↓
App quit
```

### Reopen App

```text
Load projects
↓
User chọn project
↓
Load saved layout
↓
Hiển thị pane placeholder hoặc tạo fresh terminal theo layout
↓
Không restore process cũ
```

Khuyến nghị Phase 1:

Khi mở lại project, app có thể tự tạo terminal mới theo layout cũ, nhưng command bên trong là shell trống.

---

## 11. Folder Structure Đề Xuất

```text
agent-workspace/
├── package.json
├── electron.vite.config.ts
├── tsconfig.json
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   ├── ipc/
│   │   │   ├── project.ipc.ts
│   │   │   ├── file-tree.ipc.ts
│   │   │   ├── terminal.ipc.ts
│   │   │   ├── layout.ipc.ts
│   │   │   └── settings.ipc.ts
│   │   ├── services/
│   │   │   ├── ProjectService.ts
│   │   │   ├── FileTreeService.ts
│   │   │   ├── TerminalService.ts
│   │   │   ├── LayoutService.ts
│   │   │   └── SettingsService.ts
│   │   └── store/
│   │       └── AppStore.ts
│   │
│   ├── preload/
│   │   └── index.ts
│   │
│   └── renderer/
│       ├── index.html
│       ├── main.tsx
│       ├── app/
│       │   └── App.tsx
│       ├── features/
│       │   ├── projects/
│       │   ├── file-tree/
│       │   ├── workspace/
│       │   └── settings/
│       ├── shared/
│       │   ├── types/
│       │   ├── hooks/
│       │   └── components/
│       └── styles/
│           └── globals.css
└── README.md
```

---

## 12. Package Gợi Ý

```bash
pnpm add @xterm/xterm @xterm/addon-fit @xterm/addon-web-links
pnpm add react-grid-layout
pnpm add electron-store
pnpm add nanoid
pnpm add clsx
```

Native dependency:

```bash
pnpm add node-pty
```

Dev dependencies:

```bash
pnpm add -D electron electron-vite typescript vite react react-dom
pnpm add -D @types/react @types/react-dom
```

UI có thể dùng Tailwind nếu muốn nhanh:

```bash
pnpm add -D tailwindcss
```

---

## 13. Milestones Phase 1

### Milestone 1 — App Shell

Mục tiêu: chạy được desktop app cơ bản.

Tasks:

- Setup Electron + React + TypeScript.
- Tạo main/preload/renderer structure.
- Tạo layout app:

  - top bar;
  - sidebar;
  - workspace area.

- Thêm basic theme dark.

Acceptance criteria:

- App mở được trên local.
- Renderer giao tiếp được với main process qua preload.
- Không expose Node API trực tiếp ra renderer.

---

### Milestone 2 — Project Management

Mục tiêu: add project và mở project workspace.

Tasks:

- Add project bằng folder picker.
- Lưu project vào local store.
- Hiển thị recent projects.
- Remove project khỏi danh sách.
- Validate project path exists.
- Khi chọn project, chuyển sang project workspace.

Acceptance criteria:

- User add được một folder project.
- App nhớ project sau khi restart.
- User chọn project và vào được màn workspace.

---

### Milestone 3 — File Tree Sidebar

Mục tiêu: hiển thị cây thư mục project.

Tasks:

- Implement FileTreeService.
- Read project root.
- Ignore folder mặc định.
- Render file tree.
- Expand/collapse folder.
- Lazy load children khi expand.
- Right click folder: “Open Terminal Here”.

Acceptance criteria:

- File tree load nhanh với project thực tế.
- Không render `node_modules`, `.git`, `bin`, `obj`.
- User có thể tạo terminal từ folder được chọn.

---

### Milestone 4 — Terminal Engine

Mục tiêu: chạy terminal thật trong app.

Tasks:

- Implement TerminalService bằng node-pty.
- Spawn default shell theo OS.
- Render terminal bằng xterm.js.
- Bridge input/output qua IPC.
- Resize terminal với addon fit.
- Kill terminal khi close pane.

Acceptance criteria:

- User tạo được terminal.
- Gõ command chạy bình thường.
- Terminal support interactive CLI.
- Chạy được các command như:

  - `pnpm dev`
  - `dotnet watch`
  - `git status`
  - `claude`
  - `codex`

- Close pane thì process bị kill.

---

### Milestone 5 — Workspace Grid

Mục tiêu: nhiều terminal chạy đồng thời, resize được.

Tasks:

- Implement WorkspaceGrid bằng react-grid-layout.
- Add terminal pane.
- Split right.
- Split down.
- Resize pane.
- Drag pane.
- Rename pane.
- Close pane.
- Duplicate pane with same cwd.

Acceptance criteria:

- Workspace chạy được nhiều terminal cùng lúc.
- Resize không làm terminal bị lỗi render.
- Split tạo layout hợp lý.
- Close một terminal không ảnh hưởng terminal khác.

---

### Milestone 6 — Save/Restore Layout

Mục tiêu: layout terminal được lưu theo project.

Tasks:

- Save layout khi:

  - add pane;
  - close pane;
  - resize pane;
  - drag pane;
  - rename pane.

- Load layout khi mở project.
- Restore pane metadata:

  - title;
  - cwd;
  - shell;
  - grid position.

- Tạo fresh terminal process cho mỗi pane khi restore.

Acceptance criteria:

- Đóng app mở lại vẫn thấy layout cũ.
- Terminal process là process mới.
- Không cố restore output/command cũ.
- Project A và Project B có layout riêng.

---

### Milestone 7 — Settings Cơ Bản

Mục tiêu: cấu hình terminal tối thiểu.

Tasks:

- Default shell setting.
- Terminal font size.
- Terminal theme.
- Ignored folders setting.
- Save settings local.

Acceptance criteria:

- User đổi font size terminal được.
- User đổi shell mặc định được.
- Settings vẫn còn sau khi restart app.

---

## 14. UX Rules

### App mở lần đầu

Hiển thị màn hình:

```text
No project added yet.
[Add Project]
```

### Sau khi có project

Hiển thị:

```text
Recent Projects
- NoteMint
- FinFan Admin
- React Preview Tool
```

### Trong workspace

Top bar nên có:

```text
Project name | path | New Terminal | Save Layout | Settings
```

Terminal pane header nên có:

```text
Title | cwd | split right | split down | rename | close
```

### File tree context menu

```text
Open Terminal Here
Copy Path
Reveal in Explorer/Finder
Open in VS Code
```

Phase 1 chỉ cần ưu tiên `Open Terminal Here`.

---

## 15. Error Handling

### Project path không tồn tại

Hiển thị:

```text
Project folder no longer exists.
```

Cho phép:

```text
Remove from list
Choose new path
```

### Terminal spawn lỗi

Ví dụ shell path sai:

```text
Failed to start terminal.
Shell not found: <shell-path>
```

### Folder không có quyền đọc

```text
Cannot read this folder due to permission restrictions.
```

### Terminal process exit

Pane không tự đóng ngay. Hiển thị trạng thái:

```text
Process exited with code 0
[Restart]
[Close]
```

---

## 16. Acceptance Criteria Tổng Phase 1

Phase 1 được xem là hoàn thành khi:

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

---

## 17. Rủi Ro Kỹ Thuật

### node-pty build issue

`node-pty` là native module nên có thể gặp lỗi khi build cross-platform.

Cách giảm rủi ro:

- Dùng Electron version ổn định.
- Setup build script rõ ràng.
- Test sớm trên Windows.
- Chốt package manager là pnpm hoặc npm, không trộn nhiều tool.

### Terminal resize glitch

xterm.js cần gọi fit đúng lúc khi pane resize.

Cách xử lý:

- Dùng `@xterm/addon-fit`.
- Debounce resize event.
- Gọi terminal resize về main process sau khi fit.

### File tree project lớn

Project lớn có thể khiến UI lag.

Cách xử lý:

- Ignore folder mặc định.
- Lazy load children.
- Không scan toàn bộ project ngay từ đầu.

### Process cleanup

Nếu app quit mà không kill process đúng, có thể sót process ngầm.

Cách xử lý:

- Main process giữ map terminalId → ptyProcess.
- Kill all trong `before-quit`.
- Kill all khi close project.

---

## 18. Roadmap Sau Phase 1

### Phase 2 — Developer Convenience

- Command presets theo project.
- Terminal templates:

  - Frontend Agent
  - Backend Agent
  - Dev Server
  - Test Watcher
  - Docker Logs

- One-click run command.
- Open file/folder in VS Code/Rider.
- Search file tree.
- Copy terminal output.
- Send selected output to another terminal.

### Phase 3 — AI Agent Workflow

- Mark terminal as AI agent.
- Send prompt to selected terminal.
- Broadcast prompt to multiple agent terminals.
- Pipe command output to agent terminal.
- Save task notes.
- Snapshot:

  - git status;
  - git diff;
  - terminal logs;
  - project notes.

### Phase 4 — Session Backend

- Optional tmux/Zellij integration.
- App đóng nhưng terminal vẫn sống.
- Attach lại session thật.
- Remote control.

---

## 19. Định Nghĩa MVP Ngắn Gọn

Phase 1 MVP là:

> Một desktop app cho phép add project local, xem file tree, tạo nhiều terminal thật trong workspace dạng grid, resize/split/close terminal, và lưu layout theo project. Khi app đóng, toàn bộ terminal process dừng.

Đây là nền móng đủ tốt để sau này phát triển thành workspace cho nhiều AI coding agents.
