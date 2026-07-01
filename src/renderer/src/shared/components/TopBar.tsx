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
    <div className="flex h-16 items-center gap-4 border-b border-aw-border bg-aw-bg px-5">
      {project ? (
        <>
          <button
            className="rounded-md border border-aw-border-strong bg-aw-bg-soft px-3 py-2 text-sm font-medium text-aw-text hover:bg-aw-bg-mute"
            onClick={onBack}
          >
            ← Projects
          </button>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold leading-5 text-aw-text">
              {project.name}
            </span>
            <span
              className="block truncate font-mono text-[11px] leading-4 text-aw-text-soft"
              title={project.path}
            >
              {project.path}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={clsx(
                "h-10 rounded-md px-4 text-sm font-medium",
                "bg-aw-accent text-white hover:bg-aw-accent-active"
              )}
              onClick={onAddTerminal}
            >
              + Terminal
            </button>
            <button
              className="h-10 rounded-md border border-aw-border bg-aw-bg-soft px-3 text-sm font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
              onClick={onOpenSettings}
            >
              Settings
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-sm bg-aw-accent" />
          <span className="text-sm font-semibold text-aw-text">
            Agent Workspace
          </span>
        </div>
      )}
    </div>
  );
}
