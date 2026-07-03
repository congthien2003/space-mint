import { existsSync, realpathSync } from "node:fs";
import { basename } from "node:path";
import { nanoid } from "nanoid";
import type { Project } from "@shared/types";
import type { AppStore } from "../store/AppStore";
import type { LayoutService } from "./LayoutService";

export class ProjectService {
  constructor(
    private store: AppStore,
    private layoutService?: LayoutService
  ) {}

  addProject(path: string): Project {
    if (!existsSync(path)) {
      throw new Error(`Project path does not exist: ${path}`);
    }
    const normalizedPath = realpathSync.native(path);
    const normalizedKey = this.getPathKey(normalizedPath);
    const projects = this.store.get("projects");
    const existingProject = projects.find(
      (project) => this.getPathKey(project.path) === normalizedKey
    );
    if (existingProject) {
      return existingProject;
    }

    const now = new Date().toISOString();
    const project: Project = {
      id: nanoid(),
      name: basename(normalizedPath),
      path: normalizedPath,
      createdAt: now,
      updatedAt: now
    };
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
    this.layoutService?.remove(id);
  }

  private getPathKey(path: string): string {
    return process.platform === "win32" ? path.toLowerCase() : path;
  }
}
