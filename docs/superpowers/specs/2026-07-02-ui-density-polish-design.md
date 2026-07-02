# UI Density Polish — Design Spec

**Date:** 2026-07-02
**Status:** Approved (pending spec review)
**Scope:** Visual density + border treatment across all in-product surfaces
**Affects:** `DESIGN.md`, all renderer components. No logic/state/IPC changes.

---

## 1. Overview

This spec defines a "modern dense" pass over the existing Cursor-inspired editorial
design language. The palette (warm cream canvas, ink text, single Crimson Pulse accent,
timeline pastels), typography hierarchy, and "no drop shadows" rule are all preserved.
What changes is **density** (tighter padding, compact controls) and **border frequency**
(every discrete region carries a 1px hairline outline).

The target feel is Linear / Raycast — structured, tightly packed, with clear visual
separation between regions defined by borders rather than whitespace.

### Goals

- Tighter padding across every surface (8–12px region padding, 6–8px gaps).
- Compact controls: 28px chrome / 24px inline / 32px modal.
- Every discrete region (panel, card, section, empty state) gets a 1px `aw-border`
  (`#e6e5e0`) outline.
- Radii tighten: cards/panes/modal → 8px (`rounded-lg`); chrome controls → 6px
  (`rounded-md`); pills stay 9999px.
- Update `DESIGN.md` so the design system doc and the implementation stay in sync.

### Non-Goals

- No palette, typography, or font-family changes.
- No drop shadows introduced.
- No logic, state store, IPC, or behavior changes.
- No marketing-page token changes (`section` 80px, `display-mega` 72px stay for future use).
- No animation/timing work.
- No form validation states beyond the existing focus state.

---

## 2. Density & Spacing Standards

All values map onto the existing Tailwind scale (no exotic sizes). Standardize on three
control heights and a single region-padding pattern.

### Control Heights

| Role | Height | Tailwind |
| --- | --- | --- |
| Chrome controls (TopBar back/toggle/settings, Sidebar/FilePreview hide buttons, primary CTA buttons in chrome) | 28px | `h-7` |
| Inline actions (TerminalPane action buttons) | 24px | `h-6` |
| Modal buttons (Settings Save/Cancel) | 32px | `h-8` |

### Region Padding

| Layer | Pattern | Tailwind |
| --- | --- | --- |
| Region / panel / card headers | 12px × 8px | `px-3 py-2` |
| Inner body areas | tighter | `px-1.5`–`px-3`, `py-1`–`py-2` |
| Section gaps | 8px | `gap-2` (or `gap-1.5` for tight lists) |

### Surface-by-Surface Density

| Surface | Element | Current | Proposed |
| --- | --- | --- | --- |
| **TopBar** | height | 64px (`h-16`) | 48px (`h-12`) |
| | container padding | `px-5` (20px) | `px-3` (12px) |
| | back/toggle/settings buttons | 40px (`h-10`) | 28px (`h-7`) |
| | + Terminal button | `h-10 px-4 text-sm` | `h-7 px-3 text-xs` |
| **Sidebar** | header padding | `px-4 py-3` | `px-3 py-2` |
| | hide button | 28px (`h-7 w-7`) | 24px (`h-6 w-6`) |
| | body padding | `px-2 py-2` | `px-1.5 py-1.5` |
| **TerminalPane** | header padding | `px-2 py-1.5` | `px-2.5 py-1` |
| | action buttons | 28px (`h-7 w-7`) | 24px (`h-6 w-6`) |
| **FilePreview** | header padding | `px-4 py-3` | `px-3 py-2` |
| | hide button | 28px (`h-7 w-7`) | 24px (`h-6 w-6`) |
| | `<pre>` content | `px-4 py-3` | `px-3 py-2` |
| | footer | `px-4 py-2` | `px-3 py-1.5` |
| **ProjectHome** | container | `px-8 py-10` | `px-6 py-6` |
| | header section | `pb-6`, `gap-6` | `pb-4`, `gap-4` |
| | empty state | `px-8 py-14` | `px-6 py-10` |
| **ProjectList** | card | `px-4 py-3` | `px-3 py-2` |
| | list gap | `gap-2` | `gap-1.5` |
| **SettingsPanel** | modal padding | `p-6` (24px) | `p-4` (16px) |
| | modal width | `max-w-[520px]` | `max-w-[480px]` |
| | header | `mb-6 pb-4` | `mb-4 pb-3` |
| | inputs | `px-3 py-2` | `px-2.5 py-1.5` |
| | labels | `mb-1.5` | `mb-1` |
| | buttons | `h-10` | `h-8` |
| **WorkspacePanels** | grid padding | `p-2` | `p-1.5` |
| | empty-state box | `px-10 py-9` | `px-6 py-8` |
| | + New Terminal button | `h-10 px-4 text-sm` | `h-7 px-3 text-xs` |

---

## 3. Border Standards

**Rule:** Border = region boundary. Every container / panel / card / section / empty state
carries a 1px `aw-border` (`#e6e5e0`) outline, using the existing token so borders stay
uniform and layered. No new border colors are introduced.

List rows, menu items, and inline controls do **not** get borders — they use background /
hover for separation. This keeps borders meaningful rather than noisy.

| Surface | Border treatment |
| --- | --- |
| **TopBar** | keep bottom `border-aw-border`; back/toggle/settings buttons keep `border-aw-border` / `border-aw-border-strong` |
| **Sidebar** | keep right `border-r-aw-border`; header keep `border-b-aw-border`; **add** boxed border to the "No project open" empty state |
| **TerminalPane** | keep card `border border-aw-border`; header keep `border-b`; exit overlay keep inner `rounded-md` (no extra border — it's a full overlay) |
| **FilePreview** | keep left `border-l-aw-border`; header keep `border-b`; footer keep `border-t`; **add** `border border-aw-border` to the "Select a file" empty state (error box already has border) |
| **WorkspacePanels** | grid `p-1.5` stays; "No terminals" empty state keep dashed `border-aw-border-strong` |
| **ProjectHome** | header keep `border-b`; empty state keep dashed `border-aw-border-strong` |
| **ProjectList** | **change** cards from hover-only border to **always-on** `border border-aw-border` + `hover:border-aw-border-strong` (every card reads as a defined region, not just on hover) |
| **SettingsPanel** | modal keep `border border-aw-border`; header keep `border-b`; inputs keep focus border |
| **FileTree node** | context menu keep `border-aw-border-strong` |
| **FileTreeNode rows** | no border on rows (list items, not regions) — keep hover `bg-aw-bg-mute` only |

---

## 4. Radius Standards

Tighten radii to match the dense/structured feel. Tailwind's `rounded-lg` is 8px and
`rounded-md` is 6px, so we standardize on those tokens rather than arbitrary values.

| Element | Current | Proposed |
| --- | --- | --- |
| Chrome controls (buttons, inputs, hide toggles) | 6px (`rounded-md`) | 6px (`rounded-md`) — keep |
| Cards / panes / terminal cards / modal / empty states | 12px (`rounded-lg`) | 8px (`rounded-lg`) |
| Timeline / badge pills | 9999px | 9999px — keep |

**Note:** Tailwind `rounded-lg` = 8px already, so most "card" elements keep their
`rounded-lg` class — the change is conceptual (8px is the standard) and only affects any
element that was targeting 12px explicitly.

---

## 5. Component-by-Component Spec

### TopBar (`src/renderer/src/shared/components/TopBar.tsx`)

- Container: `flex h-12 items-center gap-3 border-b border-aw-border bg-aw-bg px-3`
  (was `h-16 gap-4 px-5`)
- `toggleButtonClass`: `flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition`
  (was `h-10 w-10 text-sm`)
- Back button: `rounded-md border border-aw-border-strong bg-aw-bg-soft px-2.5 text-xs font-medium text-aw-text hover:bg-aw-bg-mute`
  (was `px-3 py-2 text-sm`)
- Project title: `text-sm font-semibold leading-5` keep; path `text-[10px]` keep
- + Terminal: `h-7 rounded-md px-3 text-xs font-medium bg-aw-accent text-white hover:bg-aw-accent-active`
  (was `h-10 px-4 text-sm`)
- Settings: `h-7 rounded-md border border-aw-border bg-aw-bg-soft px-2.5 text-xs font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text`
  (was `h-10 px-3 text-sm`)
- Left brand (no project): keep `h-3 w-3 rounded-sm bg-aw-accent` dot + `text-sm font-semibold`

### Sidebar (`src/renderer/src/shared/components/Sidebar.tsx`)

- Root: `flex h-full w-72 flex-col border-r border-aw-border bg-aw-bg-soft` — keep
- Header: `flex items-center justify-between border-b border-aw-border px-3 py-2`
  (was `px-4 py-3`); label `text-[11px]` keep
- Hide button: `h-6 w-6 rounded-md border border-aw-border bg-aw-bg text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text`
  (was `h-7 w-7`)
- Body: `flex-1 overflow-y-auto px-1.5 py-1.5 text-sm text-aw-text-soft`
  (was `px-2 py-2`)
- Empty state: wrap "No project open." in
  `rounded-lg border border-aw-border bg-aw-bg px-3 py-4 text-center text-xs text-aw-text-soft`

### TerminalPane (`src/renderer/src/features/workspace/TerminalPane.tsx`)

- Card: `flex h-full w-full flex-col overflow-hidden rounded-lg border border-aw-border bg-aw-bg-soft`
  — keep `rounded-lg border border-aw-border`
- Header: `flex items-center gap-2 border-b border-aw-border bg-aw-bg-soft px-2.5 py-1`
  (was `px-2 py-1.5`)
- `actionButtonClass`: `flex h-6 w-6 items-center justify-center rounded-md text-xs text-aw-text-soft hover:bg-aw-bg-mute hover:text-aw-text`
  (was `h-7 w-7`)
- Close button: `flex h-6 w-6 items-center justify-center rounded-md text-xs text-aw-error hover:bg-aw-error/10`
  (was `h-7 w-7`)
- Body: `relative flex-1 overflow-hidden p-1` — keep; xterm container `rounded-md` keep
- Exit overlay buttons: `rounded-md px-3 py-1.5 text-xs` keep

### FilePreviewPanel (`src/renderer/src/features/file-preview/FilePreviewPanel.tsx`)

- Aside: `flex h-full w-[360px] shrink-0 flex-col overflow-hidden border-l border-aw-border bg-aw-bg-soft`
  — keep
- Header: `border-b border-aw-border px-3 py-2` (was `px-4 py-3`); label `text-[11px]` keep
- Hide button: `h-6 w-6 rounded-md border border-aw-border bg-aw-bg text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text`
  (was `h-7 w-7`)
- Empty state ("Select a file"): keep the outer wrapper
  `flex h-full items-center justify-center px-6 text-center`, and change the inner `<p>`
  to a bordered box `rounded-lg border border-aw-border bg-aw-bg px-3 py-6 text-sm leading-6 text-aw-text-soft`
- `<pre>`: `h-full overflow-auto whitespace-pre-wrap break-words bg-aw-bg px-3 py-2 font-mono text-[12px] leading-5 text-aw-text`
  (was `px-4 py-3`)
- Footer: `border-t border-aw-border px-3 py-1.5 text-[10px] text-aw-text-muted`
  (was `px-4 py-2`)

### ProjectHome (`src/renderer/src/features/projects/ProjectHome.tsx`)

- Container: `mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-6`
  (was `gap-6 px-8 py-10`)
- Header row: `flex items-start justify-between gap-4 border-b border-aw-border pb-4`
  (was `gap-6 pb-6`)
- Section label `text-[11px]` keep; h2 `text-2xl font-normal leading-tight text-aw-text`
  (was `text-3xl`)
- Description: `mt-2 max-w-xl text-sm leading-6 text-aw-text-soft` keep
- Error: `rounded-md border border-aw-error/30 bg-aw-error/10 px-3 py-2 text-sm` keep
- Empty state: `rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-6 py-10 text-center`
  (was `px-8 py-14`)

### ProjectList (`src/renderer/src/features/projects/ProjectList.tsx`)

- Container: `flex flex-col gap-1.5` (was `gap-2`); label `text-[11px]` keep
- Cards: `group flex items-center gap-3 rounded-lg border border-aw-border bg-aw-bg-soft px-3 py-2 hover:border-aw-border-strong`
  (was `px-4 py-3` + hover-only border) — **always-on border**
- Project name `text-sm font-semibold` keep; path `text-[11px]` keep
- Remove button: `rounded-md px-2 py-1 text-xs font-medium text-aw-text-muted opacity-0 hover:bg-aw-bg-mute hover:text-aw-error group-hover:opacity-100`
  — keep

### SettingsPanel (`src/renderer/src/features/settings/SettingsPanel.tsx`)

- Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-aw-text/30 px-4` — keep
- Modal: `max-h-[82vh] w-full max-w-[480px] overflow-y-auto rounded-lg border border-aw-border bg-aw-bg-soft p-4`
  (was `max-w-[520px] p-6`)
- Header: `mb-4 border-b border-aw-border pb-3` (was `mb-6 pb-4`); label `text-[11px]` keep;
  h3 `text-2xl font-normal` keep
- `labelClass`: `mb-1 block text-[11px] font-semibold uppercase text-aw-text-soft`
  (was `mb-1.5`)
- `inputClass`: `w-full rounded-md border border-aw-border bg-aw-bg px-2.5 py-1.5 text-sm text-aw-text outline-none focus:border-aw-border-strong`
  (was `px-3 py-2`)
- Textarea: keep `font-mono text-xs leading-5`
- Buttons: `h-8 rounded-md` (was `h-10`); Cancel `border border-aw-border bg-aw-bg-soft px-4 text-sm font-medium text-aw-text-soft hover:border-aw-border-strong hover:text-aw-text`;
  Save `bg-aw-accent px-4 text-sm font-medium text-white hover:bg-aw-accent-active`

### WorkspacePanels (`src/renderer/src/features/workspace/WorkspacePanels.tsx`)

- Grid container: `h-full w-full min-h-0 min-w-0 overflow-hidden p-1.5` (was `p-2`)
- Empty-state box: `rounded-lg border border-dashed border-aw-border-strong bg-aw-bg-soft px-6 py-8 text-center`
  (was `px-10 py-9`); title `text-base font-medium` keep; description `mt-2 max-w-xs text-sm leading-6` keep
- + New Terminal button: `h-7 rounded-md bg-aw-accent px-3 text-xs font-medium text-white hover:bg-aw-accent-active`
  (was `h-10 px-4 text-sm`)

### FileTreeNode (`src/renderer/src/features/file-tree/FileTreeNode.tsx`)

- Row: `flex cursor-pointer items-center gap-1 rounded-md px-1 py-[3px] text-xs leading-4 hover:bg-aw-bg-mute`
  (was `py-[4px]`) — tighten row padding for denser tree
- Indent: `paddingLeft: depth * 12 + 4` — keep
- Context menu: `rounded-md border border-aw-border-strong bg-aw-bg-soft py-1 text-xs` — keep

---

## 6. DESIGN.md Changes

Update `DESIGN.md` so the design-system doc reflects the new density/border standards.
Palette, typography, fonts, and "no drop shadows" are preserved.

1. **Whitespace Philosophy** — replace "Generous editorial pacing… plenty of breathing
   room; cards within bands sit close (16-24px gap)" with:
   > "Compact developer density — tight 8-12px region padding, 6-8px gaps. Regions are
   > defined by 1px hairline borders rather than whitespace alone. Controls stay at 28px
   > (chrome) / 24px (inline) / 32px (modal) heights."

2. **Elevation & Depth** — keep "hairline-only depth, no drop shadows" and add a
   border-frequency rule:
   > "Every discrete region (panel, card, section, empty state) carries a 1px `hairline`
   > (`#e6e5e0`) outline. List rows and menu items use background/hover for separation —
   > never borders."

3. **Spacing System** — keep the token table (`xxs` 4px … `section` 80px) and add an
   "App Density" note:
   > "In-product surfaces use the compact end of the scale: `xs`/`sm` for region padding,
   > `xxs`/`xs` for gaps, `xs`-`sm` for control heights. The `section`/`xxl` tokens apply
   > to marketing pages only."

4. **Rounded** — update the card radius row: cards/panes/modal `rounded.lg` = 8px (was
   12px). Chrome controls stay `rounded.md` = 6px. Pills stay 9999px.

5. **Components** — add an "App Density Overrides" subsection:
   - TopBar height: 48px
   - Chrome control height: 28px; inline action: 24px; modal button: 32px
   - Region padding: 12px × 8px (`px-3 py-2`); inner body: tighter
   - Card/pane radius: 8px; chrome control radius: 6px
   - Border rule: every region gets 1px `hairline`; list rows/menu items do not

---

## 7. What Stays Untouched (Explicitly Preserved)

- Color palette — cream canvas, ink, Crimson Pulse, all timeline pastels, semantic colors
- Typography hierarchy — all type tokens, font families, weights, letter-spacing
- "No drop shadows" rule
- "Display weight stays at 400" rule
- "Crimson Pulse stays scarce" rule
- File tree row separation strategy (hover bg, no row borders)
- Context menu border treatment (`border-aw-border-strong`)
- Terminal split divider behavior (`.workspace-split` CSS in `globals.css`)
- All functional logic, state stores, IPC — zero behavior changes

---

## 8. Out of Scope

- Marketing-page-specific tokens (`section` 80px, `display-mega` 72px) — stay for future use
- Animation timings (timeline pill entrance, IDE pane reveal)
- Form validation states beyond focus

---

## 9. Testing / Validation

- `pnpm typecheck` passes (no logic changes, only className edits).
- `pnpm build` (electron-vite build) compiles for all 3 targets.
- Manual visual check across all 7 surfaces:
  1. ProjectHome — project list + empty state
  2. TopBar — project open + no-project states
  3. Sidebar — file tree + no-project empty state
  4. TerminalPane — single + split panes, exit overlay
  5. FilePreviewPanel — no file / loading / error / content / footer
  6. SettingsPanel — modal form + inputs + buttons
  7. WorkspacePanels — empty state + split grid + dividers
- Verify no new drop shadows appear and `aw-border` (`#e6e5e0`) is the only region border
  color used (strong variant `#cfcdc4` only on existing hover/menu treatments).

---

## 10. Files Touched

| File | Change |
| --- | --- |
| `DESIGN.md` | density/border/radius prose updates + App Density Overrides subsection |
| `src/renderer/src/shared/components/TopBar.tsx` | height, padding, control sizes |
| `src/renderer/src/shared/components/Sidebar.tsx` | padding, hide button, empty state border |
| `src/renderer/src/features/workspace/TerminalPane.tsx` | header padding, action button sizes |
| `src/renderer/src/features/workspace/WorkspacePanels.tsx` | grid padding, empty state, button |
| `src/renderer/src/features/file-preview/FilePreviewPanel.tsx` | padding, hide button, empty state border, pre/footer |
| `src/renderer/src/features/projects/ProjectHome.tsx` | container/header padding, h2 size, empty state |
| `src/renderer/src/features/projects/ProjectList.tsx` | card padding + always-on border, gap |
| `src/renderer/src/features/settings/SettingsPanel.tsx` | modal padding/width, header, inputs, labels, buttons |
| `src/renderer/src/features/file-tree/FileTreeNode.tsx` | row padding tighten |

No changes to: `tailwind.config.js` (no new tokens needed), `globals.css`, any store, any
IPC/service, any main process file.