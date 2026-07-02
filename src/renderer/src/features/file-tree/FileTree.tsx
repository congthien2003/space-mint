import { useEffect } from "react";
import { useFileTreeStore } from "./file-tree.store";
import { FileTreeNode } from "./FileTreeNode";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useFilePreviewStore } from "@renderer/features/file-preview/file-preview.store";
import type { FileTreeNode as NodeType } from "@shared/types";

interface Props {
  projectPath: string;
}

function baseName(p: string): string {
  const parts = p.split(/[\\/]/);
  return parts[parts.length - 1] || p;
}

export function FileTree({ projectPath }: Props): React.JSX.Element {
  const roots = useFileTreeStore((s) => s.roots);
  const loading = useFileTreeStore((s) => s.loading);
  const error = useFileTreeStore((s) => s.error);
  const loadRoot = useFileTreeStore((s) => s.loadRoot);
  const reset = useFileTreeStore((s) => s.reset);
  const addPane = useWorkspaceStore((s) => s.addPane);
  const previewFile = useFilePreviewStore((s) => s.previewFile);
  const resetPreview = useFilePreviewStore((s) => s.reset);

  useEffect(() => {
    void loadRoot(projectPath);
    return () => {
      reset();
      resetPreview();
    };
  }, [projectPath, loadRoot, reset, resetPreview]);

  const handleOpenTerminal = (folderPath: string): void => {
    void addPane({ cwd: folderPath, title: baseName(folderPath) });
  };

  const handlePreviewFile = (file: NodeType): void => {
    void previewFile(file);
  };

  if (loading) {
    return (
      <p className="px-2 py-4 text-center text-xs text-aw-text-soft">
        Loading...
      </p>
    );
  }
  if (error) {
    return <p className="px-2 py-4 text-center text-xs text-aw-error">{error}</p>;
  }
  if (roots.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-aw-text-soft">
        Empty project folder.
      </p>
    );
  }

  return (
    <div className="py-1">
      {roots.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          onOpenTerminal={handleOpenTerminal}
          onPreviewFile={handlePreviewFile}
        />
      ))}
    </div>
  );
}
