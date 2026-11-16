"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { AgeType } from "@/lib/types";

interface AgeRangeFieldProps {
  ageType: AgeType;
  ageMin: string;
  ageMax: string;
  error?: string;
  onChange: (patch: {
    ageType?: AgeType;
    ageMin?: string;
    ageMax?: string;
  }) => void;
}

const numberBox = (invalid: boolean) =>
  `h-9.5 w-17.5 rounded-md border bg-surface text-center font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${invalid ? "border-danger" : "border-line-strong"}`;

export function AgeRangeField({
  ageType,
  ageMin,
  ageMax,
  error,
  onChange,
}: AgeRangeFieldProps) {
  const invalid = Boolean(error);
  const described = invalid ? "age-error" : undefined;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-small font-medium text-ink-2">
        Age range *
      </legend>
      <div className="flex flex-wrap items-center gap-3.5">
        <SegmentedControl
          label="Age range type"
          name="age_type"
          value={ageType}
          options={[
            { value: "range", label: "Range" },
            { value: "plus", label: "Number (3+)" },
          ]}
          onChange={(v) => onChange({ ageType: v })}
        />
        <div className="flex items-center gap-2">
          <input
            id="age"
            inputMode="numeric"
            aria-label={ageType === "range" ? "Minimum age" : "Age"}
            aria-invalid={invalid || undefined}
            aria-describedby={described}
            value={ageMin}
            onChange={(e) => onChange({ ageMin: e.target.value })}
            className={numberBox(invalid)}
          />
          {ageType === "range" ? (
            <>
              <span aria-hidden className="text-muted">
                –
              </span>
              <input
                inputMode="numeric"
                aria-label="Maximum age"
                aria-invalid={invalid || undefined}
                aria-describedby={described}
                value={ageMax}
                onChange={(e) => onChange({ ageMax: e.target.value })}
                className={numberBox(invalid)}
              />
            </>
          ) : (
            <span aria-hidden className="font-mono text-sm text-muted">
              +
            </span>
          )}
        </div>
      </div>
      {error && (
        <p id="age-error" role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
