import { useState } from "react";
import type { AppSettings } from "@shared/types";
import { useSettingsStore } from "@renderer/stores/settings.store";

interface Props {
  onClose: () => void;
}

const SHELL_SUGGESTIONS = ["powershell.exe", "cmd.exe", "/bin/bash", "/bin/zsh"];

export function SettingsPanel({ onClose }: Props): React.JSX.Element {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [defaultShell, setDefaultShell] = useState(settings.defaultShell);
  const [fontSize, setFontSize] = useState(String(settings.terminalFontSize));
  const [theme, setTheme] = useState(settings.terminalTheme);
  const [ignored, setIgnored] = useState(settings.ignoredFolders.join("\n"));

  const save = async (): Promise<void> => {
    const next: Partial<AppSettings> = {
      defaultShell: defaultShell.trim(),
      terminalFontSize: Number(fontSize) || 14,
      terminalTheme: theme,
      ignoredFolders: ignored
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    };
    await updateSettings(next);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-[480px] overflow-y-auto rounded-lg border border-aw-border bg-aw-bg-soft p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-base font-semibold text-aw-text">Settings</h3>

        <label className="mb-1 block text-xs text-aw-text-soft">
          Default shell
        </label>
        <input
          list="shell-suggestions"
          className="mb-4 w-full rounded bg-aw-bg-mute px-2 py-1 text-sm text-aw-text outline-none"
          value={defaultShell}
          onChange={(e) => setDefaultShell(e.target.value)}
          placeholder="Leave empty for platform default"
        />
        <datalist id="shell-suggestions">
          {SHELL_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <label className="mb-1 block text-xs text-aw-text-soft">
          Terminal font size
        </label>
        <input
          type="number"
          min={8}
          max={32}
          className="mb-4 w-24 rounded bg-aw-bg-mute px-2 py-1 text-sm text-aw-text outline-none"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />

        <label className="mb-1 block text-xs text-aw-text-soft">
          Terminal theme
        </label>
        <select
          className="mb-4 w-40 rounded bg-aw-bg-mute px-2 py-1 text-sm text-aw-text outline-none"
          value={theme}
          onChange={(e) => setTheme(e.target.value as "dark" | "light")}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <label className="mb-1 block text-xs text-aw-text-soft">
          Ignored folders (one per line)
        </label>
        <textarea
          rows={6}
          className="mb-4 w-full rounded bg-aw-bg-mute px-2 py-1 font-mono text-xs text-aw-text outline-none"
          value={ignored}
          onChange={(e) => setIgnored(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="rounded bg-aw-bg-mute px-3 py-1.5 text-sm text-aw-text hover:opacity-80"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-aw-accent px-3 py-1.5 text-sm text-white hover:opacity-90"
            onClick={() => void save()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
