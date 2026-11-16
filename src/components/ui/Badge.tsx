import type { ReactNode } from "react";

export type BadgeTone = "published" | "draft";

const tones: Record<BadgeTone, string> = {
  published: "bg-published-soft text-published",
  draft: "bg-draft-soft text-ink-2",
};

export function Badge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
