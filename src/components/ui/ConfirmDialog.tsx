import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";
import type { ButtonVariant } from "./button-styles";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native <dialog>: focus trap, Esc to close and backdrop come from the browser. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmVariant = "primary",
  loading,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-120 rounded-lg border border-line-strong bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-3.5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="text-sm leading-relaxed text-ink-2">{children}</div>
        {error && (
          <p
            role="alert"
            className="rounded-md bg-danger-soft px-3 py-2 text-small text-danger"
          >
            {error}
          </p>
        )}
        <div className="mt-1.5 flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
