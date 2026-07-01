import type { ProjectService } from "../services/ProjectService";
import type { SettingsService } from "../services/SettingsService";
import type { FileTreeService } from "../services/FileTreeService";
import type { TerminalService } from "../services/TerminalService";
import type { LayoutService } from "../services/LayoutService";
import { registerProjectIpc } from "./project.ipc";
import { registerSettingsIpc } from "./settings.ipc";
import { registerFileIpc } from "./file.ipc";
import { registerTerminalIpc } from "./terminal.ipc";
import { registerLayoutIpc } from "./layout.ipc";

export function registerAllIpc(
  projectService: ProjectService,
  settingsService: SettingsService,
  fileTreeService: FileTreeService,
  terminalService: TerminalService,
  layoutService: LayoutService
): void {
  registerProjectIpc(projectService);
  registerSettingsIpc(settingsService);
  registerFileIpc(fileTreeService, settingsService);
  registerTerminalIpc(terminalService);
  registerLayoutIpc(layoutService);
}
