import { useState } from "react";
import clsx from "clsx";
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

  const actionButtonClass =
    "flex h-7 w-7 items-center justify-center rounded-md text-xs text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text";
  const terminalBodyClass =
    settings.terminalTheme === "dark" ? "bg-aw-terminal" : "bg-aw-terminal-light";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-aw-border bg-aw-bg-soft">
      <div className="flex items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2 py-1.5">
        <span
          className="terminal-drag-handle cursor-grab rounded px-1 text-aw-text-muted hover:bg-aw-bg-mute hover:text-aw-text"
          title="Drag to move"
        >
          ⋮⋮
        </span>
        {editing ? (
          <input
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-aw-border bg-aw-bg px-2 py-1 text-xs text-aw-text outline-none focus:border-aw-border-strong"
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
            className="min-w-0 max-w-[34%] truncate text-left text-xs font-semibold leading-5 text-aw-text hover:text-aw-accent"
            title={pane.cwd}
            onClick={startEdit}
          >
            {pane.title}
          </button>
        )}
        <span
          className="min-w-0 flex-1 truncate font-mono text-[10px] leading-5 text-aw-text-soft"
          title={pane.cwd}
        >
          {pane.cwd}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            className={actionButtonClass}
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
            className={actionButtonClass}
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
            className={actionButtonClass}
            title="Duplicate"
            onClick={() => duplicatePane(pane.id)}
          >
            ⎘
          </button>
          <button
            className={actionButtonClass}
            title="Rename"
            onClick={startEdit}
          >
            ✎
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-aw-error hover:bg-aw-error/10"
            title="Close"
            onClick={() => removePane(pane.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className={clsx("relative flex-1 overflow-hidden p-1", terminalBodyClass)}>
        <div ref={containerRef} className="h-full w-full overflow-hidden rounded-md" />
        {exited !== undefined && (
          <div className="absolute inset-1 flex flex-col items-center justify-center gap-3 rounded-md bg-aw-terminal/90 text-center">
            <p className="text-xs text-aw-terminal-soft-text">
              Process exited with code {exited}
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-md bg-aw-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-aw-accent-active"
                onClick={() => restartPane(pane.id)}
              >
                Restart
              </button>
              <button
                className="rounded-md border border-white/10 bg-aw-terminal-mute px-3 py-1.5 text-xs font-medium text-aw-terminal-text hover:bg-aw-terminal-soft"
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
