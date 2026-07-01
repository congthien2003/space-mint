import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { FileTree } from "@renderer/features/file-tree/FileTree";

export function Sidebar(): React.JSX.Element {
  const currentProject = useWorkspaceStore((s) => s.currentProject);

  return (
    <div className="flex h-full w-64 flex-col border-r border-aw-border bg-aw-bg-soft">
      <div className="border-b border-aw-border px-3 py-2 text-xs font-semibold uppercase text-aw-text-soft">
        Files
      </div>
      <div className="flex-1 overflow-y-auto px-1 text-sm text-aw-text-soft">
        {currentProject ? (
          <FileTree projectPath={currentProject.path} />
        ) : (
          <p className="px-2 py-4 text-center text-xs">No project open.</p>
        )}
      </div>
    </div>
  );
}
