import { create } from "zustand";
import type { AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";

interface SettingsState {
  settings: AppSettings;
  loading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const settings = await window.app.settings.get();
      set({ settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateSettings: async (partial) => {
    try {
      const updated = await window.app.settings.update(partial);
      set({ settings: updated });
    } catch {
      // ignore for now
    }
  }
}));
