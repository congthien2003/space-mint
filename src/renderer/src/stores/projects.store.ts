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
