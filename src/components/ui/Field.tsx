import type { ReactNode } from "react";

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  /** Use "fieldset" when the field holds a group of controls (radios, two inputs). */
  as?: "div" | "fieldset";
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  as = "div",
  className = "",
  children,
}: FieldProps) {
  const id = htmlFor ?? undefined;
  const labelClass = "text-small font-medium text-ink-2";
  const Wrapper = as;
  return (
    <Wrapper className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      {as === "fieldset" ? (
        <legend className={`${labelClass} mb-1.5`}>{label}</legend>
      ) : (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="text-xs text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={id ? `${id}-hint` : undefined} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </Wrapper>
  );
}
