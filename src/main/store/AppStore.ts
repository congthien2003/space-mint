import StoreModule from "electron-store";
import type { Project, WorkspaceLayout, AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";

// electron-store v11+ is ESM-only. When electron-vite's CJS build requires it,
// the module namespace is returned — the Store constructor lives at .default.
const Store: typeof StoreModule =
  (StoreModule as unknown as { default: typeof StoreModule }).default ??
  StoreModule;

type StoreSchema = {
  projects: Project[];
  layouts: Record<string, WorkspaceLayout>;
  settings: AppSettings;
};

export class AppStore {
  private store: StoreModule<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      defaults: {
        projects: [],
        layouts: {},
        settings: DEFAULT_SETTINGS
      }
    });
  }

  get<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
    return this.store.get(key);
  }

  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
    this.store.set(key, value);
  }
}