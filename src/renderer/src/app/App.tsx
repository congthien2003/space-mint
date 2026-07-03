import { useEffect, useState } from "react";
import { ConfirmDialog } from "@renderer/shared/components/ConfirmDialog";
import { TopBar } from "@renderer/shared/components/TopBar";
import { ProjectHome } from "@renderer/features/projects/ProjectHome";
import { Workspace } from "@renderer/features/workspace/Workspace";
import { SettingsPanel } from "@renderer/features/settings/SettingsPanel";
import { useProjectsStore } from "@renderer/stores/projects.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useSettingsStore } from "@renderer/stores/settings.store";

export function App(): React.JSX.Element {
  const [showSettings, setShowSettings] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightPreview, setShowRightPreview] = useState(true);
  const [showLeaveWorkspaceConfirm, setShowLeaveWorkspaceConfirm] =
    useState(false);
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const addPane = useWorkspaceStore((s) => s.addPane);
  const closeProject = useWorkspaceStore((s) => s.closeProject);
  const openProject = useWorkspaceStore((s) => s.openProject);
  const loadProjects = useProjectsStore((s) => s.loadProjects);
  const addProject = useProjectsStore((s) => s.addProject);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    let disposed = false;

    const openPath = async (path: string): Promise<void> => {
      const project = await addProject(path);
      if (!project || disposed) return;
      await openProject(project);
    };

    const removeOpenRequestedListener = window.app.projects.onOpenRequested(
      (path) => {
        void openPath(path);
      }
    );

    void (async () => {
      await Promise.all([loadProjects(), loadSettings()]);
      if (disposed) return;
      const pendingOpenPath = await window.app.projects.getPendingOpenPath();
      if (pendingOpenPath && !disposed) {
        await openPath(pendingOpenPath);
      }
    })();

    return () => {
      disposed = true;
      removeOpenRequestedListener();
    };
  }, [addProject, loadProjects, loadSettings, openProject]);

  const handleConfirmBack = async (): Promise<void> => {
    await closeProject();
    setShowLeaveWorkspaceConfirm(false);
  };

  return (
    <>
      <div className="flex h-screen flex-col bg-aw-bg text-aw-text">
        <TopBar
          project={currentProject}
          onBack={() => setShowLeaveWorkspaceConfirm(true)}
          onAddTerminal={() =>
            void addPane({
              cwd: currentProject?.path ?? "",
              title: "Terminal"
            })
          }
          onOpenSettings={() => setShowSettings(true)}
          showLeftSidebar={showLeftSidebar}
          showRightPreview={showRightPreview}
          onToggleLeftSidebar={() => setShowLeftSidebar((value) => !value)}
          onToggleRightPreview={() => setShowRightPreview((value) => !value)}
        />
        {currentProject ? (
          <Workspace
            showLeftSidebar={showLeftSidebar}
            showRightPreview={showRightPreview}
            onToggleLeftSidebar={() => setShowLeftSidebar((value) => !value)}
            onToggleRightPreview={() => setShowRightPreview((value) => !value)}
          />
        ) : (
          <ProjectHome />
        )}
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </div>
      <ConfirmDialog
        open={showLeaveWorkspaceConfirm}
        title="Return to project list?"
        description={
          currentProject
            ? `You will leave ${currentProject.name} and return to the recent project list. This does not remove the project from Space Mint.`
            : ""
        }
        confirmLabel="Back to projects"
        intent="default"
        onConfirm={handleConfirmBack}
        onClose={() => setShowLeaveWorkspaceConfirm(false)}
      />
    </>
  );
}
