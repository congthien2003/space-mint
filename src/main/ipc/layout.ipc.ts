import { ipcMain } from "electron";
import { IPC, type WorkspaceLayout } from "@shared/types";
import type { LayoutService } from "../services/LayoutService";

export function registerLayoutIpc(layoutService: LayoutService): void {
  ipcMain.handle(IPC.LAYOUT_GET, (_event, projectId: string) => {
    return layoutService.get(projectId);
  });

  ipcMain.handle(
    IPC.LAYOUT_SAVE,
    (_event, projectId: string, layout: WorkspaceLayout) => {
      layoutService.save(projectId, layout);
    }
  );
}
