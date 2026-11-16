export function BrandMark({ className = "size-6.5" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-md bg-brand-mark ${className}`}
    />
  );
}
