# Phase 1 — Project Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full Project Management UI — add project via folder picker, persist recent projects, remove project, select project để mở workspace. ProjectHome hiển thị list recent projects thay vì placeholder.

**Architecture:** Renderer dùng `useProjectsStore` (Zustand) để load/add/remove projects qua `window.app.projects.*`. ProjectHome render list hoặc empty state. Khi user chọn project → set `currentProject` trong `useWorkspaceStore` → App tự chuyển sang Workspace view.

**Prerequisite:** Phase 0 completed (app shell, stores, IPC skeleton).

**Tech Stack:** React 19, Zustand, Tailwind CSS, nanoid (main side), electron-store.

**Spec reference:** `docs/superpowers/specs/2026-01-07-agent-workspace-phase1-design.md` (Sections 9.1, 9.2, 11)

---

## File Structure Map

### Files to Create

| File | Responsibility |
|---|---|
| `src/renderer/src/features/projects/AddProjectButton.tsx` | Button mở folder dialog + add project |
| `src/renderer/src/features/projects/ProjectList.tsx` | List recent projects, remove, select |

### Files to Modify

| File | Change |
|---|---|
| `src/renderer/src/features/projects/ProjectHome.tsx` | Thay placeholder bằng ProjectList + AddProjectButton |
| `src/main/services/ProjectService.ts` | Thêm check `existsSync` khi `get()` (validate path khi select) |

---
## Task 1: Update ProjectService — validate path

**Files:**
- Modify: `src/main/services/ProjectService.ts`

- [ ] **Step 1: Thêm method `validatePath` vào ProjectService**

Thêm method sau vào class `ProjectService` (sau method `remove`):

```ts
  validatePath(path: string): boolean {
    return existsSync(path);
  }
```

> Method này để IPC handler kiểm tra path khi user select project.

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---

## Task 2: Update project IPC — validate khi get project

**Files:**
- Modify: `src/main/ipc/project.ipc.ts`

- [ ] **Step 1: Cập nhật handler PROJECT_GET để validate path**

Thay handler `PROJECT_GET` hiện tại:

```ts
  ipcMain.handle(IPC.PROJECT_GET, (_event, id: string) => {
    const project = projectService.get(id);
    if (!project) return null;
    if (!projectService.validatePath(project.path)) {
      throw new Error(`Project folder no longer exists: ${project.path}`);
    }
    return project;
  });
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:node`
Expected: PASS.

---

## Task 3: Tạo AddProjectButton component

**Files:**
- Create: `src/renderer/src/features/projects/AddProjectButton.tsx`

- [ ] **Step 1: Tạo AddProjectButton.tsx**

```tsx
import { useState } from "react";
import clsx from "clsx";
import { useProjectsStore } from "@renderer/stores/projects.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import type { Project } from "@shared/types";

export function AddProjectButton(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addProject = useProjectsStore((s) => s.addProject);
  const setCurrentProject = useWorkspaceStore((s) => s.setCurrentProject);

  const handleClick = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const folderPath = await window.app.projects.selectFolder();
      if (!folderPath) {
        setLoading(false);
        return;
      }
      const project = await addProject(folderPath);
      if (project) {
        setCurrentProject(project as Project);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className={clsx(
          "rounded-lg px-6 py-3 text-sm font-semibold",
          "bg-aw-accent text-white hover:opacity-90",
          loading && "opacity-50"
        )}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Adding..." : "+ Add Project"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:web`
Expected: PASS.

---
## Task 4: Tạo ProjectList component

**Files:**
- Create: `src/renderer/src/features/projects/ProjectList.tsx`

- [ ] **Step 1: Tạo ProjectList.tsx**

```tsx
import { useState } from "react";
import clsx from "clsx";
import { useProjectsStore } from "@renderer/stores/projects.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import type { Project } from "@shared/types";

export function ProjectList(): React.JSX.Element {
  const projects = useProjectsStore((s) => s.projects);
  const removeProject = useProjectsStore((s) => s.removeProject);
  const setCurrentProject = useWorkspaceStore((s) => s.setCurrentProject);
  const [errorProjectId, setErrorProjectId] = useState<string | null>(null);

  const handleSelect = async (project: Project): Promise<void> => {
    try {
      const validated = await window.app.projects.getProject(project.id);
      if (!validated) return;
      setCurrentProject(validated);
    } catch (err) {
      setErrorProjectId(project.id);
    }
  };

  const handleRemove = async (id: string): Promise<void> => {
    await removeProject(id);
    setErrorProjectId(null);
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl">
      <h3 className="mb-4 text-sm font-semibold uppercase text-aw-text-soft">
        Recent Projects
      </h3>
      <ul className="flex flex-col gap-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className={clsx(
              "flex items-center gap-3 rounded-lg border border-aw-border bg-aw-bg-soft p-3",
              "hover:border-aw-accent transition-colors"
            )}
          >
            <button
              className="flex flex-1 flex-col text-left"
              onClick={() => handleSelect(project)}
            >
              <span className="text-sm font-semibold text-aw-text">
                {project.name}
              </span>
              <span className="text-xs text-aw-text-soft">{project.path}</span>
            </button>
            {errorProjectId === project.id && (
              <span className="text-xs text-red-400">Folder missing</span>
            )}
            <button
              className="rounded px-2 py-1 text-xs text-aw-text-soft hover:bg-aw-bg-mute hover:text-red-400"
              onClick={() => handleRemove(project.id)}
              title="Remove from list"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:web`
Expected: PASS.

---
## Task 5: Update ProjectHome — thay placeholder

**Files:**
- Modify: `src/renderer/src/features/projects/ProjectHome.tsx`

- [ ] **Step 1: Thay toàn bộ ProjectHome.tsx**

```tsx
import { AddProjectButton } from "./AddProjectButton";
import { ProjectList } from "./ProjectList";
import { useProjectsStore } from "@renderer/stores/projects.store";

export function ProjectHome(): React.JSX.Element {
  const projects = useProjectsStore((s) => s.projects);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-aw-text">Agent Workspace</h2>
        <p className="text-sm text-aw-text-soft">
          {projects.length === 0
            ? "No project added yet."
            : "Select a project or add a new one."}
        </p>
      </div>
      <AddProjectButton />
      <ProjectList />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck:web`
Expected: PASS.

---

## Task 6: Run app để verify Phase 1

**Files:** (none — verification only)

- [ ] **Step 1: Run dev mode**

Run: `pnpm dev`

- [ ] **Step 2: Test add project**

Click "+ Add Project" → chọn folder → app chuyển sang Workspace view, top bar hiển thị tên + path.

- [ ] **Step 3: Test recent projects persist**

Click "← Projects" → project xuất hiện trong list. Đóng app, mở lại → project vẫn còn.

- [ ] **Step 4: Test remove project**

Click "✕" trên project → biến mất khỏi list.

- [ ] **Step 5: Test missing folder error**

Add project → đóng app → rename folder → mở app → chọn project → "Folder missing".

---

## Phase 1 Acceptance Criteria

- [ ] User add được folder project qua folder picker.
- [ ] App nhớ project sau restart (electron-store).
- [ ] User chọn project và vào được workspace.
- [ ] User remove project khỏi danh sách.
- [ ] Project path missing hiển thị error.
- [ ] Không có console error.



