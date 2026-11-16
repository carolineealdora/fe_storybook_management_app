export type ButtonVariant = "primary" | "secondary" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white font-semibold hover:bg-brand-hover",
  secondary:
    "border border-line-strong bg-surface text-ink font-medium hover:bg-canvas",
  danger: "bg-danger text-white font-semibold hover:opacity-90",
};

/** Shared so links (`<Link className={buttonStyles()}>`) look like buttons. */
export function buttonStyles(
  variant: ButtonVariant = "primary",
  className = "",
) {
  return `inline-flex h-9.5 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;
}
