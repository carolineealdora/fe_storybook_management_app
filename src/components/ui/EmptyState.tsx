import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  children: ReactNode;
  /** Optional call to action, e.g. a link back. */
  action?: ReactNode;
}

/** Page-level "nothing here" card: not found, not set up yet. Renders the page's h1. */
export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-ink-2">{children}</p>
      {action}
    </div>
  );
}
