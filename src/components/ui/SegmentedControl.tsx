"use client";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  name: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Radio group styled as joined buttons. Native radios give arrow-key navigation for free. */
export function SegmentedControl<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-fit overflow-hidden rounded-md border border-line-strong bg-surface text-small font-medium"
    >
      {options.map((o, i) => (
        <label
          key={o.value}
          className={`flex h-9.5 cursor-pointer items-center px-3.5 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-brand ${i > 0 ? "border-l border-line-strong" : ""} ${value === o.value ? "bg-ink text-white" : "text-ink hover:bg-canvas"}`}
        >
          <input
            type="radio"
            className="sr-only"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
