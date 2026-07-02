import { useState } from "react";
import { useProjectsStore } from "@renderer/stores/projects.store";

export function AddProjectButton(): React.JSX.Element {
  const addProject = useProjectsStore((s) => s.addProject);
  const [busy, setBusy] = useState(false);

  const onClick = async (): Promise<void> => {
    setBusy(true);
    try {
      const path = await window.app.projects.selectFolder();
      if (path) {
        await addProject(path);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="aw-action h-10 rounded-md bg-aw-accent px-4 text-sm font-medium text-white shadow-[0_8px_22px_rgba(229,57,53,0.18)] hover:bg-aw-accent-active disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "Adding…" : "+ Add Project"}
    </button>
  );
}
