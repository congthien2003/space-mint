import { ChevronLeft } from "lucide-react";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { FileTree } from "@renderer/features/file-tree/FileTree";

interface SidebarProps {
  onToggle: () => void;
}

export function Sidebar({ onToggle }: SidebarProps): React.JSX.Element {
  const currentProject = useWorkspaceStore((s) => s.currentProject);

  return (
    <div className="flex h-full w-72 flex-col border-r border-aw-border bg-aw-bg-soft">
      <div className="flex items-center justify-between border-b border-aw-border px-3 py-2">
        <span className="text-[11px] font-semibold uppercase text-aw-text-soft">
          Files
        </span>
        <button
          type="button"
          className="aw-action flex h-6 w-6 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
          title="Hide file sidebar"
          aria-label="Hide file sidebar"
          onClick={onToggle}
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 py-1.5 text-sm text-aw-text-soft">
        {currentProject ? (
          <FileTree projectPath={currentProject.path} />
        ) : (
          <div className="aw-fade-in m-2 rounded-lg border border-aw-border bg-aw-bg px-3 py-4 text-center text-xs text-aw-text-soft">
            No project open.
          </div>
        )}
      </div>
    </div>
  );
}
