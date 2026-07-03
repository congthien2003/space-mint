import { app, BrowserWindow } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { IPC } from "@shared/types";
import { AppStore } from "./store/AppStore";
import { ProjectService } from "./services/ProjectService";
import { SettingsService } from "./services/SettingsService";
import { FileTreeService } from "./services/FileTreeService";
import { TerminalService } from "./services/TerminalService";
import { LayoutService } from "./services/LayoutService";
import { registerAllIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;
let pendingOpenPath: string | null = resolveOpenPath(process.argv);

// Created at module load so we can kill all PTYs on before-quit.
const terminalService = new TerminalService();

function resolveOpenPath(argv: string[]): string | null {
  const openPathArg = argv.find((arg) => arg.startsWith("--open-path="));
  if (openPathArg) {
    const value = openPathArg.slice("--open-path=".length).trim();
    if (value) {
      return value;
    }
  }

  const openPathIndex = argv.indexOf("--open-path");
  const openPathValue = argv[openPathIndex + 1]?.trim();
  if (openPathIndex >= 0 && openPathValue) {
    return openPathValue;
  }

  const envPath = process.env.SPACE_MINT_OPEN_PATH?.trim();
  if (envPath) {
    return envPath;
  }

  return null;
}

function consumePendingOpenPath(): string | null {
  const openPath = pendingOpenPath;
  pendingOpenPath = null;
  return openPath;
}

function focusMainWindow(): void {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function sendOpenPathToRenderer(path: string): void {
  focusMainWindow();
  if (mainWindow && !mainWindow.webContents.isDestroyed()) {
    if (mainWindow.webContents.isLoading()) {
      pendingOpenPath = path;
    } else {
      pendingOpenPath = null;
      mainWindow.webContents.send(IPC.PROJECT_OPEN_REQUESTED, path);
    }
    return;
  }
  pendingOpenPath = path;
}

function resolveWindowIconPath(): string | undefined {
  const iconCandidates = [
    join(process.cwd(), "resources", "icon.png"),
    join(__dirname, "../../resources/icon.png"),
    join(process.resourcesPath, "resources", "icon.png"),
    join(process.resourcesPath, "app.asar.unpacked", "resources", "icon.png")
  ];

  return iconCandidates.find((candidate) => existsSync(candidate));
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: "Space Mint",
    icon: resolveWindowIconPath(),
    backgroundColor: "#1b1b1f",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const openPath = resolveOpenPath(argv);
    if (openPath) {
      sendOpenPathToRenderer(openPath);
      return;
    }
    focusMainWindow();
  });

  app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.spacemint.app");

    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    const appStore = new AppStore();
    const layoutService = new LayoutService(appStore);
    const projectService = new ProjectService(appStore, layoutService);
    const settingsService = new SettingsService(appStore);
    const fileTreeService = new FileTreeService();

    registerAllIpc(
      projectService,
      settingsService,
      fileTreeService,
      terminalService,
      layoutService,
      consumePendingOpenPath
    );

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Make sure no shell processes survive the app.
app.on("before-quit", () => {
  terminalService.killAll();
});
