import { Sidebar } from "@renderer/shared/components/Sidebar";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";

export function Workspace(): React.JSX.Element {
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const panes = useWorkspaceStore((s) => s.panes);
  const addPane = useWorkspaceStore((s) => s.addPane);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col items-center overflow-hidden bg-aw-bg">
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
          <WorkspaceGrid />
        )}
      </div>
    </div>
  );
}
