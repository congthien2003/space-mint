export const IPC = {
  PROJECT_ADD: "project:add",
  PROJECT_GET_ALL: "project:get-all",
  PROJECT_GET: "project:get",
  PROJECT_REMOVE: "project:remove",
  PROJECT_SELECT_FOLDER: "project:select-folder",
  FILE_READ_DIRECTORY: "file:read-directory",
  FILE_READ_CHILDREN: "file:read-children",
  TERMINAL_CREATE: "terminal:create",
  TERMINAL_WRITE: "terminal:write",
  TERMINAL_RESIZE: "terminal:resize",
  TERMINAL_KILL: "terminal:kill",
  TERMINAL_DATA: "terminal:data",
  TERMINAL_EXIT: "terminal:exit",
  LAYOUT_GET: "layout:get",
  LAYOUT_SAVE: "layout:save",
  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update"
} as const;
