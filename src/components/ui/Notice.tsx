import { useEffect, useRef } from "react";

interface NoticeProps {
  /** Success message after an action (saved, deleted); nothing shows while undefined. */
  message?: string;
  onDismiss: () => void;
}

/**
 * Keep this mounted: the live region must already be in the page when the message
 * arrives, or many screen readers won't announce it. A new message also takes focus,
 * so keyboard users aren't stranded when the element they used (a deleted row's
 * button) disappears.
 */
export function Notice({ message, onDismiss }: NoticeProps) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message) return;
    // After the closing dialog hands focus back to its trigger, so this one wins.
    const id = setTimeout(() => box.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <div role="status">
      {message && (
        <div
          ref={box}
          tabIndex={-1}
          className="flex items-center justify-between gap-3 rounded-md border border-published/30 bg-published-soft px-3.5 py-2 text-small font-medium text-published focus:outline-none"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-base leading-none hover:bg-published/10 focus-visible:outline-2 focus-visible:outline-published"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      )}
    </div>
  );
}
