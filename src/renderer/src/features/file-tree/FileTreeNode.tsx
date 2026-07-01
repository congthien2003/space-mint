import { useState } from "react";
import clsx from "clsx";
import type { FileTreeNode as NodeType } from "@shared/types";
import { useFileTreeStore } from "./file-tree.store";

interface Props {
  node: NodeType;
  depth: number;
  onOpenTerminal: (folderPath: string) => void;
}

export function FileTreeNode({
  node,
  depth,
  onOpenTerminal
}: Props): React.JSX.Element {
  const isExpanded = useFileTreeStore((s) => s.isExpanded(node.path));
  const children = useFileTreeStore((s) => s.childrenMap[node.path]);
  const toggleExpand = useFileTreeStore((s) => s.toggleExpand);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const isDir = node.type === "directory";

  const handleClick = (): void => {
    if (isDir) void toggleExpand(node.path);
  };

  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = (): void => setMenu(null);

  return (
    <div>
      <div
        className={clsx(
          "flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-xs hover:bg-aw-bg-mute",
          isDir ? "text-aw-text" : "text-aw-text-soft"
        )}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={node.path}
      >
        <span className="w-3 text-center text-aw-text-soft">
          {isDir ? (isExpanded ? "▾" : "▸") : ""}
        </span>
        <span className="truncate">{node.name}</span>
      </div>

      {isDir && isExpanded && children && (
        <div>
          {children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onOpenTerminal={onOpenTerminal}
            />
          ))}
        </div>
      )}

      {menu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeMenu}
            onContextMenu={(e) => {
              e.preventDefault();
              closeMenu();
            }}
          />
          <div
            className="fixed z-50 min-w-[180px] rounded border border-aw-border bg-aw-bg-soft py-1 text-xs text-aw-text shadow-lg"
            style={{ left: menu.x, top: menu.y }}
          >
            {isDir && (
              <button
                className="block w-full px-3 py-1 text-left hover:bg-aw-bg-mute"
                onClick={() => {
                  onOpenTerminal(node.path);
                  closeMenu();
                }}
              >
                Open Terminal Here
              </button>
            )}
            <button
              className="block w-full px-3 py-1 text-left hover:bg-aw-bg-mute"
              onClick={() => {
                void navigator.clipboard?.writeText(node.path);
                closeMenu();
              }}
            >
              Copy Path
            </button>
          </div>
        </>
      )}
    </div>
  );
}
