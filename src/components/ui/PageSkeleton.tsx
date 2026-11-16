/** Loading placeholder for a whole page: a header bar and one content block. */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-5">
      <div className="h-12 w-60 animate-pulse rounded-md bg-line sm:w-80" />
      <div className="h-96 animate-pulse rounded-lg bg-line" />
    </div>
  );
}
