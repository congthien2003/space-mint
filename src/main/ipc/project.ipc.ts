import { ipcMain, dialog } from "electron";
import { IPC } from "@shared/types";
import type { ProjectService } from "../services/ProjectService";

export function registerProjectIpc(
  projectService: ProjectService,
  consumePendingOpenPath: () => string | null
): void {
  ipcMain.handle(IPC.PROJECT_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle(IPC.PROJECT_GET_PENDING_OPEN_PATH, () => {
    return consumePendingOpenPath();
  });

  ipcMain.handle(IPC.PROJECT_ADD, (_event, path: string) => {
    return projectService.addProject(path);
  });

  ipcMain.handle(IPC.PROJECT_GET_ALL, () => {
    return projectService.getAll();
  });

  ipcMain.handle(IPC.PROJECT_GET, (_event, id: string) => {
    return projectService.get(id);
  });

  ipcMain.handle(IPC.PROJECT_REMOVE, (_event, id: string) => {
    projectService.remove(id);
  });
}
