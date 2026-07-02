import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { IPC } from "@shared/types";
import type { Project, AppSettings, WorkspaceLayout, FileTreeNode } from "@shared/types";

const app = {
  projects: {
    selectFolder: (): Promise<string | null> =>
      ipcRenderer.invoke(IPC.PROJECT_SELECT_FOLDER),
    addProject: (path: string): Promise<Project> =>
      ipcRenderer.invoke(IPC.PROJECT_ADD, path),
    getProjects: (): Promise<Project[]> =>
      ipcRenderer.invoke(IPC.PROJECT_GET_ALL),
    getProject: (id: string): Promise<Project | null> =>
      ipcRenderer.invoke(IPC.PROJECT_GET, id),
    removeProject: (id: string): Promise<void> =>
      ipcRenderer.invoke(IPC.PROJECT_REMOVE, id)
  },

  files: {
    readDirectory: (projectPath: string): Promise<FileTreeNode[]> =>
      ipcRenderer.invoke(IPC.FILE_READ_DIRECTORY, projectPath),
    readChildren: (folderPath: string): Promise<FileTreeNode[]> =>
      ipcRenderer.invoke(IPC.FILE_READ_CHILDREN, folderPath),
    readTextFile: (
      filePath: string
    ): Promise<{ content: string; size: number }> =>
      ipcRenderer.invoke(IPC.FILE_READ_TEXT, filePath)
  },

  terminals: {
    createTerminal: (opts: {
      id?: string;
      projectId: string;
      cwd: string;
      shell?: string;
    }): Promise<{ terminalId: string }> =>
      ipcRenderer.invoke(IPC.TERMINAL_CREATE, opts),
    write: (opts: { terminalId: string; data: string }): Promise<void> =>
      ipcRenderer.invoke(IPC.TERMINAL_WRITE, opts),
    resize: (opts: {
      terminalId: string;
      cols: number;
      rows: number;
    }): Promise<void> => ipcRenderer.invoke(IPC.TERMINAL_RESIZE, opts),
    kill: (terminalId: string): Promise<void> =>
      ipcRenderer.invoke(IPC.TERMINAL_KILL, terminalId),
    onData: (
      terminalId: string,
      callback: (data: string) => void
    ): (() => void) => {
      const channel = `${IPC.TERMINAL_DATA}:${terminalId}`;
      const handler = (_event: unknown, data: string): void => callback(data);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    },
    onExit: (
      terminalId: string,
      callback: (e: { exitCode: number }) => void
    ): (() => void) => {
      const channel = `${IPC.TERMINAL_EXIT}:${terminalId}`;
      const handler = (_event: unknown, e: { exitCode: number }): void =>
        callback(e);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    }
  },

  layouts: {
    getLayout: (projectId: string): Promise<WorkspaceLayout | null> =>
      ipcRenderer.invoke(IPC.LAYOUT_GET, projectId),
    saveLayout: (
      projectId: string,
      layout: WorkspaceLayout
    ): Promise<void> => ipcRenderer.invoke(IPC.LAYOUT_SAVE, projectId, layout)
  },

  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
    update: (partial: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke(IPC.SETTINGS_UPDATE, partial)
  }
};

export type AppApi = typeof app;

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("app", app);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.app = app;
}
