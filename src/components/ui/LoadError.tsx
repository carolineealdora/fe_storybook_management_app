import { ApiError } from "@/lib/types";
import { Button } from "./Button";

interface LoadErrorProps {
  error: unknown;
  onRetry: () => void;
}

export function LoadError({ error, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6"
    >
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-ink-2">
        {error instanceof ApiError
          ? error.message
          : "We couldn't load this page. Please try again."}
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
