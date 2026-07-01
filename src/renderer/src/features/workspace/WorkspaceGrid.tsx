import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import GridLayout, { type Layout } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { TerminalPane as TerminalPaneType } from "@shared/types";
import { useWorkspaceStore } from "@renderer/stores/workspace.store";
import { TerminalPane } from "./TerminalPane";

export function WorkspaceGrid(): React.JSX.Element {
  const panes = useWorkspaceStore((s) => s.panes);
  const updatePaneGrid = useWorkspaceStore((s) => s.updatePaneGrid);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const layout: Layout = useMemo(
    () =>
      panes.map((p) => ({
        i: p.id,
        x: p.grid.x,
        y: p.grid.y,
        w: p.grid.w,
        h: p.grid.h,
        minW: 2,
        minH: 3
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
    <div ref={wrapRef} className="h-full w-full overflow-auto p-1">
      {width > 0 && (
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={width}
          margin={[6, 6] as [number, number]}
          compactType={null}
          onLayoutChange={onLayoutChange}
          draggableHandle=".terminal-drag-handle"
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
