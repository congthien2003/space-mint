export function Sidebar(): React.JSX.Element {
  return (
    <div className="flex h-full w-64 flex-col border-r border-aw-border bg-aw-bg-soft">
      <div className="border-b border-aw-border px-3 py-2 text-xs font-semibold uppercase text-aw-text-soft">
        Files
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 text-sm text-aw-text-soft">
        <p className="px-2 py-4 text-center text-xs">
          File tree will appear here (Phase 2)
        </p>
      </div>
    </div>
  );
}
