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

  const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase text-aw-text-soft";
  const inputClass =
    "w-full rounded-md border border-aw-border bg-aw-bg px-3 py-2 text-sm text-aw-text outline-none focus:border-aw-border-strong";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-aw-text/30 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[82vh] w-full max-w-[520px] overflow-y-auto rounded-lg border border-aw-border bg-aw-bg-soft p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 border-b border-aw-border pb-4">
          <p className="text-[11px] font-semibold uppercase text-aw-text-soft">
            Workspace
          </p>
          <h3 className="mt-1 text-2xl font-normal text-aw-text">
            Settings
          </h3>
        </div>

        <label className={labelClass}>Default shell</label>
        <input
          list="shell-suggestions"
          className={`${inputClass} mb-4`}
          value={defaultShell}
          onChange={(e) => setDefaultShell(e.target.value)}
          placeholder="Leave empty for platform default"
        />
        <datalist id="shell-suggestions">
          {SHELL_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <label className={labelClass}>Terminal font size</label>
        <input
          type="number"
          min={8}
          max={32}
          className={`${inputClass} mb-4 w-28`}
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />

        <label className={labelClass}>Terminal theme</label>
        <select
          className={`${inputClass} mb-4 w-44`}
          value={theme}
          onChange={(e) => setTheme(e.target.value as "dark" | "light")}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <label className={labelClass}>
          Ignored folders (one per line)
        </label>
        <textarea
          rows={6}
          className={`${inputClass} mb-5 font-mono text-xs leading-5`}
          value={ignored}
          onChange={(e) => setIgnored(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="h-10 rounded-md border border-aw-border bg-aw-bg-soft px-4 text-sm font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-md bg-aw-accent px-4 text-sm font-medium text-white hover:bg-aw-accent-active"
            onClick={() => void save()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
