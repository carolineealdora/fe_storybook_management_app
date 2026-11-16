import { useState } from "react";
import { LoadError } from "@/components/ui/LoadError";
import { PlanForm } from "@/features/subscription/PlanForm";
import { PriceHistory } from "@/features/subscription/PriceHistory";
import { ApiError, type AdminPlan } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export function SubscriptionPage() {
  const loaded = useApi<AdminPlan>("/admin/subscription-plan");
  const [saved, setSaved] = useState<AdminPlan>();
  const plan = saved ?? loaded.data;

  let body;
  if (
    loaded.error instanceof ApiError &&
    loaded.error.code === "PLAN_NOT_FOUND"
  ) {
    body = (
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-6">
        <h1 className="text-lg font-semibold">No subscription plan yet</h1>
        <p className="text-sm text-ink-2">
          The monthly plan hasn&apos;t been set up on the server. Run the
          backend seed to create it, then reload.
        </p>
      </div>
    );
  } else if (loaded.error) {
    body = <LoadError error={loaded.error} onRetry={loaded.reload} />;
  } else if (!plan) {
    body = (
      <div
        role="status"
        aria-label="Loading subscription plan"
        className="flex flex-col gap-5"
      >
        <div className="h-12 w-80 animate-pulse rounded-md bg-line" />
        <div className="h-80 animate-pulse rounded-lg bg-line" />
      </div>
    );
  } else {
    body = (
      <>
        <PlanForm plan={plan} onSaved={setSaved} />
        <PriceHistory changes={plan.price_history} />
      </>
    );
  }

  return (
    <>
      <title>Subscription · MainStory Book Management</title>
      {body}
    </>
  );
}
