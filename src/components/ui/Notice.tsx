import type { ReactNode } from "react";

interface NoticeProps {
  children: ReactNode;
  onDismiss: () => void;
}

/** Success message after an action (saved, deleted). Announced politely to screen readers. */
export function Notice({ children, onDismiss }: NoticeProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-md border border-published/30 bg-published-soft px-3.5 py-2.5 text-small font-medium text-published"
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="rounded-sm px-1 text-base leading-none hover:opacity-70 focus-visible:outline-2 focus-visible:outline-published"
      >
        ×
      </button>
    </div>
  );
}
