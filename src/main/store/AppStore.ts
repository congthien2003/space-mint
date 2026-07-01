import Store from "electron-store";
import type { Project, WorkspaceLayout, AppSettings } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";

type StoreSchema = {
  projects: Project[];
  layouts: Record<string, WorkspaceLayout>;
  settings: AppSettings;
};

export class AppStore {
  private store: Store<StoreSchema>;

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
