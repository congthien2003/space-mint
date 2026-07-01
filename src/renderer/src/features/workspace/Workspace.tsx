import { Sidebar } from "@renderer/shared/components/Sidebar";

export function Workspace(): React.JSX.Element {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 items-center justify-center bg-aw-bg">
        <p className="text-sm text-aw-text-soft">
          Terminal workspace will appear here (Phase 2)
        </p>
      </div>
    </div>
  );
}
