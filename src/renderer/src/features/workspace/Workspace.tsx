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
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-sm text-aw-text-soft">No terminals yet.</p>
            <button
              className="rounded bg-aw-accent px-3 py-1.5 text-sm text-white hover:opacity-90"
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
