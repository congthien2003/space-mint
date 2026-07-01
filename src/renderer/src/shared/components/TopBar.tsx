import clsx from "clsx";
import type { Project } from "@shared/types";

interface TopBarProps {
  project: Project | null;
  onBack: () => void;
  onAddTerminal: () => void;
  onOpenSettings: () => void;
}

export function TopBar({
  project,
  onBack,
  onAddTerminal,
  onOpenSettings
}: TopBarProps): React.JSX.Element {
  return (
    <div className="flex h-12 items-center gap-3 border-b border-aw-border bg-aw-bg-soft px-4">
      {project ? (
        <>
          <button
            className="rounded px-2 py-1 text-sm text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text"
            onClick={onBack}
          >
            ← Projects
          </button>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-aw-text">
              {project.name}
            </span>
            <span
              className="truncate text-xs text-aw-text-soft"
              title={project.path}
            >
              {project.path}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className={clsx(
                "rounded px-3 py-1 text-sm",
                "bg-aw-accent text-white hover:opacity-90"
              )}
              onClick={onAddTerminal}
            >
              + Terminal
            </button>
            <button
              className="rounded px-2 py-1 text-sm text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text"
              onClick={onOpenSettings}
            >
              ⚙ Settings
            </button>
          </div>
        </>
      ) : (
        <span className="text-sm font-semibold text-aw-text">
          Agent Workspace
        </span>
      )}
    </div>
  );
}
