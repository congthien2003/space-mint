import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GridLayout, { type Layout } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { TerminalPane as TerminalPaneType } from "@shared/types";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { TerminalPane } from "./TerminalPane";
import { GRID_COLS, DEFAULT_PANE_H, GRID_MARGIN } from "./layout-utils";

const MIN_W = 2;
const MIN_H = 2;

export function WorkspaceGrid(): React.JSX.Element {
  const panes = useWorkspaceStore((s) => s.panes);
  const updatePaneGrid = useWorkspaceStore((s) => s.updatePaneGrid);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth);
      setHeight(el.clientHeight * 0.9);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Dynamic rowHeight: DEFAULT_PANE_H grid rows fill the viewport exactly.
  const rowHeight = useMemo(() => {
    if (height <= 100) return 30;
    const usable = height - 8; // margin cushion
    return Math.max(20, Math.floor(usable / DEFAULT_PANE_H));
  }, [height]);

  const layout: Layout = useMemo(
    () =>
      panes.map((p) => ({
        i: p.id,
        x: p.grid.x,
        y: p.grid.y,
        w: p.grid.w,
        h: p.grid.h,
        minW: MIN_W,
        minH: MIN_H
      })),
    [panes]
  );

  const onLayoutChange = useCallback(
    (next: Layout) => {
      for (const item of next) {
        const pane = panes.find((p) => p.id === item.i);
        if (!pane) continue;

        if (
          pane.grid.x !== item.x ||
          pane.grid.y !== item.y ||
          pane.grid.w !== item.w ||
          pane.grid.h !== item.h
        ) {
          updatePaneGrid(item.i, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          });
        }
      }
    },
    [panes, updatePaneGrid]
  );

  return (
    <div
      ref={wrapRef}
      className="mx-auto h-full w-full max-w-[1080px] overflow-hidden"
    >
      {width > 0 && (
        <GridLayout
          className="layout"
          layout={layout}
          cols={GRID_COLS}
          rowHeight={rowHeight}
          width={width}
          margin={GRID_MARGIN}
          compactType={null}
          maxRows={DEFAULT_PANE_H}
          onLayoutChange={onLayoutChange}
          draggableHandle=".terminal-drag-handle"
          isResizable={true}
        >
          {panes.map((pane: TerminalPaneType) => (
            <div key={pane.id} className="overflow-hidden">
              <TerminalPane pane={pane} />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
}
