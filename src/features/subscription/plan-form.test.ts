import { describe, expect, it } from "vitest";
import { benefitLines, normalizeBenefits, validatePlan } from "./plan-form";

describe("validatePlan", () => {
  it("accepts a whole price above 0 with benefits", () => {
    expect(
      validatePlan({ price: "49000", benefits: "Unlock every published book" }),
    ).toEqual({});
  });

  it.each(["0", "-1", "", "49.5", "abc"])(
    "rejects price %j (E-CR2)",
    (price) => {
      expect(validatePlan({ price, benefits: "x" }).price).toBe(
        "Enter a whole number above 0.",
      );
    },
  );

  it("requires at least one non-blank benefit", () => {
    expect(
      validatePlan({ price: "1", benefits: " \n \n" }).benefits,
    ).toBeDefined();
  });
});

describe("benefit lines", () => {
  it("splits, trims and drops blank lines", () => {
    expect(benefitLines(" Unlock every book \n\nCancel anytime\n")).toEqual([
      "Unlock every book",
      "Cancel anytime",
    ]);
    expect(normalizeBenefits("a\n\n b ")).toBe("a\nb");
  });
});
