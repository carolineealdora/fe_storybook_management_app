"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/features/shell/PageHeader";
import { apiRequest } from "@/lib/client-api";
import { formatRupiah } from "@/lib/format";
import { ApiError, type AdminPlan } from "@/lib/types";
import { PlanPreview } from "./PlanPreview";
import {
  normalizeBenefits,
  validatePlan,
  type PlanFormErrors,
} from "./plan-form";

export function PlanForm({ plan }: { plan: AdminPlan }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(plan.price));
  const [benefits, setBenefits] = useState(plan.benefits);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<PlanFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  const values = { price, benefits };
  const errors = submitted
    ? { ...validatePlan(values), ...serverErrors }
    : serverErrors;
  const newPrice = Number(price);
  const priceChanged = newPrice !== plan.price;
  const dirty =
    priceChanged ||
    normalizeBenefits(benefits) !== normalizeBenefits(plan.benefits);

  function edit(fn: () => void) {
    fn();
    setServerErrors({});
    setSaved(false);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(undefined);
    const errs = validatePlan(values);
    if (errs.price || errs.benefits) {
      document.getElementById(errs.price ? "price" : "benefits")?.focus();
      return;
    }
    // CR-001: confirm before a price change; a benefits-only edit saves directly.
    if (priceChanged) setConfirming(true);
    else void save();
  }

  async function save() {
    setPending(true);
    try {
      await apiRequest("/admin/subscription-plan", {
        method: "PUT",
        body: JSON.stringify({
          price: newPrice,
          benefits: normalizeBenefits(benefits),
        }),
      });
      setConfirming(false);
      setSaved(true);
      setBenefits(normalizeBenefits(benefits));
      router.refresh(); // reloads price history
    } catch (err) {
      setConfirming(false);
      if (err instanceof ApiError && err.code === "INVALID_PRICE")
        setServerErrors({ price: err.message });
      else
        setFormError(
          err instanceof ApiError
            ? err.message
            : "We couldn't save the plan. Please try again.",
        );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <PageHeader
        title="Subscription configuration"
        description="Monthly plan. New subscribers pay the new price right away; existing subscribers from their next renewal."
        actions={
          <Button type="submit" loading={pending} disabled={!dirty}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        }
      />
      {formError && <Alert>{formError}</Alert>}
      <p
        role="status"
        className={saved ? "text-small font-medium text-published" : "sr-only"}
      >
        {saved ? "Changes saved." : ""}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_--spacing(95)]">
        <section className="flex flex-col gap-4.5 rounded-lg border border-line bg-surface p-4 sm:p-5.5">
          <Field
            label="Monthly price (IDR) *"
            htmlFor="price"
            error={errors.price}
            hint="Whole number above 0"
            className="sm:w-70"
          >
            <Input
              id="price"
              inputMode="numeric"
              adornment="Rp"
              className="font-mono"
              value={price}
              invalid={Boolean(errors.price)}
              onChange={(e) => edit(() => setPrice(e.target.value))}
            />
          </Field>
          <Field
            label="Benefits (one per line) *"
            htmlFor="benefits"
            error={errors.benefits}
          >
            <Textarea
              id="benefits"
              rows={4}
              className="leading-relaxed"
              value={benefits}
              invalid={Boolean(errors.benefits)}
              onChange={(e) => edit(() => setBenefits(e.target.value))}
            />
          </Field>
          <p className="flex items-start gap-2.5 rounded-md border border-line bg-canvas px-3.5 py-3 text-small leading-normal text-ink-2">
            <span className="font-mono text-xs font-semibold text-ink">
              NOTE
            </span>
            Active subscribers keep the price they paid until their period ends.
            Their next renewal charges the current price.
          </p>
        </section>
        <PlanPreview
          price={newPrice > 0 && Number.isInteger(newPrice) ? newPrice : null}
          benefits={benefits}
        />
      </div>

      <ConfirmDialog
        open={confirming}
        title="Change the subscription price?"
        confirmLabel={pending ? "Saving…" : "Save new price"}
        loading={pending}
        onConfirm={() => void save()}
        onCancel={() => setConfirming(false)}
      >
        New subscribers will pay {formatRupiah(newPrice)} immediately. Existing
        subscribers will pay {formatRupiah(newPrice)} from their next renewal.
      </ConfirmDialog>
    </form>
  );
}
