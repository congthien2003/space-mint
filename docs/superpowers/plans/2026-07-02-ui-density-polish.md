# UI Density Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish all in-product UI surfaces to a Linear/Raycast-style dense, structured aesthetic — tighter padding, compact controls, and a 1px hairline border on every region — while preserving the existing cream/ink/Crimson palette, typography, and "no drop shadows" rule.

**Architecture:** Pure className edits across 9 renderer components + prose updates to `DESIGN.md`. Zero logic, state, IPC, or token changes. Each task is independent and committable. Verification is `pnpm typecheck:web` per task (catches JSX/TS breakage) plus a final full `pnpm typecheck` + `pnpm build`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3 (existing `aw-*` color tokens), Electron + electron-vite, pnpm.

**Spec:** `docs/superpowers/specs/2026-07-02-ui-density-polish-design.md`

---

## File Structure

All changes are modifications to existing files — no new files created.

| File | Responsibility | Change |
| --- | --- | --- |
| `src/renderer/src/shared/components/TopBar.tsx` | Top app bar (48px) | height, padding, all control sizes |
| `src/renderer/src/shared/components/Sidebar.tsx` | Left file-tree panel | header padding, hide button, empty-state border |
| `src/renderer/src/features/file-preview/FilePreviewPanel.tsx` | Right file preview panel | padding, hide button, empty-state border, pre/footer |
| `src/renderer/src/features/workspace/TerminalPane.tsx` | Individual terminal card | header padding, action button sizes |
| `src/renderer/src/features/workspace/Workspace.tsx` | Workspace shell + empty state | empty-state box padding, + New Terminal button |
| `src/renderer/src/features/workspace/WorkspacePanels.tsx` | Split terminal grid | grid container padding |
| `src/renderer/src/features/projects/ProjectHome.tsx` | Project list landing page | container/header padding, h2 size, empty state |
| `src/renderer/src/features/projects/ProjectList.tsx` | Project list cards | card padding + always-on border, gap |
| `src/renderer/src/features/settings/SettingsPanel.tsx` | Settings modal | modal padding/width, header, inputs, labels, buttons |
| `src/renderer/src/features/file-tree/FileTreeNode.tsx` | File tree row | row vertical padding tighten |
| `DESIGN.md` | Design system doc | density/border/radius prose + App Density Overrides subsection |

**Not touched:** `tailwind.config.js` (no new tokens), `globals.css`, any store, any IPC/service, any main/preload process file.

---

## Task 1: TopBar — compact 48px header

**Files:**
- Modify: `src/renderer/src/shared/components/TopBar.tsx`

- [ ] **Step 1: Reduce container height and padding**

In `src/renderer/src/shared/components/TopBar.tsx`, replace the container className:

```tsx
// old
<div className="flex h-16 items-center gap-4 border-b border-aw-border bg-aw-bg px-5">
// new
<div className="flex h-12 items-center gap-3 border-b border-aw-border bg-aw-bg px-3">
```

- [ ] **Step 2: Shrink the shared toggle button class**

Replace the `toggleButtonClass` string:

```tsx
// old
const toggleButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition";
// new
const toggleButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition";
```

- [ ] **Step 3: Compact the back button**

Replace the back button className:

```tsx
// old
className="rounded-md border border-aw-border-strong bg-aw-bg-soft px-3 py-2 text-sm font-medium text-aw-text hover:bg-aw-bg-mute"
// new
className="rounded-md border border-aw-border-strong bg-aw-bg-soft px-2.5 text-xs font-medium text-aw-text hover:bg-aw-bg-mute"
```

- [ ] **Step 4: Compact the + Terminal button**

Replace the + Terminal button className:

```tsx
// old
className={clsx(
  "h-10 rounded-md px-4 text-sm font-medium",
  "bg-aw-accent text-white hover:bg-aw-accent-active"
)}
// new
className={clsx(
  "h-7 rounded-md px-3 text-xs font-medium",
  "bg-aw-accent text-white hover:bg-aw-accent-active"
)}
```

- [ ] **Step 5: Compact the Settings button**

Replace the Settings button className:

```tsx
// old
className="h-10 rounded-md border border-aw-border bg-aw-bg-soft px-3 text-sm font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
// new
className="h-7 rounded-md border border-aw-border bg-aw-bg-soft px-2.5 text-xs font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
```

- [ ] **Step 6: Run typecheck to verify no breakage**

Run: `pnpm typecheck:web`
Expected: PASS (no errors). className edits don't affect types, but this catches any accidental JSX breakage.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/shared/components/TopBar.tsx
git commit -m "polish(ui): compact TopBar to 48px with tighter controls"
```

---

## Task 2: Sidebar — tighter padding + bordered empty state

**Files:**
- Modify: `src/renderer/src/shared/components/Sidebar.tsx`

- [ ] **Step 1: Tighten the header padding**

Replace the header div className:

```tsx
// old
<div className="flex items-center justify-between border-b border-aw-border px-4 py-3">
// new
<div className="flex items-center justify-between border-b border-aw-border px-3 py-2">
```

- [ ] **Step 2: Shrink the hide button**

Replace the hide button className:

```tsx
// old
className="flex h-7 w-7 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text"
// new
className="flex h-6 w-6 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text"
```

- [ ] **Step 3: Tighten the body padding**

Replace the body div className:

```tsx
// old
<div className="flex-1 overflow-y-auto px-2 py-2 text-sm text-aw-text-soft">
// new
<div className="flex-1 overflow-y-auto px-1.5 py-1.5 text-sm text-aw-text-soft">
```

- [ ] **Step 4: Add border to the empty state**

Replace the empty-state `<p>` (the "No project open." text) with a bordered box:

```tsx
// old
<p className="px-2 py-4 text-center text-xs text-aw-text-soft">
  No project open.
</p>
// new
<div className="m-2 rounded-lg border border-aw-border bg-aw-bg px-3 py-4 text-center text-xs text-aw-text-soft">
  No project open.
</div>
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/shared/components/Sidebar.tsx
git commit -m "polish(ui): tighten Sidebar padding and border the empty state"
```

---

## Task 3: FilePreviewPanel — tighter padding + bordered empty state

**Files:**
- Modify: `src/renderer/src/features/file-preview/FilePreviewPanel.tsx`

- [ ] **Step 1: Tighten the header padding**

Replace the header div className:

```tsx
// old
<div className="border-b border-aw-border px-4 py-3">
// new
<div className="border-b border-aw-border px-3 py-2">
```

- [ ] **Step 2: Shrink the hide button**

Replace the hide button className:

```tsx
// old
className="flex h-7 w-7 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text"
// new
className="flex h-6 w-6 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text"
```

- [ ] **Step 3: Border the "Select a file" empty state**

Replace the no-file empty-state block. The outer wrapper stays; the inner `<p>` becomes a bordered box:

```tsx
// old
<div className="flex h-full items-center justify-center px-8 text-center">
  <p className="text-sm leading-6 text-aw-text-soft">
    Select a file to preview.
  </p>
</div>
// new
<div className="flex h-full items-center justify-center px-6 text-center">
  <p className="rounded-lg border border-aw-border bg-aw-bg px-3 py-6 text-sm leading-6 text-aw-text-soft">
    Select a file to preview.
  </p>
</div>
```

- [ ] **Step 4: Tighten the `<pre>` content padding**

Replace the `<pre>` className:

```tsx
// old
className="h-full overflow-auto whitespace-pre-wrap break-words bg-aw-bg px-4 py-3 font-mono text-[12px] leading-5 text-aw-text"
// new
className="h-full overflow-auto whitespace-pre-wrap break-words bg-aw-bg px-3 py-2 font-mono text-[12px] leading-5 text-aw-text"
```

- [ ] **Step 5: Tighten the footer padding**

Replace the footer div className:

```tsx
// old
<div className="border-t border-aw-border px-4 py-2 text-[10px] text-aw-text-muted">
// new
<div className="border-t border-aw-border px-3 py-1.5 text-[10px] text-aw-text-muted">
```

- [ ] **Step 6: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/features/file-preview/FilePreviewPanel.tsx
git commit -m "polish(ui): tighten FilePreviewPanel padding and border the empty state"
```

---

## Task 4: TerminalPane — compact header + smaller action buttons

**Files:**
- Modify: `src/renderer/src/features/workspace/TerminalPane.tsx`

- [ ] **Step 1: Tighten the header padding**

Replace the header div className:

```tsx
// old
<div className="flex items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2 py-1.5">
// new
<div className="flex items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2.5 py-1">
```

- [ ] **Step 2: Shrink the shared action button class**

Replace the `actionButtonClass` string:

```tsx
// old
const actionButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-md text-xs text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text";
// new
const actionButtonClass =
  "flex h-6 w-6 items-center justify-center rounded-md text-xs text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text";
```

- [ ] **Step 3: Shrink the close button**

Replace the close button className (it uses its own class, not `actionButtonClass`):

```tsx
// old
className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-aw-error hover:bg-aw-error/10"
// new
className="flex h-6 w-6 items-center justify-center rounded-md text-xs text-aw-error hover:bg-aw-error/10"
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/features/workspace/TerminalPane.tsx
git commit -m "polish(ui): compact TerminalPane header and action buttons"
```

---

## Task 5: Workspace shell + grid — tighter empty state and padding

**Files:**
- Modify: `src/renderer/src/features/workspace/Workspace.tsx`
- Modify: `src/renderer/src/features/workspace/WorkspacePanels.tsx`

> **Note:** The spec attributed the empty-state and "+ New Terminal" button to
> `WorkspacePanels.tsx`, but they live in `Workspace.tsx` (WorkspacePanels only renders
> when panes exist). This task touches both files.

- [ ] **Step 1: Tighten the workspace empty-state box (Workspace.tsx)**

In `src/renderer/src/features/workspace/Workspace.tsx`, replace the empty-state box className:

```tsx
// old
<div className="rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-10 py-9 text-center">
// new
<div className="rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-6 py-8 text-center">
```

- [ ] **Step 2: Compact the + New Terminal button (Workspace.tsx)**

Replace the + New Terminal button className:

```tsx
// old
className="h-10 rounded-md bg-aw-accent px-4 text-sm font-medium text-white hover:bg-aw-accent-active"
// new
className="h-7 rounded-md bg-aw-accent px-3 text-xs font-medium text-white hover:bg-aw-accent-active"
```

- [ ] **Step 3: Tighten the grid container padding (WorkspacePanels.tsx)**

In `src/renderer/src/features/workspace/WorkspacePanels.tsx`, replace the grid container className (inside `WorkspacePanels` return):

```tsx
// old
<div className="h-full w-full min-h-0 min-w-0 overflow-hidden p-2">
// new
<div className="h-full w-full min-h-0 min-w-0 overflow-hidden p-1.5">
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/features/workspace/Workspace.tsx src/renderer/src/features/workspace/WorkspacePanels.tsx
git commit -m "polish(ui): tighten workspace empty state and grid padding"
```

---

## Task 6: ProjectHome — tighter landing page

**Files:**
- Modify: `src/renderer/src/features/projects/ProjectHome.tsx`

- [ ] **Step 1: Tighten the container padding and gap**

Replace the container div className:

```tsx
// old
<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-8 py-10">
// new
<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-6">
```

- [ ] **Step 2: Tighten the header row**

Replace the header row div className:

```tsx
// old
<div className="flex items-start justify-between gap-6 border-b border-aw-border pb-6">
// new
<div className="flex items-start justify-between gap-4 border-b border-aw-border pb-4">
```

- [ ] **Step 3: Reduce the h2 size**

Replace the h2 className:

```tsx
// old
<h2 className="text-3xl font-normal leading-tight text-aw-text">
// new
<h2 className="text-2xl font-normal leading-tight text-aw-text">
```

- [ ] **Step 4: Tighten the empty-state box**

Replace the empty-state box className:

```tsx
// old
<div className="rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-8 py-14 text-center">
// new
<div className="rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-6 py-10 text-center">
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/features/projects/ProjectHome.tsx
git commit -m "polish(ui): tighten ProjectHome padding and h2 size"
```

---

## Task 7: ProjectList — always-on card borders + tighter gap

**Files:**
- Modify: `src/renderer/src/features/projects/ProjectList.tsx`

- [ ] **Step 1: Tighten the list gap**

Replace the container div className:

```tsx
// old
<div className="flex flex-col gap-2">
// new
<div className="flex flex-col gap-1.5">
```

- [ ] **Step 2: Make card borders always-on + tighter padding**

Replace the card div className. The current card already has a border but it only
strengthens on hover — keep that, and tighten the padding:

```tsx
// old
className="group flex items-center gap-3 rounded-lg border border-aw-border bg-aw-bg-soft px-4 py-3 hover:border-aw-border-strong"
// new
className="group flex items-center gap-3 rounded-lg border border-aw-border bg-aw-bg-soft px-3 py-2 hover:border-aw-border-strong"
```

> The border is already always-on here (`border-aw-border` is present at rest); the change
> is purely the padding (`px-4 py-3` → `px-3 py-2`). The spec's "always-on border" goal is
> already satisfied by the existing markup.

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/features/projects/ProjectList.tsx
git commit -m "polish(ui): tighten ProjectList card padding and gap"
```

---

## Task 8: SettingsPanel — compact modal

**Files:**
- Modify: `src/renderer/src/features/settings/SettingsPanel.tsx`

- [ ] **Step 1: Tighten the label class**

Replace the `labelClass` string:

```tsx
// old
const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase text-aw-text-soft";
// new
const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase text-aw-text-soft";
```

- [ ] **Step 2: Tighten the input class**

Replace the `inputClass` string:

```tsx
// old
const inputClass =
  "w-full rounded-md border border-aw-border bg-aw-bg px-3 py-2 text-sm text-aw-text outline-none focus:border-aw-border-strong";
// new
const inputClass =
  "w-full rounded-md border border-aw-border bg-aw-bg px-2.5 py-1.5 text-sm text-aw-text outline-none focus:border-aw-border-strong";
```

- [ ] **Step 3: Tighten the modal container**

Replace the modal div className:

```tsx
// old
className="max-h-[82vh] w-full max-w-[520px] overflow-y-auto rounded-lg border border-aw-border bg-aw-bg-soft p-6"
// new
className="max-h-[82vh] w-full max-w-[480px] overflow-y-auto rounded-lg border border-aw-border bg-aw-bg-soft p-4"
```

- [ ] **Step 4: Tighten the header**

Replace the header div className:

```tsx
// old
<div className="mb-6 border-b border-aw-border pb-4">
// new
<div className="mb-4 border-b border-aw-border pb-3">
```

- [ ] **Step 5: Shrink the Cancel button**

Replace the Cancel button className:

```tsx
// old
className="h-10 rounded-md border border-aw-border bg-aw-bg-soft px-4 text-sm font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
// new
className="h-8 rounded-md border border-aw-border bg-aw-bg-soft px-4 text-sm font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text"
```

- [ ] **Step 6: Shrink the Save button**

Replace the Save button className:

```tsx
// old
className="h-10 rounded-md bg-aw-accent px-4 text-sm font-medium text-white hover:bg-aw-accent-active"
// new
className="h-8 rounded-md bg-aw-accent px-4 text-sm font-medium text-white hover:bg-aw-accent-active"
```

- [ ] **Step 7: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/renderer/src/features/settings/SettingsPanel.tsx
git commit -m "polish(ui): compact SettingsPanel modal padding and buttons"
```

---

## Task 9: FileTreeNode — denser tree rows

**Files:**
- Modify: `src/renderer/src/features/file-tree/FileTreeNode.tsx`

- [ ] **Step 1: Tighten the row vertical padding**

Replace the row `className` (inside the `clsx(...)` call):

```tsx
// old
"flex cursor-pointer items-center gap-1 rounded-md px-1 py-[4px] text-xs leading-4 hover:bg-aw-bg-mute",
// new
"flex cursor-pointer items-center gap-1 rounded-md px-1 py-[3px] text-xs leading-4 hover:bg-aw-bg-mute",
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck:web`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/features/file-tree/FileTreeNode.tsx
git commit -m "polish(ui): tighten FileTreeNode row padding"
```

---

## Task 10: DESIGN.md — update density/border/radius standards

**Files:**
- Modify: `DESIGN.md`

- [ ] **Step 1: Update the Whitespace Philosophy**

In `DESIGN.md`, replace the Whitespace Philosophy paragraph (line 113):

```markdown
<!-- old -->
Generous editorial pacing — closer to a print magazine than a tech site. The cream canvas has plenty of breathing room; cards within bands sit close (16-24px gap).

<!-- new -->
Compact developer density — tight 8-12px region padding, 6-8px gaps. Regions are defined by 1px hairline borders rather than whitespace alone. Controls stay at 28px (chrome) / 24px (inline) / 32px (modal) heights.
```

- [ ] **Step 2: Add a border-frequency rule to Elevation & Depth**

After the first paragraph of the Elevation & Depth section (line 117), insert a new paragraph:

```markdown
<!-- old -->
The system uses **hairline-only depth**. No drop shadows, no elevation tiers. Cards float above the canvas via 1px hairlines and the slight white-on-cream contrast.

<!-- new -->
The system uses **hairline-only depth**. No drop shadows, no elevation tiers. Cards float above the canvas via 1px hairlines and the slight white-on-cream contrast.

Every discrete region (panel, card, section, empty state) carries a 1px `hairline` (`#e6e5e0`) outline. List rows and menu items use background/hover for separation — never borders.
```

- [ ] **Step 3: Add an App Density note to the Spacing System**

After the "Section padding: 80px." line (line 102), insert a new bullet:

```markdown
<!-- old -->
- **Section padding:** 80px.

<!-- new -->
- **Section padding:** 80px.
- **App Density (in-product surfaces):** Use the compact end of the scale — `xs`/`sm` for region padding, `xxs`/`xs` for gaps, `xs`-`sm` for control heights. The `section`/`xxl` tokens apply to marketing pages only.
```

- [ ] **Step 4: Update the card radius in the Border Radius Scale**

In the Rounded table, change the `{rounded.lg}` row (line 141):

```markdown
<!-- old -->
| `{rounded.lg}`   | 12px   | Cards, IDE panes            |
<!-- new -->
| `{rounded.lg}`   | 8px    | Cards, IDE panes, panels, modal |
```

- [ ] **Step 5: Add an "App Density Overrides" subsection to Components**

Insert a new subsection immediately after the `## Components` heading (line 146) and before `### Top Navigation` (line 148):

```markdown
<!-- old -->
## Components

### Top Navigation

<!-- new -->
## Components

### App Density Overrides

In-product surfaces override the marketing defaults with a compact developer density:

- **TopBar height:** 48px.
- **Control heights:** 28px (chrome controls), 24px (inline actions), 32px (modal buttons).
- **Region padding:** 12px × 8px (`px-3 py-2`); inner body areas go tighter.
- **Card/pane radius:** 8px (`rounded-lg`); chrome control radius: 6px (`rounded-md`).
- **Border rule:** Every region gets a 1px `hairline` (`#e6e5e0`) outline; list rows and menu items do not.

### Top Navigation
```

- [ ] **Step 6: Commit**

```bash
git add DESIGN.md
git commit -m "docs(design): update DESIGN.md with app density and border standards"
```

---

## Task 11: Final verification — full typecheck + build

**Files:**
- None (verification only)

- [ ] **Step 1: Run the full typecheck (node + web)**

Run: `pnpm typecheck`
Expected: PASS with no errors. This runs both `typecheck:node` and `typecheck:web`.

- [ ] **Step 2: Run the full build**

Run: `pnpm build`
Expected: Build succeeds, compiling all 3 targets (main, preload, renderer). No errors.

- [ ] **Step 3: Manual visual check**

Run `pnpm dev` and verify across all 7 surfaces:
1. **ProjectHome** — project list + empty state: tighter padding, h2 at `text-2xl`, cards with always-on borders.
2. **TopBar** — 48px height, compact back/toggle/settings/+Terminal buttons (28px).
3. **Sidebar** — tighter header, 24px hide button, bordered "No project open" empty state.
4. **TerminalPane** — compact header, 24px action buttons.
5. **FilePreviewPanel** — tighter header/pre/footer, 24px hide button, bordered "Select a file" empty state.
6. **SettingsPanel** — 480px modal, `p-4` padding, 32px buttons, tighter inputs/labels.
7. **WorkspacePanels** — `p-1.5` grid, tighter empty state, 28px + New Terminal button.

Confirm: no new drop shadows appear; `aw-border` (`#e6e5e0`) is the only region border color
(strong variant `#cfcdc4` only on hover/menu treatments).

- [ ] **Step 4: Final commit (only if any fixes were needed)**

If Steps 1-2 passed with no fixes, no commit is needed. If any fixes were applied, commit
them:

```bash
git add -A
git commit -m "polish(ui): final density polish fixes from verification"
```