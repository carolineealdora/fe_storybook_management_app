import { formatRupiah } from "@/lib/format";
import { benefitLines } from "./plan-form";

interface PlanPreviewProps {
  price: number | null;
  benefits: string;
}

/** Mirrors the StoryBook (family app) subscription offer, so it uses that app's fonts and colours. */
export function PlanPreview({ price, benefits }: PlanPreviewProps) {
  const lines = benefitLines(benefits);
  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-2.5">
      <h2
        id="preview-title"
        className="font-mono text-xs font-semibold text-muted uppercase"
      >
        Preview in StoryBook
      </h2>
      <div className="overflow-hidden rounded-3xl border border-line bg-surface font-kid text-sb-ink">
        <div className="flex flex-col gap-2 bg-sb-yellow px-5 py-5.5">
          <p className="font-kid-display text-2xl leading-none font-extrabold">
            Read every book in the library
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="font-kid-display text-2xl font-extrabold">
              {price ? formatRupiah(price) : "Rp –"}
            </span>
            <span className="text-small font-bold">/ month</span>
          </p>
        </div>
        <ul className="flex flex-col gap-2.5 px-5 py-4">
          {lines.length === 0 && (
            <li className="text-sm text-muted">Benefits will appear here.</li>
          )}
          {lines.map((line, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm font-bold">
              <span
                aria-hidden
                className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-sb-teal-soft text-xs font-extrabold text-sb-teal"
              >
                ✓
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
