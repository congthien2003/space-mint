import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { FileTreeService } from "../services/FileTreeService";
import type { SettingsService } from "../services/SettingsService";

export function registerFileIpc(
  fileTreeService: FileTreeService,
  settingsService: SettingsService
): void {
  ipcMain.handle(IPC.FILE_READ_DIRECTORY, (_event, projectPath: string) => {
    const ignored = settingsService.get().ignoredFolders;
    return fileTreeService.readDirectory(projectPath, ignored);
  });

  ipcMain.handle(IPC.FILE_READ_CHILDREN, (_event, folderPath: string) => {
    const ignored = settingsService.get().ignoredFolders;
    return fileTreeService.readChildren(folderPath, ignored);
  });
}
