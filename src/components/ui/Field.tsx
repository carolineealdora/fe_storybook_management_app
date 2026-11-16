import type { ReactNode } from "react";

interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + error/hint. The control's id must match `htmlFor`. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-small font-medium text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
