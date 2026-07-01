import type { ProjectService } from "../services/ProjectService";
import type { SettingsService } from "../services/SettingsService";
import { registerProjectIpc } from "./project.ipc";
import { registerSettingsIpc } from "./settings.ipc";

export function registerAllIpc(
  projectService: ProjectService,
  settingsService: SettingsService
): void {
  registerProjectIpc(projectService);
  registerSettingsIpc(settingsService);
}
