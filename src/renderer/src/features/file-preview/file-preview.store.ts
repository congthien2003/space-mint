import { create } from "zustand";
import type { FileTreeNode } from "@shared/types";

interface FilePreviewState {
  selectedFile: FileTreeNode | null;
  content: string;
  size: number | null;
  loading: boolean;
  error: string | null;
  previewFile: (file: FileTreeNode) => Promise<void>;
  reset: () => void;
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const useFilePreviewStore = create<FilePreviewState>((set, get) => ({
  selectedFile: null,
  content: "",
  size: null,
  loading: false,
  error: null,

  previewFile: async (file) => {
    set({
      selectedFile: file,
      content: "",
      size: null,
      loading: true,
      error: null
    });
    try {
      const result = await window.app.files.readTextFile(file.path);
      if (get().selectedFile?.path !== file.path) return;
      set({
        content: result.content,
        size: result.size,
        loading: false,
        error: null
      });
    } catch (error) {
      if (get().selectedFile?.path !== file.path) return;
      set({
        content: "",
        size: null,
        loading: false,
        error: toMessage(error)
      });
    }
  },

  reset: () =>
    set({
      selectedFile: null,
      content: "",
      size: null,
      loading: false,
      error: null
    })
}));
