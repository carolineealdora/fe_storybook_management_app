import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Fixed text inside the box, before the value (e.g. "Rp"). */
  adornment?: ReactNode;
}

function inputBoxStyles(invalid?: boolean, className = "") {
  return `flex h-9.5 items-center gap-2 rounded-md border bg-surface px-3 text-sm text-ink focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ink ${invalid ? "border-danger" : "border-line-strong"} ${className}`;
}

export function Input({
  invalid,
  adornment,
  className = "",
  id,
  ...rest
}: InputProps) {
  return (
    <div className={inputBoxStyles(invalid, className)}>
      {adornment && (
        <span className="text-placeholder" aria-hidden>
          {adornment}
        </span>
      )}
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={id ? `${id}-error ${id}-hint` : undefined}
        className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-placeholder"
        {...rest}
      />
    </div>
  );
}
