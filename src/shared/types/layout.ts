import type { TerminalPane } from "./terminal";

export type LayoutDirection = "row" | "column";

export type LayoutLeafNode = {
  id: string;
  type: "leaf";
  paneId: string;
  size: number;
};

export type LayoutSplitNode = {
  id: string;
  type: "split";
  direction: LayoutDirection;
  children: LayoutNode[];
  size: number;
};

export type LayoutNode = LayoutLeafNode | LayoutSplitNode;

export type WorkspaceLayout = {
  projectId: string;
  panes: TerminalPane[];
  layoutTree: LayoutNode | null;
  updatedAt: string;
};
