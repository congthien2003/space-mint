import { useState } from "react";
import clsx from "clsx";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  intent?: "default" | "danger";
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  intent = "default",
  onConfirm,
  onClose
}: ConfirmDialogProps): React.JSX.Element | null {
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleConfirm = async (): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-aw-text/30 px-4"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-[420px] rounded-lg border border-aw-border bg-aw-bg-soft p-4 shadow-lg shadow-aw-text/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-aw-border pb-3">
          <p className="text-[11px] font-semibold uppercase text-aw-text-soft">
            Confirm
          </p>
          <h3 className="mt-1 text-xl font-normal text-aw-text">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-aw-text-soft">
            {description}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="h-8 rounded-md border border-aw-border bg-aw-bg-soft px-4 text-sm font-medium text-aw-text-soft transition hover:border-aw-border-strong hover:text-aw-text disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={clsx(
              "h-8 rounded-md px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50",
              intent === "danger"
                ? "bg-aw-error hover:bg-aw-error/90"
                : "bg-aw-accent hover:bg-aw-accent-active"
            )}
            disabled={submitting}
            onClick={() => void handleConfirm()}
          >
            {submitting ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
