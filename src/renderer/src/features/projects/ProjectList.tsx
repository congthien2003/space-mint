import type { Project } from "@shared/types";

interface Props {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onRequestRemove: (project: Project) => void;
}

export function ProjectList({
  projects,
  onOpenProject,
  onRequestRemove
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase text-aw-text-soft">
        Recent Projects
      </p>
      {projects.map((project) => (
        <div
          key={project.id}
          className="group flex items-center gap-3 rounded-lg border border-aw-border bg-aw-bg-soft px-3 py-2 hover:border-aw-border-strong"
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 flex-col items-start text-left"
            onClick={() => onOpenProject(project)}
          >
            <span className="text-sm font-semibold leading-5 text-aw-text">
              {project.name}
            </span>
            <span
              className="w-full truncate font-mono text-[11px] leading-5 text-aw-text-soft"
              title={project.path}
            >
              {project.path}
            </span>
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs font-medium text-aw-text-muted opacity-0 hover:bg-aw-bg-mute hover:text-aw-error group-hover:opacity-100"
            title="Remove from list"
            onClick={() => onRequestRemove(project)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
