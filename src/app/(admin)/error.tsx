"use client";

import { Button } from "@/components/ui/Button";

export default function AdminError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6"
    >
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-ink-2">
        We couldn&apos;t load this page. The server may be unavailable.
      </p>
      <Button variant="secondary" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
