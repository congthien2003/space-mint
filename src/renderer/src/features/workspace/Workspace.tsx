import clsx from "clsx";
import { Sidebar } from "@renderer/shared/components/Sidebar";
import { WorkspacePanels } from "./WorkspacePanels";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { FilePreviewPanel } from "@renderer/features/file-preview/FilePreviewPanel";

interface WorkspaceProps {
  showLeftSidebar: boolean;
  showRightPreview: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightPreview: () => void;
}

export function Workspace({
  showLeftSidebar,
  showRightPreview,
  onToggleLeftSidebar,
  onToggleRightPreview
}: WorkspaceProps): React.JSX.Element {
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const panes = useWorkspaceStore((s) => s.panes);
  const addPane = useWorkspaceStore((s) => s.addPane);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        className={clsx(
          "workspace-side-panel h-full shrink-0 overflow-hidden",
          showLeftSidebar
            ? "w-72 translate-x-0 opacity-100"
            : "w-0 -translate-x-3 opacity-0"
        )}
      >
        <Sidebar onToggle={onToggleLeftSidebar} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center overflow-hidden bg-aw-bg p-4">
        <div className="flex min-h-0 w-full max-w-[1280px] flex-1 flex-col">
          {panes.length === 0 ? (
            <div className="aw-fade-in flex flex-1 flex-col items-center justify-center gap-4">
              <div className="rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-6 py-8 text-center shadow-[0_14px_34px_rgba(38,37,30,0.06)]">
                <p className="text-base font-medium text-aw-text">
                  No terminals yet.
                </p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-aw-text-soft">
                  Start at the project root, or open one from a folder in the
                  file tree.
                </p>
              </div>
              <button
                className="aw-action h-7 rounded-md bg-aw-accent px-3 text-xs font-medium text-white shadow-[0_6px_18px_rgba(229,57,53,0.16)] hover:bg-aw-accent-active"
                onClick={() =>
                  void addPane({
                    cwd: currentProject?.path ?? "",
                    title: "Terminal"
                  })
                }
              >
                + New Terminal
              </button>
            </div>
          ) : (
            <WorkspacePanels />
          )}
        </div>
      </div>
      <div
        className={clsx(
          "workspace-side-panel h-full shrink-0 overflow-hidden",
          showRightPreview
            ? "w-[360px] translate-x-0 opacity-100"
            : "w-0 translate-x-3 opacity-0"
        )}
      >
        <FilePreviewPanel onToggle={onToggleRightPreview} />
      </div>
    </div>
  );
}
