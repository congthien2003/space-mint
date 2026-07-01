import { useEffect, useState } from "react";
import { TopBar } from "@renderer/shared/components/TopBar";
import { ProjectHome } from "@renderer/features/projects/ProjectHome";
import { Workspace } from "@renderer/features/workspace/Workspace";
import { useProjectsStore } from "@renderer/stores/projects.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useSettingsStore } from "@renderer/stores/settings.store";

export function App(): React.JSX.Element {
  const [showSettings, setShowSettings] = useState(false);
  const currentProject = useWorkspaceStore((s) => s.currentProject);
  const setCurrentProject = useWorkspaceStore((s) => s.setCurrentProject);
  const loadProjects = useProjectsStore((s) => s.loadProjects);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, [loadProjects, loadSettings]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        project={currentProject}
        onBack={() => setCurrentProject(null)}
        onOpenSettings={() => setShowSettings(true)}
      />
      {currentProject ? <Workspace /> : <ProjectHome />}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="rounded-lg bg-aw-bg-soft p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-aw-text-soft">
              Settings panel coming in Phase 4
            </p>
            <button
              className="mt-4 rounded bg-aw-bg-mute px-3 py-1 text-sm text-aw-text hover:opacity-80"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
