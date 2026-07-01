import type { TerminalPane } from "@shared/types";

type Grid = TerminalPane["grid"];

export const GRID_COLS = 12;
export const DEFAULT_PANE_H = 8;
export const GRID_MARGIN: [number, number] = [6, 6];

/**
 * Split an existing pane either to the right or downwards.
 * The original pane keeps its top/left corner; the new pane takes the other half.
 */
export function computeSplit(
  pane: TerminalPane,
  direction: "right" | "down",
  _cols: number
): { original: Grid; next: Grid } {
  if (direction === "right") {
    const halfW = Math.floor(pane.grid.w / 2);
    const origW = Math.max(pane.grid.w - halfW, 1);
    const nextW = Math.max(halfW, 1);
    return {
      original: { ...pane.grid, w: origW },
      next: {
        x: pane.grid.x + origW,
        y: pane.grid.y,
        w: nextW,
        h: pane.grid.h
      }
    };
  }

  const halfH = Math.floor(pane.grid.h / 2);
  const origH = Math.max(pane.grid.h - halfH, 1);
  const nextH = Math.max(halfH, 1);
  return {
    original: { ...pane.grid, h: origH },
    next: {
      x: pane.grid.x,
      y: pane.grid.y + origH,
      w: pane.grid.w,
      h: nextH
    }
  };
}

/**
 * Position for a brand-new pane: full width, stacked below all existing panes.
 */
export function computeNewPanePosition(
  panes: TerminalPane[],
  cols: number,
  defaultH: number
): Grid {
  if (panes.length === 0) {
    return { x: 0, y: 0, w: cols, h: defaultH };
  }
  const maxY = Math.max(...panes.map((p) => p.grid.y + p.grid.h));
  return { x: 0, y: maxY, w: cols, h: defaultH };
}