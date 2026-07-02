import type { WorkspaceLayout } from "@shared/types";
import type { AppStore } from "../store/AppStore";

/**
 * Persists terminal pane metadata and the split-tree layout per project.
 */
export class LayoutService {
  constructor(private store: AppStore) {}

  get(projectId: string): WorkspaceLayout | null {
    const layouts = this.store.get("layouts");
    return layouts[projectId] ?? null;
  }

  save(projectId: string, layout: WorkspaceLayout): void {
    const layouts = this.store.get("layouts");
    this.store.set("layouts", { ...layouts, [projectId]: layout });
  }

  remove(projectId: string): void {
    const layouts = this.store.get("layouts");
    delete layouts[projectId];
    this.store.set("layouts", layouts);
  }
}
