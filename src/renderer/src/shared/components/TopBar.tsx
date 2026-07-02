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

function getPathSegments(path: string): string[] {
  return path
    .split(/[/\\]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
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
    "aw-action flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium";
  const pathSegments = project ? getPathSegments(project.path) : [];

  return (
    <div className="flex h-12 items-center gap-3 border-b border-aw-border bg-aw-bg px-3">
      {project ? (
        <>
          <button
            className="aw-action inline-flex items-center gap-1.5 rounded-md border border-aw-border-strong bg-aw-bg-soft px-2.5 py-1 text-xs font-medium text-aw-text hover:bg-aw-bg-mute"
            onClick={onBack}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Projects</span>
          </button>
          <div className="min-w-0 flex-1">
            <div
              className="flex min-w-0 items-center gap-2 overflow-hidden font-mono text-[12px] leading-4 text-aw-text-soft"
              title={project.path}
            >
              {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;

                return (
                  <div
                    key={`${segment}-${index}`}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <span
                      className={clsx(
                        "truncate",
                        isLast && "font-semibold text-aw-text"
                      )}
                    >
                      {segment}
                    </span>
                    {!isLast ? (
                      <span aria-hidden="true" className="text-aw-text-soft">
                        &gt;
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
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
              className="aw-action inline-flex h-7 items-center gap-1.5 rounded-md bg-aw-accent px-3 text-xs font-medium text-white shadow-[0_6px_18px_rgba(229,57,53,0.18)] hover:bg-aw-accent-active"
              onClick={onAddTerminal}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Terminal</span>
            </button>
            <button
              className="aw-action inline-flex h-7 items-center gap-1.5 rounded-md border border-aw-border bg-aw-bg-soft px-2.5 text-xs font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
              onClick={onOpenSettings}
            >
              <Settings size={14} aria-hidden="true" />
              <span>Settings</span>
            </button>
          </div>
        </>
      ) : (
        <div className="aw-fade-in flex items-center gap-3">
          <span className="h-3 w-3 rounded-sm bg-aw-accent shadow-[0_0_0_4px_rgba(229,57,53,0.10)]" />
          <span className="text-sm font-semibold text-aw-text">Space Mint</span>
        </div>
      )}
    </div>
  );
}
