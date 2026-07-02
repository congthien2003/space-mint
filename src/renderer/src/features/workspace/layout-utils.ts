import { nanoid } from "nanoid";
import type {
  LayoutDirection,
  LayoutLeafNode,
  LayoutNode,
  LayoutSplitNode,
  TerminalPane
} from "@shared/types";

type LegacyGrid = { x: number; y: number; w: number; h: number };
type LegacyPane = TerminalPane & { grid?: LegacyGrid };
export type InsertPlacement = "before" | "after";

const DEFAULT_SIZE = 1;
const MAX_AUTO_CHILDREN = 5;
const MIN_NODE_SIZE = 0.1;

function leaf(paneId: string, size = DEFAULT_SIZE): LayoutLeafNode {
  return { id: nanoid(), type: "leaf", paneId, size };
}

function split(
  direction: LayoutDirection,
  children: LayoutNode[],
  size = DEFAULT_SIZE
): LayoutSplitNode {
  return { id: nanoid(), type: "split", direction, children, size };
}

function withSize<T extends LayoutNode>(node: T, size: number): T {
  return { ...node, size: Math.max(size, MIN_NODE_SIZE) };
}

function normalizeSplit(node: LayoutSplitNode): LayoutNode | null {
  const children = node.children.filter(Boolean);
  if (children.length === 0) return null;
  if (children.length === 1) return withSize(children[0], node.size);
  return { ...node, children };
}

export function appendPaneToTree(
  tree: LayoutNode | null,
  paneId: string
): LayoutNode {
  const next = leaf(paneId);
  if (!tree) return next;

  if (tree.type === "leaf") {
    return split("row", [withSize(tree, DEFAULT_SIZE), next]);
  }

  if (tree.children.length < MAX_AUTO_CHILDREN) {
    return { ...tree, children: [...tree.children, next] };
  }

  const lastIndex = tree.children.length - 1;
  const last = tree.children[lastIndex];
  const nestedDirection: LayoutDirection =
    tree.direction === "row" ? "column" : "row";
  const nested = split(nestedDirection, [withSize(last, DEFAULT_SIZE), next], last.size);

  return {
    ...tree,
    children: tree.children.map((child, index) =>
      index === lastIndex ? nested : child
    )
  };
}

export function appendPaneToNode(
  tree: LayoutNode | null,
  targetNodeId: string,
  paneId: string,
  direction: LayoutDirection,
  placement: InsertPlacement
): LayoutNode | null {
  if (!tree) return null;
  const result = insertPaneRelativeToNode(
    tree,
    targetNodeId,
    paneId,
    direction,
    placement
  );
  return result.inserted ? result.node : tree;
}

export function splitPaneInTree(
  tree: LayoutNode | null,
  targetPaneId: string,
  nextPaneId: string,
  direction: LayoutDirection
): LayoutNode | null {
  if (!tree) return null;

  if (tree.type === "leaf") {
    if (tree.paneId !== targetPaneId) return tree;
    return split(direction, [withSize(tree, DEFAULT_SIZE), leaf(nextPaneId)], tree.size);
  }

  const nextChildren: LayoutNode[] = [];
  for (const child of tree.children) {
    if (child.type === "leaf" && child.paneId === targetPaneId) {
      if (tree.direction === direction) {
        nextChildren.push(withSize(child, child.size / 2));
        nextChildren.push(leaf(nextPaneId, child.size / 2));
      } else {
        nextChildren.push(
          split(
            direction,
            [withSize(child, DEFAULT_SIZE), leaf(nextPaneId)],
            child.size
          )
        );
      }
      continue;
    }

    nextChildren.push(
      splitPaneInTree(child, targetPaneId, nextPaneId, direction) ?? child
    );
  }

  return {
    ...tree,
    children: nextChildren
  };
}

function insertPaneRelativeToNode(
  node: LayoutNode,
  targetNodeId: string,
  paneId: string,
  direction: LayoutDirection,
  placement: InsertPlacement
): { node: LayoutNode; inserted: boolean } {
  if (node.id === targetNodeId) {
    return {
      node: wrapNodeWithPane(node, paneId, direction, placement),
      inserted: true
    };
  }

  if (node.type === "leaf") {
    return { node, inserted: false };
  }

  let inserted = false;
  const children: LayoutNode[] = [];
  for (const child of node.children) {
    if (!inserted && child.id === targetNodeId && node.direction === direction) {
      const existing = withSize(child, child.size / 2);
      const next = leaf(paneId, child.size / 2);
      if (placement === "before") {
        children.push(next, existing);
      } else {
        children.push(existing, next);
      }
      inserted = true;
      continue;
    }

    if (inserted) {
      children.push(child);
      continue;
    }

    const result = insertPaneRelativeToNode(
      child,
      targetNodeId,
      paneId,
      direction,
      placement
    );
    inserted = result.inserted;
    children.push(result.node);
  }

  return {
    node: { ...node, children },
    inserted
  };
}

function wrapNodeWithPane(
  node: LayoutNode,
  paneId: string,
  direction: LayoutDirection,
  placement: InsertPlacement
): LayoutSplitNode {
  const existing = withSize(node, DEFAULT_SIZE);
  const next = leaf(paneId);
  const children =
    placement === "before" ? [next, existing] : [existing, next];

  return split(direction, children, node.size);
}

export function removePaneFromTree(
  tree: LayoutNode | null,
  paneId: string
): LayoutNode | null {
  if (!tree) return null;

  if (tree.type === "leaf") {
    return tree.paneId === paneId ? null : tree;
  }

  const children = tree.children
    .map((child) => removePaneFromTree(child, paneId))
    .filter((child): child is LayoutNode => child !== null);

  return normalizeSplit({ ...tree, children });
}

export function updateSplitChildSizes(
  tree: LayoutNode | null,
  splitId: string,
  sizes: number[]
): LayoutNode | null {
  if (!tree) return null;

  if (tree.type === "leaf") return tree;

  if (tree.id === splitId) {
    return {
      ...tree,
      children: tree.children.map((child, index) =>
        withSize(child, sizes[index] ?? child.size)
      )
    };
  }

  return {
    ...tree,
    children: tree.children.map((child) =>
      updateSplitChildSizes(child, splitId, sizes) ?? child
    )
  };
}

export function ensureTreeForPanes(
  tree: LayoutNode | null,
  panes: TerminalPane[]
): LayoutNode | null {
  const paneIds = new Set(panes.map((pane) => pane.id));
  const prune = (node: LayoutNode | null): LayoutNode | null => {
    if (!node) return null;
    if (node.type === "leaf") return paneIds.has(node.paneId) ? node : null;
    const children = node.children
      .map(prune)
      .filter((child): child is LayoutNode => child !== null);
    return normalizeSplit({ ...node, children });
  };

  let next = prune(tree);
  const existing = collectPaneIds(next);
  for (const pane of panes) {
    if (!existing.has(pane.id)) {
      next = appendPaneToTree(next, pane.id);
      existing.add(pane.id);
    }
  }
  return next;
}

export function legacyPanesToTree(panes: TerminalPane[]): LayoutNode | null {
  const legacy = [...(panes as LegacyPane[])].sort((a, b) => {
    const ag = a.grid;
    const bg = b.grid;
    if (!ag || !bg) return 0;
    return ag.y === bg.y ? ag.x - bg.x : ag.y - bg.y;
  });

  return legacy.reduce<LayoutNode | null>(
    (tree, pane) => appendPaneToTree(tree, pane.id),
    null
  );
}

function collectPaneIds(tree: LayoutNode | null): Set<string> {
  const ids = new Set<string>();
  const visit = (node: LayoutNode | null): void => {
    if (!node) return;
    if (node.type === "leaf") {
      ids.add(node.paneId);
      return;
    }
    node.children.forEach(visit);
  };
  visit(tree);
  return ids;
}
