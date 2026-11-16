import type { ReactNode } from "react";

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-small text-danger"
    >
      {children}
    </div>
  );
}
