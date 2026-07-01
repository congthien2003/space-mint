import type { Project } from "@shared/types";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useProjectsStore } from "@renderer/stores/projects.store";

interface Props {
  projects: Project[];
}

export function ProjectList({ projects }: Props): React.JSX.Element {
  const openProject = useWorkspaceStore((s) => s.openProject);
  const removeProject = useProjectsStore((s) => s.removeProject);

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 text-xs font-semibold uppercase text-aw-text-soft">
        Recent Projects
      </p>
      {projects.map((project) => (
        <div
          key={project.id}
          className="group flex items-center gap-2 rounded-md border border-aw-border bg-aw-bg-soft px-3 py-2 hover:border-aw-accent"
        >
          <button
            className="flex flex-1 flex-col items-start text-left"
            onClick={() => void openProject(project)}
          >
            <span className="text-sm font-semibold text-aw-text">
              {project.name}
            </span>
            <span
              className="truncate text-xs text-aw-text-soft"
              title={project.path}
            >
              {project.path}
            </span>
          </button>
          <button
            className="rounded px-2 py-1 text-xs text-aw-text-soft opacity-0 hover:bg-aw-bg-mute hover:text-red-400 group-hover:opacity-100"
            title="Remove from list"
            onClick={() => void removeProject(project.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
