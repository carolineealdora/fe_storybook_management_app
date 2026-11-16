// Rules from API-contracts.md "PUT /admin/subscription-plan" and CR-001 (E-CR2).

export interface PlanFormValues {
  price: string;
  benefits: string;
}

export type PlanFormErrors = Partial<Record<keyof PlanFormValues, string>>;

export function validatePlan(v: PlanFormValues): PlanFormErrors {
  const errors: PlanFormErrors = {};
  if (!/^\d+$/.test(v.price.trim()) || Number(v.price) <= 0) {
    errors.price = "Enter a whole number above 0.";
  }
  if (benefitLines(v.benefits).length === 0)
    errors.benefits = "Add at least one benefit.";
  return errors;
}

/** Benefits are stored as one text, one benefit per line. */
export const benefitLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export const normalizeBenefits = (text: string) =>
  benefitLines(text).join("\n");
