import { useProjectsStore } from "@renderer/stores/projects.store";
import { AddProjectButton } from "./AddProjectButton";
import { ProjectList } from "./ProjectList";

export function ProjectHome(): React.JSX.Element {
  const projects = useProjectsStore((s) => s.projects);
  const loading = useProjectsStore((s) => s.loading);
  const error = useProjectsStore((s) => s.error);

  return (
    <div className="flex flex-1 overflow-y-auto bg-aw-bg">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-aw-text">
              Agent Workspace
            </h2>
            <p className="text-sm text-aw-text-soft">
              Add a local project to open a multi-terminal workspace.
            </p>
          </div>
          <AddProjectButton />
        </div>

        {error && (
          <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-aw-text-soft">Loading projects…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-aw-border px-6 py-12 text-center">
            <p className="text-sm text-aw-text-soft">No project added yet.</p>
            <p className="mt-1 text-xs text-aw-text-soft">
              Click <span className="text-aw-text">Add Project</span> to choose a
              folder.
            </p>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </div>
  );
}
