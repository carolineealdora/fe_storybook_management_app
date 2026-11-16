import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({
  invalid,
  className = "",
  id,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={id ? `${id}-error ${id}-hint` : undefined}
      className={`min-h-21 rounded-md border bg-surface px-3 py-2.5 text-sm leading-normal text-ink placeholder:text-placeholder focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${invalid ? "border-danger" : "border-line-strong"} ${className}`}
      {...rest}
    />
  );
}
