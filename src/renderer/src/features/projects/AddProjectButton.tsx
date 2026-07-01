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
      className="rounded bg-aw-accent px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "Adding…" : "+ Add Project"}
    </button>
  );
}
