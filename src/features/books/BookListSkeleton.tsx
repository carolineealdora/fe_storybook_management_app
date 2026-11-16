export function BookListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading books"
      className="flex flex-col gap-5"
    >
      <div className="h-9.5 w-full animate-pulse rounded-md bg-line sm:w-120" />
      <div className="flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line-soft">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex h-17 items-center gap-4 bg-surface px-4">
            <div className="h-12 w-9 animate-pulse rounded-sm bg-line" />
            <div className="h-3.5 w-1/3 animate-pulse rounded-sm bg-line" />
            <div className="h-3.5 w-1/5 animate-pulse rounded-sm bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
