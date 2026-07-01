import clsx from "clsx";
import type { Project } from "@shared/types";

interface TopBarProps {
  project: Project | null;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function TopBar({ project, onBack, onOpenSettings }: TopBarProps): React.JSX.Element {
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
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-aw-text">{project.name}</span>
            <span className="text-xs text-aw-text-soft">{project.path}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className={clsx(
                "rounded px-3 py-1 text-sm",
                "bg-aw-accent text-white hover:opacity-90"
              )}
              disabled
              title="Available in Phase 2"
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
        <span className="text-sm font-semibold text-aw-text">Agent Workspace</span>
      )}
    </div>
  );
}
