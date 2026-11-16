import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadError } from "@/components/ui/LoadError";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
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
      <EmptyState title="No subscription plan yet">
        The monthly plan hasn&apos;t been set up on the server. Run the backend
        seed to create it, then reload.
      </EmptyState>
    );
  } else if (loaded.error) {
    body = <LoadError error={loaded.error} onRetry={loaded.reload} />;
  } else if (!plan) {
    body = <PageSkeleton label="Loading subscription plan" />;
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
