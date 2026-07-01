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
