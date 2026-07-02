import { useMemo, useRef } from "react";
import clsx from "clsx";
import type {
  LayoutDirection,
  LayoutNode,
  LayoutSplitNode,
  TerminalPane as TerminalPaneType
} from "@shared/types";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { TerminalPane } from "./TerminalPane";

const ROW_MIN_PX = 180;
const COLUMN_MIN_PX = 128;
const DIVIDER_PX = 8;

interface NodeViewProps {
  node: LayoutNode;
  panesById: Map<string, TerminalPaneType>;
  focusedPaneId: string | null;
  onResizeSplit: (splitId: string, sizes: number[]) => void;
  onAddToNode: (
    node: LayoutNode,
    direction: LayoutDirection,
    placement: "before" | "after",
    sourcePane: TerminalPaneType
  ) => void;
}

function SplitNodeView({
  node,
  panesById,
  focusedPaneId,
  onResizeSplit,
  onAddToNode
}: NodeViewProps & { node: LayoutSplitNode }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isRow = node.direction === "row";
  const sourcePane = findFirstPane(node, panesById);

  const startResize = (
    event: React.MouseEvent<HTMLDivElement>,
    dividerIndex: number
  ): void => {
    const container = containerRef.current;
    if (!container) return;

    event.preventDefault();
    const rect = container.getBoundingClientRect();
    const dimension = isRow ? rect.width : rect.height;
    const totalPanelPx =
      dimension - Math.max(node.children.length - 1, 0) * DIVIDER_PX;
    const sizes = node.children.map((child) => child.size);
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);
    const prevStartPx = totalPanelPx * (sizes[dividerIndex] / totalSize);
    const nextStartPx = totalPanelPx * (sizes[dividerIndex + 1] / totalSize);
    const pairPx = prevStartPx + nextStartPx;
    const baseMinPx = isRow ? ROW_MIN_PX : COLUMN_MIN_PX;
    const minPx = Math.min(baseMinPx, Math.max(24, pairPx / 2 - 1));
    const pairSize = sizes[dividerIndex] + sizes[dividerIndex + 1];
    const startPoint = isRow ? event.clientX : event.clientY;

    const onMove = (moveEvent: MouseEvent): void => {
      const currentPoint = isRow ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPoint - startPoint;
      const prevPx = Math.min(Math.max(prevStartPx + delta, minPx), pairPx - minPx);
      const nextPx = pairPx - prevPx;
      const nextSizes = [...sizes];
      nextSizes[dividerIndex] = pairSize * (prevPx / (prevPx + nextPx));
      nextSizes[dividerIndex + 1] = pairSize - nextSizes[dividerIndex];
      onResizeSplit(node.id, nextSizes);
    };

    const onUp = (): void => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("select-none");
    };

    document.body.classList.add("select-none");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const addToNode = (
    direction: LayoutDirection,
    placement: "before" | "after"
  ): void => {
    if (!sourcePane) return;
    onAddToNode(node, direction, placement, sourcePane);
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "workspace-split relative flex h-full w-full min-h-0 min-w-0 overflow-hidden",
        isRow ? "flex-row" : "flex-col"
      )}
    >
      <div className="workspace-split-controls">
        <button
          className="workspace-split-add workspace-split-add-left"
          title="Add terminal to the left of this group"
          onClick={() => addToNode("row", "before")}
        >
          +←
        </button>
        <button
          className="workspace-split-add workspace-split-add-right"
          title="Add terminal to the right of this group"
          onClick={() => addToNode("row", "after")}
        >
          +→
        </button>
        <button
          className="workspace-split-add workspace-split-add-bottom"
          title="Add terminal below this group"
          onClick={() => addToNode("column", "after")}
        >
          +↓
        </button>
      </div>
      {node.children.map((child, index) => (
        <div key={child.id} className="contents">
          <div
            className="min-h-0 min-w-0 overflow-hidden"
            style={{
              flexBasis: 0,
              flexGrow: child.size,
              flexShrink: 1,
              minWidth: 0,
              minHeight: 0
            }}
          >
            <LayoutNodeView
              node={child}
              panesById={panesById}
              focusedPaneId={focusedPaneId}
              onResizeSplit={onResizeSplit}
              onAddToNode={onAddToNode}
            />
          </div>
          {index < node.children.length - 1 && (
            <div
              className={clsx(
                "group flex shrink-0 items-center justify-center",
                isRow ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize"
              )}
              onMouseDown={(event) => startResize(event, index)}
            >
              <div
                className={clsx(
                  "rounded-full bg-aw-border-strong opacity-0 transition group-hover:scale-110 group-hover:opacity-100",
                  isRow ? "h-10 w-px" : "h-px w-10"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LayoutNodeView({
  node,
  panesById,
  focusedPaneId,
  onResizeSplit,
  onAddToNode
}: NodeViewProps): React.JSX.Element | null {
  if (node.type === "leaf") {
    const pane = panesById.get(node.paneId);
    if (!pane) return null;
    return (
      <div
        className={clsx(
          "h-full w-full min-h-0 min-w-0 overflow-hidden",
          focusedPaneId !== pane.id && "aw-fade-in"
        )}
      >
        <TerminalPane pane={pane} />
      </div>
    );
  }

  return (
    <SplitNodeView
      node={node}
      panesById={panesById}
      focusedPaneId={focusedPaneId}
      onResizeSplit={onResizeSplit}
      onAddToNode={onAddToNode}
    />
  );
}

export function WorkspacePanels(): React.JSX.Element | null {
  const panes = useWorkspaceStore((s) => s.panes);
  const layoutTree = useWorkspaceStore((s) => s.layoutTree);
  const resizeSplit = useWorkspaceStore((s) => s.resizeSplit);
  const addPaneToNode = useWorkspaceStore((s) => s.addPaneToNode);
  const focusedPaneId = useWorkspaceStore((s) => s.focusedPaneId);

  const panesById = useMemo(
    () => new Map(panes.map((pane) => [pane.id, pane])),
    [panes]
  );

  if (!layoutTree) return null;

  return (
    <div className="h-full w-full min-h-0 min-w-0 overflow-hidden p-1.5">
      <LayoutNodeView
        node={layoutTree}
        panesById={panesById}
        focusedPaneId={focusedPaneId}
        onResizeSplit={resizeSplit}
        onAddToNode={(node, direction, placement, sourcePane) =>
          void addPaneToNode({
            nodeId: node.id,
            direction,
            placement,
            cwd: sourcePane.cwd,
            shell: sourcePane.shell,
            title: sourcePane.title
          })
        }
      />
    </div>
  );
}

function findFirstPane(
  node: LayoutNode,
  panesById: Map<string, TerminalPaneType>
): TerminalPaneType | null {
  if (node.type === "leaf") {
    return panesById.get(node.paneId) ?? null;
  }

  for (const child of node.children) {
    const pane = findFirstPane(child, panesById);
    if (pane) return pane;
  }
  return null;
}
