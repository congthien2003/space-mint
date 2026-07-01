import { ipcMain } from "electron";
import { IPC } from "@shared/types";
import type { TerminalService } from "../services/TerminalService";

export function registerTerminalIpc(terminalService: TerminalService): void {
  ipcMain.handle(
    IPC.TERMINAL_CREATE,
    (
      event,
      opts: { id?: string; projectId: string; cwd: string; shell?: string }
    ) => {
      return terminalService.create(opts, event.sender);
    }
  );

  ipcMain.handle(
    IPC.TERMINAL_WRITE,
    (_event, opts: { terminalId: string; data: string }) => {
      terminalService.write(opts.terminalId, opts.data);
    }
  );

  ipcMain.handle(
    IPC.TERMINAL_RESIZE,
    (_event, opts: { terminalId: string; cols: number; rows: number }) => {
      terminalService.resize(opts.terminalId, opts.cols, opts.rows);
    }
  );

  ipcMain.handle(IPC.TERMINAL_KILL, (_event, terminalId: string) => {
    terminalService.kill(terminalId);
  });
}
