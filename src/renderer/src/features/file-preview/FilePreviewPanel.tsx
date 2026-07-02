import { useFilePreviewStore } from "./file-preview.store";

function formatBytes(size: number | null): string {
  if (size === null) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / 1024 / 102.4) / 10} MB`;
}

interface FilePreviewPanelProps {
  onToggle: () => void;
}

export function FilePreviewPanel({
  onToggle
}: FilePreviewPanelProps): React.JSX.Element {
  const selectedFile = useFilePreviewStore((s) => s.selectedFile);
  const content = useFilePreviewStore((s) => s.content);
  const size = useFilePreviewStore((s) => s.size);
  const loading = useFilePreviewStore((s) => s.loading);
  const error = useFilePreviewStore((s) => s.error);

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col overflow-hidden border-l border-aw-border bg-aw-bg-soft">
      <div className="border-b border-aw-border px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase text-aw-text-soft">
            Preview
          </p>
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-aw-border bg-aw-bg text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text"
            title="Hide preview sidebar"
            aria-label="Hide preview sidebar"
            onClick={onToggle}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m6 4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {selectedFile ? (
          <>
            <h2 className="mt-1 truncate text-sm font-semibold text-aw-text">
              {selectedFile.name}
            </h2>
            <p
              className="mt-1 truncate font-mono text-[10px] leading-4 text-aw-text-muted"
              title={selectedFile.path}
            >
              {selectedFile.path}
            </p>
          </>
        ) : (
          <h2 className="mt-1 text-sm font-semibold text-aw-text">
            No file selected
          </h2>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {!selectedFile ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="rounded-lg border border-aw-border bg-aw-bg px-3 py-6 text-sm leading-6 text-aw-text-soft">
              Select a file to preview.
            </p>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <p className="text-sm text-aw-text-soft">Loading preview...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-5">
            <p className="rounded-md border border-aw-border bg-aw-bg px-3 py-2 text-xs leading-5 text-aw-error">
              {error}
            </p>
          </div>
        ) : (
          <pre className="h-full overflow-auto whitespace-pre-wrap break-words bg-aw-bg px-3 py-2 font-mono text-[12px] leading-5 text-aw-text">
            {content || " "}
          </pre>
        )}
      </div>

      {selectedFile && !loading && !error && (
        <div className="border-t border-aw-border px-3 py-1.5 text-[10px] text-aw-text-muted">
          {formatBytes(size)}
        </div>
      )}
    </aside>
  );
}
