import type { AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS, isTerminalThemeName } from "@shared/types";
import type { AppStore } from "../store/AppStore";

export class SettingsService {
  constructor(private store: AppStore) {}

  get(): AppSettings {
    const stored = this.store.get("settings");
    const settings = { ...DEFAULT_SETTINGS, ...stored };
    return {
      ...settings,
      terminalTheme: isTerminalThemeName(settings.terminalTheme)
        ? settings.terminalTheme
        : DEFAULT_SETTINGS.terminalTheme
    };
  }

  update(partial: Partial<AppSettings>): AppSettings {
    const current = this.get();
    const next = { ...current, ...partial };
    const updated: AppSettings = {
      ...next,
      terminalTheme: isTerminalThemeName(next.terminalTheme)
        ? next.terminalTheme
        : DEFAULT_SETTINGS.terminalTheme
    };
    this.store.set("settings", updated);
    return updated;
  }
}
