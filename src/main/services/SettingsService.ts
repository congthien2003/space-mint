import type { AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";
import type { AppStore } from "../store/AppStore";

export class SettingsService {
  constructor(private store: AppStore) {}

  get(): AppSettings {
    const stored = this.store.get("settings");
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  update(partial: Partial<AppSettings>): AppSettings {
    const current = this.get();
    const updated = { ...current, ...partial };
    this.store.set("settings", updated);
    return updated;
  }
}
