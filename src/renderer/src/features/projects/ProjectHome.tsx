import { useState } from "react";
import type { Project } from "@shared/types";
import { ConfirmDialog } from "@renderer/shared/components/ConfirmDialog";
import { AppBrand } from "@renderer/shared/components/AppBrand";
import { useProjectsStore } from "@renderer/stores/projects.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { AddProjectButton } from "./AddProjectButton";
import { ProjectList } from "./ProjectList";

export function ProjectHome(): React.JSX.Element {
  const [projectPendingRemoval, setProjectPendingRemoval] = useState<Project | null>(
    null
  );
  const projects = useProjectsStore((s) => s.projects);
  const loading = useProjectsStore((s) => s.loading);
  const error = useProjectsStore((s) => s.error);
  const openProject = useWorkspaceStore((s) => s.openProject);
  const removeProject = useProjectsStore((s) => s.removeProject);

  const handleConfirmRemove = async (): Promise<void> => {
    if (!projectPendingRemoval) return;
    await removeProject(projectPendingRemoval.id);
    setProjectPendingRemoval(null);
  };

  return (
    <>
      <div className="flex flex-1 overflow-y-auto bg-aw-bg">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-6">
          <div className="flex items-start justify-between gap-4 border-b border-aw-border pb-4">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-semibold uppercase text-aw-text-soft">
                Local workspaces
              </p>
              <AppBrand
                className="items-start gap-3.5"
                iconClassName="h-12 w-12 rounded-[18px]"
                titleClassName="text-2xl font-normal leading-tight"
                titleTag="h2"
                subtitle="Open a project, browse its files, and arrange real terminal sessions in a saved workspace."
                subtitleClassName="max-w-xl"
              />
            </div>
            <AddProjectButton />
          </div>

          {error && (
            <p className="aw-fade-in rounded-md border border-aw-error/30 bg-aw-error/10 px-3 py-2 text-sm text-aw-error">
              {error}
            </p>
          )}

          {loading ? (
            <p className="aw-fade-in text-sm text-aw-text-soft">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <div className="aw-fade-in rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-6 py-10 text-center">
              <p className="text-base font-medium text-aw-text">
                No project added yet.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-aw-text-soft">
                Choose a local folder to start a workspace with file tree access
                and terminal panes.
              </p>
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onOpenProject={(project) => void openProject(project)}
              onRequestRemove={setProjectPendingRemoval}
            />
          )}
        </div>
      </div>
      <ConfirmDialog
        open={projectPendingRemoval !== null}
        title="Remove project from recent list?"
        description={
          projectPendingRemoval
            ? `${projectPendingRemoval.name} will be removed from Space Mint only. The folder and its files stay untouched on disk.`
            : ""
        }
        confirmLabel="Remove from list"
        intent="danger"
        onConfirm={handleConfirmRemove}
        onClose={() => setProjectPendingRemoval(null)}
      />
    </>
  );
}
