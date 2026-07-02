import { useEffect, useState } from "react";
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
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const addPane = useWorkspaceStore((s) => s.addPane);
  const closeProject = useWorkspaceStore((s) => s.closeProject);
  const loadProjects = useProjectsStore((s) => s.loadProjects);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    void loadProjects();
    void loadSettings();
  }, [loadProjects, loadSettings]);

  return (
    <div className="flex h-screen flex-col bg-aw-bg text-aw-text">
      <TopBar
        project={currentProject}
        onBack={() => void closeProject()}
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
  );
}
