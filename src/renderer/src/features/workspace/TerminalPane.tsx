import { useState } from "react";
import type { TerminalPane as TerminalPaneType } from "@shared/types";
import { useSettingsStore } from "@renderer/stores/settings.store";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { useTerminal } from "@renderer/shared/hooks/useTerminal";

interface Props {
  pane: TerminalPaneType;
}

export function TerminalPane({ pane }: Props): React.JSX.Element {
  const settings = useSettingsStore((s) => s.settings);
  const exited = useWorkspaceStore((s) => s.exitedPanes[pane.id]);
  const removePane = useWorkspaceStore((s) => s.removePane);
  const renamePane = useWorkspaceStore((s) => s.renamePane);
  const duplicatePane = useWorkspaceStore((s) => s.duplicatePane);
  const addPane = useWorkspaceStore((s) => s.addPane);
  const markExited = useWorkspaceStore((s) => s.markExited);
  const restartPane = useWorkspaceStore((s) => s.restartPane);

  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(pane.title);

  const { containerRef } = useTerminal({
    terminalId: pane.id,
    fontSize: settings.terminalFontSize,
    theme: settings.terminalTheme,
    onExit: (code) => markExited(pane.id, code)
  });

  const startEdit = (): void => {
    setTitleDraft(pane.title);
    setEditing(true);
  };
  const commitEdit = (): void => {
    renamePane(pane.id, titleDraft.trim() || "Terminal");
    setEditing(false);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md border border-aw-border bg-aw-bg">
      <div className="flex items-center gap-1 border-b border-aw-border bg-aw-bg-soft px-2 py-1">
        <span
          className="terminal-drag-handle cursor-grab px-0.5 select-none text-aw-text-soft"
          title="Drag to move"
        >
          ⋮⋮
        </span>
        {editing ? (
          <input
            autoFocus
            className="rounded bg-aw-bg-mute px-1 py-0.5 text-xs text-aw-text outline-none"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <button
            className="truncate text-xs font-semibold text-aw-text hover:underline"
            title={pane.cwd}
            onClick={startEdit}
          >
            {pane.title}
          </button>
        )}
        <span
          className="ml-1 truncate text-[10px] text-aw-text-soft"
          title={pane.cwd}
        >
          {pane.cwd}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            className="px-1 text-xs text-aw-text-soft hover:text-aw-text"
            title="Split right"
            onClick={() =>
              addPane({
                cwd: pane.cwd,
                shell: pane.shell,
                fromPaneId: pane.id,
                direction: "right",
                title: pane.title
              })
            }
          >
            ⇥
          </button>
          <button
            className="px-1 text-xs text-aw-text-soft hover:text-aw-text"
            title="Split down"
            onClick={() =>
              addPane({
                cwd: pane.cwd,
                shell: pane.shell,
                fromPaneId: pane.id,
                direction: "down",
                title: pane.title
              })
            }
          >
            ⇣
          </button>
          <button
            className="px-1 text-xs text-aw-text-soft hover:text-aw-text"
            title="Duplicate"
            onClick={() => duplicatePane(pane.id)}
          >
            ⎘
          </button>
          <button
            className="px-1 text-xs text-aw-text-soft hover:text-aw-text"
            title="Rename"
            onClick={startEdit}
          >
            ✎
          </button>
          <button
            className="px-1 text-xs text-red-400 hover:text-red-300"
            title="Close"
            onClick={() => removePane(pane.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden p-1">
        <div ref={containerRef} className="h-full w-full" />
        {exited !== undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-aw-bg/80 text-center">
            <p className="text-xs text-aw-text-soft">
              Process exited with code {exited}
            </p>
            <div className="flex gap-2">
              <button
                className="rounded bg-aw-accent px-2 py-1 text-xs text-white hover:opacity-90"
                onClick={() => restartPane(pane.id)}
              >
                Restart
              </button>
              <button
                className="rounded bg-aw-bg-mute px-2 py-1 text-xs text-aw-text hover:opacity-80"
                onClick={() => removePane(pane.id)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
