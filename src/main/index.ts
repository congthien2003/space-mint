import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { AppStore } from "./store/AppStore";
import { ProjectService } from "./services/ProjectService";
import { SettingsService } from "./services/SettingsService";
import { FileTreeService } from "./services/FileTreeService";
import { TerminalService } from "./services/TerminalService";
import { LayoutService } from "./services/LayoutService";
import { registerAllIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;

// Created at module load so we can kill all PTYs on before-quit.
const terminalService = new TerminalService();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: "Space Mint",
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
    layoutService
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Make sure no shell processes survive the app.
app.on("before-quit", () => {
  terminalService.killAll();
});
