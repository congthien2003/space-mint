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
