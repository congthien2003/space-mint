# Space Mint

Space Mint is an Electron desktop app for developers who work across multiple local projects and run several terminal-based tools or AI coding agents at the same time.

Phase 1 focuses on a project-based multi-terminal workspace: add a local project, browse its file tree, open real terminal panes, arrange them in a grid, and restore the saved layout per project.

## Phase 1 Scope

Space Mint is designed as a lightweight workspace manager, not a full IDE or VS Code replacement.

Phase 1 includes:

- Add and remove local projects from a recent projects list.
- Open a project workspace from a selected local folder.
- Show the project file tree in a left sidebar.
- Ignore heavy folders such as `node_modules`, `.git`, `bin`, `obj`, `dist`, `build`, `.next`, and `.turbo`.
- Create multiple real terminal sessions with the project root as the default working directory.
- Create a terminal from a folder in the file tree.
- Resize, split, rename, duplicate, and close terminal panes.
- Save and restore the terminal grid layout per project.
- Stop terminal processes when panes, projects, or the app are closed.
- Configure basic settings such as default shell, terminal font size, theme, and ignored folders.

Phase 1 does not include:

- Built-in code editor.
- Cloud sync or accounts.
- Remote terminals.
- Plugin system.
- MCP, memory retrieval, workflow skills, or AI agent status detection.
- True terminal session restore after the app exits.

## Tech Stack

- Electron for the desktop runtime.
- React, TypeScript, and Vite for the renderer.
- `node-pty` for real shell processes.
- `@xterm/xterm` for terminal rendering.
- `react-grid-layout` for the workspace grid.
- `electron-store` for local project, settings, and layout storage.
- `electron-vite` and `electron-builder` for development and packaging.

## Architecture

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

The renderer must not call Node.js APIs directly. System access goes through preload APIs and IPC handlers in the main process.

## Current Repository State

The repository currently contains the Electron, React, and TypeScript foundation for the app. The product direction and Phase 1 requirements are captured in [docs/project-overview.md](docs/project-overview.md).

Key existing areas:

```text
src/
├── main/
│   └── index.ts
├── preload/
│   ├── index.ts
│   └── index.d.ts
├── renderer/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── assets/
└── shared/
    └── types/
```

## Development Setup

Install dependencies:

```bash
pnpm install
```

Run the app in development mode:

```bash
pnpm dev
```

Preview the built app:

```bash
pnpm start
```

## Scripts

```bash
pnpm dev
```

Start the Electron app with the Vite development server.

```bash
pnpm build
```

Run TypeScript checks and build the Electron app.

```bash
pnpm build:unpack
```

Build an unpacked desktop app directory.

```bash
pnpm build:win
pnpm build:mac
pnpm build:linux
```

Build platform-specific desktop packages.

```bash
pnpm typecheck
pnpm lint
pnpm format
```

Run type checking, linting, or formatting.

## Phase 1 Milestones

1. App Shell: basic Electron window, preload bridge, renderer layout, and dark workspace shell.
2. Project Management: add projects, persist recent projects, remove entries, and open a project workspace.
3. File Tree Sidebar: read project folders, apply ignore rules, lazy-load children, and open terminals from folders.
4. Terminal Engine: spawn shells with `node-pty`, render with xterm.js, bridge input/output through IPC, resize, and kill processes.
5. Workspace Grid: support multiple panes, split right/down, drag, resize, rename, duplicate, and close.
6. Save/Restore Layout: persist pane metadata and grid positions per project, then recreate fresh terminals on restore.
7. Basic Settings: default shell, terminal font size, terminal theme, and ignored folders.

## Target MVP

Phase 1 is complete when the app can:

- Add and open local projects.
- Display a project file tree.
- Create terminals from the project root and selected folders.
- Run at least three terminal panes in parallel.
- Resize, drag, split, rename, duplicate, and close panes.
- Save layouts per project and restore them after restart.
- Kill all terminal processes when the app closes.
- Run common developer CLIs such as `pnpm`, `dotnet`, `git`, `codex`, and `claude`.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
