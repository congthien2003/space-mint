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
        className={
          showLeftSidebar
            ? "h-full w-72 shrink-0 overflow-hidden"
            : "h-full w-0 shrink-0 overflow-hidden"
        }
      >
        <Sidebar onToggle={onToggleLeftSidebar} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center overflow-hidden bg-aw-bg">
        <div className="flex min-h-0 w-full max-w-[1280px] flex-1 flex-col">
          {panes.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-10 py-9 text-center">
                <p className="text-base font-medium text-aw-text">
                  No terminals yet.
                </p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-aw-text-soft">
                  Start at the project root, or open one from a folder in the file
                  tree.
                </p>
              </div>
              <button
                className="h-10 rounded-md bg-aw-accent px-4 text-sm font-medium text-white hover:bg-aw-accent-active"
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
        className={
          showRightPreview
            ? "h-full w-[360px] shrink-0 overflow-hidden"
            : "h-full w-0 shrink-0 overflow-hidden"
        }
      >
        <FilePreviewPanel onToggle={onToggleRightPreview} />
      </div>
    </div>
  );
}
