import clsx from "clsx";
import { ArrowLeft, PanelLeft, PanelRight, Plus, Settings } from "lucide-react";
import type { Project } from "@shared/types";

interface TopBarProps {
  project: Project | null;
  onBack: () => void;
  onAddTerminal: () => void;
  onOpenSettings: () => void;
  showLeftSidebar: boolean;
  showRightPreview: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightPreview: () => void;
}

export function TopBar({
  project,
  onBack,
  onAddTerminal,
  onOpenSettings,
  showLeftSidebar,
  showRightPreview,
  onToggleLeftSidebar,
  onToggleRightPreview
}: TopBarProps): React.JSX.Element {
  const toggleButtonClass =
    "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition";

  return (
    <div className="flex h-12 items-center gap-3 border-b border-aw-border bg-aw-bg px-3">
      {project ? (
        <>
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-aw-border-strong bg-aw-bg-soft px-2.5 py-1 text-xs font-medium text-aw-text hover:bg-aw-bg-mute"
            onClick={onBack}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Projects</span>
          </button>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-base font-mono font-medium leading-5 text-aw-text">
              {project.name}
            </span>
            <span
              className="block truncate font-mono text-[10px] leading-4 text-aw-text-soft"
              title={project.path}
            >
              {project.path}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={clsx(
                toggleButtonClass,
                showLeftSidebar
                  ? "border-aw-border-strong bg-aw-bg-mute text-aw-text"
                  : "border-aw-border bg-aw-bg-soft text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
              )}
              title="Toggle file sidebar"
              aria-label="Toggle file sidebar"
              onClick={onToggleLeftSidebar}
            >
              <PanelLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={clsx(
                toggleButtonClass,
                showRightPreview
                  ? "border-aw-border-strong bg-aw-bg-mute text-aw-text"
                  : "border-aw-border bg-aw-bg-soft text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
              )}
              title="Toggle preview sidebar"
              aria-label="Toggle preview sidebar"
              onClick={onToggleRightPreview}
            >
              <PanelRight size={14} aria-hidden="true" />
            </button>
            <button
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-aw-accent px-3 text-xs font-medium text-white hover:bg-aw-accent-active"
              onClick={onAddTerminal}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Terminal</span>
            </button>
            <button
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-aw-border bg-aw-bg-soft px-2.5 text-xs font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
              onClick={onOpenSettings}
            >
              <Settings size={14} aria-hidden="true" />
              <span>Settings</span>
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
