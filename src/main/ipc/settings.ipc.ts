import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { AppSettings } from "@shared/types";
import type { SettingsService } from "../services/SettingsService";

export function registerSettingsIpc(settingsService: SettingsService): void {
  ipcMain.handle(IPC.SETTINGS_GET, () => {
    return settingsService.get();
  });

  ipcMain.handle(IPC.SETTINGS_UPDATE, (_event, partial: Partial<AppSettings>) => {
    return settingsService.update(partial);
  });
}
