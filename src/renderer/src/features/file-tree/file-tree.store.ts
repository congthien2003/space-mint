import { create } from "zustand";
import type { FileTreeNode } from "@shared/types";

interface FileTreeState {
  /** projectPath -> root nodes (cached, can be refreshed). */
  roots: FileTreeNode[];
  loading: boolean;
  error: string | null;
  /** set of expanded directory paths -> loaded children. */
  childrenMap: Record<string, FileTreeNode[]>;
  /** set of expanded folder paths. */
  expanded: Set<string>;

  loadRoot: (projectPath: string) => Promise<void>;
  loadChildren: (folderPath: string) => Promise<void>;
  toggleExpand: (folderPath: string) => Promise<void>;
  isExpanded: (folderPath: string) => boolean;
  reset: () => void;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  roots: [],
  loading: false,
  error: null,
  childrenMap: {},
  expanded: new Set<string>(),

  loadRoot: async (projectPath) => {
    set({ loading: true, error: null });
    try {
      const roots = await window.app.files.readDirectory(projectPath);
      set({ roots, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadChildren: async (folderPath) => {
    if (get().childrenMap[folderPath]) return;
    try {
      const children = await window.app.files.readChildren(folderPath);
      set((state) => ({
        childrenMap: { ...state.childrenMap, [folderPath]: children }
      }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  toggleExpand: async (folderPath) => {
    const expanded = new Set(get().expanded);
    if (expanded.has(folderPath)) {
      expanded.delete(folderPath);
    } else {
      expanded.add(folderPath);
      await get().loadChildren(folderPath);
    }
    set({ expanded });
  },

  isExpanded: (folderPath) => get().expanded.has(folderPath),

  reset: () =>
    set({
      roots: [],
      childrenMap: {},
      expanded: new Set<string>(),
      error: null,
      loading: false
    })
}));
