import type { TerminalPane } from "./terminal";

export type WorkspaceLayout = {
  projectId: string;
  panes: TerminalPane[];
  updatedAt: string;
};
