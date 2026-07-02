# Phase 4 - Settings + Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Implement settings panel (shell, font, theme, ignored folders), live apply settings to terminals + file tree, error handling polish, and final integration verification.

**Architecture:** SettingsPanel modal in renderer reads/writes via useSettingsStore. TerminalPane + FileTree reactively apply settings changes. Error states handled per spec Section 10.

**Prerequisite:** Phase 0 + 1 + 2 + 3 completed.

**Tech Stack:** React 19, Zustand, Tailwind CSS, xterm.js.

**Spec reference:** `docs/superpowers/specs/2026-01-07-space-mint-phase1-design.md` (Sections 9.5-9.7, 10, 12)

---

## File Structure Map

### Files to Create
| File | Responsibility |
|---|---|
| `src/renderer/src/features/settings/SettingsPanel.tsx` | Settings modal UI |

### Files to Modify
| File | Change |
|---|---|
| `src/renderer/src/app/App.tsx` | Replace settings placeholder with SettingsPanel |
| `src/renderer/src/features/workspace/TerminalPane.tsx` | Live apply fontSize + theme from settings |
| `src/renderer/src/features/file-tree/FileTree.tsx` | Re-read on ignored folders change |
| `src/renderer/src/shared/components/TopBar.tsx` | Add Save Layout button |
| `src/main/services/ProjectService.ts` | Inject LayoutService for remove cleanup |

---
## Task 1: Tao SettingsPanel component

**Files:** Create `src/renderer/src/features/settings/SettingsPanel.tsx`

```tsx
import { useState, useEffect } from "react";
import { useSettingsStore } from "@renderer/stores/settings.store";

interface Props { onClose: () => void; }

export function SettingsPanel({ onClose }: Props): React.JSX.Element {
  const store = useSettingsStore();
  const [form, setForm] = useState(store.settings);

  useEffect(() => { setForm(store.settings); }, [store.settings]);

  const handleSave = async (): Promise<void> => {
    const ignored = form.ignoredFolders.length > 0
      ? form.ignoredFolders.filter(Boolean)
      : store.settings.ignoredFolders;
    await store.updateSettings({ ...form, ignoredFolders: ignored });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-96 rounded-lg bg-aw-bg-soft p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-aw-text">Settings</h2>

        <label className="mb-1 block text-xs text-aw-text-soft">Default Shell</label>
        <input className="mb-3 w-full rounded border border-aw-border bg-aw-bg px-2 py-1 text-sm text-aw-text"
               value={form.defaultShell} placeholder="Auto-detected"
               onChange={(e) => setForm({ ...form, defaultShell: e.target.value })} />

        <label className="mb-1 block text-xs text-aw-text-soft">Font Size</label>
        <input className="mb-3 w-full rounded border border-aw-border bg-aw-bg px-2 py-1 text-sm text-aw-text"
               type="number" min={8} max={32} value={form.terminalFontSize}
               onChange={(e) => setForm({ ...form, terminalFontSize: Number(e.target.value) })} />

        <label className="mb-1 block text-xs text-aw-text-soft">Theme</label>
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-1 text-sm text-aw-text">
            <input type="radio" name="theme" value="dark" checked={form.terminalTheme === "dark"}
                   onChange={() => setForm({ ...form, terminalTheme: "dark" })} /> Dark
          </label>
          <label className="flex items-center gap-1 text-sm text-aw-text">
            <input type="radio" name="theme" value="light" checked={form.terminalTheme === "light"}
                   onChange={() => setForm({ ...form, terminalTheme: "light" })} /> Light
          </label>
        </div>

        <label className="mb-1 block text-xs text-aw-text-soft">Ignored Folders (one per line)</label>
        <textarea className="mb-4 w-full rounded border border-aw-border bg-aw-bg px-2 py-1 text-sm text-aw-text" rows={4}
                  value={form.ignoredFolders.join("\n")}
                  onChange={(e) => setForm({ ...form, ignoredFolders: e.target.value.split("\n") })} />

        <div className="flex gap-2 justify-end">
          <button className="rounded bg-aw-bg-mute px-3 py-1 text-sm text-aw-text" onClick={onClose}>Cancel</button>
          <button className="rounded bg-aw-accent px-3 py-1 text-sm text-white" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
```

Verify: `pnpm typecheck:web` -> PASS.

---

## Task 2: Update App.tsx - wire SettingsPanel

**Files:** Modify `src/renderer/src/app/App.tsx`

Replace the settings placeholder modal with `<SettingsPanel onClose={() => setShowSettings(false)} />`.

---

## Task 3: Live apply settings to TerminalPane

**Files:** Modify `src/renderer/src/features/workspace/TerminalPane.tsx`

In useTerminal hook (or TerminalPane), listen to settings changes. When fontSize changes, update `terminal.options.fontSize`. When theme changes, update `terminal.options.theme`.

The useTerminal hook already takes fontSize and theme as deps [terminalId, fontSize, theme, containerRef] - but the terminal is created once in useEffect. To live-apply without remount, add a separate useEffect:

```ts
useEffect(() => {
  if (terminalRef.current) {
    terminalRef.current.options.fontSize = fontSize;
    terminalRef.current.options.theme = theme === "dark" ? DARK_THEME : LIGHT_THEME;
  }
}, [fontSize, theme]);
```

Add this to useTerminal hook after the main useEffect.

---

## Task 4: Live apply ignored folders to FileTree

**Files:** Modify `src/renderer/src/features/file-tree/FileTree.tsx`

Add `useSettingsStore` to read ignoredFolders (for potential future use - actual filtering is server-side via FileTreeService which reads from settings on each call). The FileTreeService already uses `getIgnoredFolders()` callback which returns current settings. No renderer change needed beyond ensuring re-read triggers if ignored folders change.

---

## Task 5: Error handling polish

### Terminal spawn error
In workspace.store addPane/splitPane, catch errors from createTerminal. If error, show error state in store that TerminalPane can display:
- Add `terminalErrors: Record<string, string>` to workspace store
- On createTerminal failure, set error for that pane
- TerminalPane displays error overlay if terminalId has error

### File tree permission error
FileTreeService.readChildren already throws on EACCES. FileTreeNode should catch in its load:
```ts
const loaded = await window.app.files.readChildren(node.path).catch(() => []);
```
If empty after error, show a "Cannot read" indicator.

---

## Task 6: TopBar Save Layout button

**Files:** Modify `src/renderer/src/shared/components/TopBar.tsx`

Add "Save Layout" button next to "+ Terminal". On click, trigger immediate save (call `_debouncedSave` directly or add a `saveLayout` action to store that saves immediately without debounce).

---

## Task 7: Run verify Phase 4

Run: `pnpm dev`

- Open Settings -> change font size -> terminals update immediately
- Change theme dark/light -> terminals update
- Change ignored folders -> save -> file tree re-reads (after project reopen)
- Terminal spawn error (set invalid shell) -> error message displays
- Save Layout button works
- All Phase 1 acceptance criteria pass

---

## Phase 4 Acceptance Criteria

- [ ] Settings panel opens and saves
- [ ] Font size live-applies to all terminals
- [ ] Theme live-applies
- [ ] Ignored folders setting works
- [ ] Terminal spawn error shows message
- [ ] Folder permission error handled gracefully
- [ ] Save Layout button works
- [ ] App closes cleanly with no process orphans
- [ ] All 15 spec acceptance criteria pass
