import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanForm } from "@/features/subscription/PlanForm";
import { PriceHistory } from "@/features/subscription/PriceHistory";
import { serverGet } from "@/lib/server-api";
import type { AdminPlan } from "@/lib/types";

export const metadata: Metadata = {
  title: "Subscription · MainStory Book Management",
};

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="Loading subscription plan"
          className="flex flex-col gap-5"
        >
          <div className="h-12 w-80 animate-pulse rounded-md bg-line" />
          <div className="h-80 animate-pulse rounded-lg bg-line" />
        </div>
      }
    >
      <Plan />
    </Suspense>
  );
}

async function Plan() {
  const plan = await serverGet<AdminPlan>("/admin/subscription-plan");
  return (
    <>
      <PlanForm plan={plan} />
      <PriceHistory changes={plan.price_history} />
    </>
  );
}
