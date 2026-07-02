import { useState } from "react";
import clsx from "clsx";
import { Columns2, Copy, Ellipsis, Pencil, Rows2, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-aw-text-soft transition hover:bg-aw-bg-mute hover:text-aw-text focus:bg-aw-bg-mute focus:text-aw-text focus:outline-none";
  const dangerButtonClass =
    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-aw-text-soft transition hover:bg-aw-error/10 hover:text-aw-error focus:bg-aw-error/10 focus:text-aw-error focus:outline-none";
  const menuItemClass =
    "flex h-7 w-full items-center gap-2 whitespace-nowrap px-2.5 text-left text-xs text-aw-text-soft transition hover:bg-aw-bg-mute hover:text-aw-text focus:bg-aw-bg-mute focus:text-aw-text focus:outline-none";
  const iconSlotClass =
    "flex h-4 w-4 shrink-0 items-center justify-center text-aw-text-muted";
  const terminalBodyClass =
    settings.terminalTheme === "dark"
      ? "bg-aw-terminal shadow-term-inset"
      : "bg-aw-terminal-light";
  const exitOverlayClass =
    settings.terminalTheme === "dark"
      ? "bg-aw-terminal/95 text-aw-terminal-text"
      : "bg-aw-terminal-light/95 text-aw-terminal-text-light";
  const exitTextClass =
    settings.terminalTheme === "dark"
      ? "text-aw-terminal-soft-text"
      : "text-aw-terminal-ink-soft-light";
  const statusDotClass =
    exited === undefined
      ? "bg-aw-success shadow-[0_0_0_3px_rgba(31,138,101,0.10)]"
      : "bg-aw-error shadow-[0_0_0_3px_rgba(207,45,86,0.10)]";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-aw-border bg-aw-bg-soft">
      <div className="flex h-9 items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2.5">
        <button
          type="button"
          className="terminal-drag-handle flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded-md text-[13px] leading-none text-aw-text-muted transition hover:bg-aw-bg-mute hover:text-aw-text focus:bg-aw-bg-mute focus:text-aw-text focus:outline-none active:cursor-grabbing"
          title="Drag to move"
          aria-label="Drag terminal pane"
        >
          ⋮⋮
        </button>
        {editing ? (
          <input
            autoFocus
            className="h-6 min-w-0 flex-1 rounded-md border border-aw-border bg-aw-bg px-2 text-xs font-medium text-aw-text outline-none transition focus:border-aw-border-strong focus:shadow-term-focus"
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
            className="group flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-0.5 text-left transition hover:bg-aw-bg-mute focus:bg-aw-bg-mute focus:outline-none"
            title={pane.cwd}
            onClick={startEdit}
          >
            <span
              className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass)}
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-mono text-xs font-semibold leading-4 text-aw-text group-hover:text-aw-accent">
                {pane.title}
              </span>
              <span className="-mt-0.5 truncate font-mono text-[10px] leading-3 text-aw-text-muted">
                {pane.cwd}
              </span>
            </span>
          </button>
        )}
        <div className="relative ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            className={actionButtonClass}
            title="More actions"
            aria-label="More terminal actions"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Ellipsis size={14} />
          </button>
          <button
            type="button"
            className={dangerButtonClass}
            title="Close"
            aria-label="Close terminal pane"
            onClick={() => void removePane(pane.id)}
          >
            <X size={14} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                }}
              />
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-[176px] overflow-hidden rounded-md border border-aw-border-strong bg-aw-bg-soft py-1 shadow-lg shadow-aw-text/10"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    void addPane({
                      cwd: pane.cwd,
                      shell: pane.shell,
                      fromPaneId: pane.id,
                      direction: "right",
                      title: pane.title
                    });
                  }}
                >
                  <span className={iconSlotClass}>
                    <Columns2 size={13} />
                  </span>
                  <span>Split right</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    void addPane({
                      cwd: pane.cwd,
                      shell: pane.shell,
                      fromPaneId: pane.id,
                      direction: "down",
                      title: pane.title
                    });
                  }}
                >
                  <span className={iconSlotClass}>
                    <Rows2 size={13} />
                  </span>
                  <span>Split down</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    void duplicatePane(pane.id);
                  }}
                >
                  <span className={iconSlotClass}>
                    <Copy size={13} />
                  </span>
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    startEdit();
                  }}
                >
                  <span className={iconSlotClass}>
                    <Pencil size={13} />
                  </span>
                  <span>Rename</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={clsx(
          "relative flex-1 overflow-hidden p-1",
          terminalBodyClass
        )}
      >
        <div
          ref={containerRef}
          className="h-full w-full overflow-hidden rounded-md"
        />
        {exited !== undefined && (
          <div
            className={clsx(
              "absolute inset-1 flex flex-col items-center justify-center gap-3 rounded-md border border-white/10 text-center backdrop-blur-sm",
              exitOverlayClass
            )}
          >
            <div>
              <p className="text-xs font-semibold">Terminal stopped</p>
              <p className={clsx("mt-1 text-[11px]", exitTextClass)}>
                Process exited with code {exited}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-7 rounded-md bg-aw-accent px-3 text-xs font-medium text-white transition hover:bg-aw-accent-active focus:outline-none focus:ring-2 focus:ring-aw-accent/30"
                onClick={() => void restartPane(pane.id)}
              >
                Restart
              </button>
              <button
                type="button"
                className={clsx(
                  "h-7 rounded-md border px-3 text-xs font-medium transition focus:outline-none",
                  settings.terminalTheme === "dark"
                    ? "border-white/10 bg-aw-terminal-mute text-aw-terminal-text hover:bg-aw-terminal-soft"
                    : "border-aw-border bg-aw-bg-soft text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
                )}
                onClick={() => void removePane(pane.id)}
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
