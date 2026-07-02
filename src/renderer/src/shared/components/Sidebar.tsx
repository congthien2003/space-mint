import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { FileTree } from "@renderer/features/file-tree/FileTree";

interface SidebarProps {
  onToggle: () => void;
}

export function Sidebar({ onToggle }: SidebarProps): React.JSX.Element {
  const currentProject = useWorkspaceStore((s) => s.currentProject);

  return (
    <div className="flex h-full w-72 flex-col border-r border-aw-border bg-aw-bg-soft">
      <div className="flex items-center justify-between border-b border-aw-border px-4 py-3">
        <span className="text-[11px] font-semibold uppercase text-aw-text-soft">
          Files
        </span>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text"
          title="Hide file sidebar"
          aria-label="Hide file sidebar"
          onClick={onToggle}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 4 6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 text-sm text-aw-text-soft">
        {currentProject ? (
          <FileTree projectPath={currentProject.path} />
        ) : (
          <p className="px-2 py-4 text-center text-xs text-aw-text-soft">
            No project open.
          </p>
        )}
      </div>
    </div>
  );
}
