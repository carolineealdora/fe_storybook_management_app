"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/format";

interface EpubFieldProps {
  file: File | null;
  /** Stored file name when editing. */
  existingName?: string;
  error?: string;
  onChange: (file: File | null) => void;
}

export function EpubField({
  file,
  existingName,
  error,
  onChange,
}: EpubFieldProps) {
  const [dragging, setDragging] = useState(false);
  const name = file?.name ?? existingName;
  const tone = error
    ? "border-danger bg-danger-soft"
    : dragging
      ? "border-ink bg-canvas"
      : "border-line-strong bg-surface hover:bg-canvas";

  return (
    <section className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4.5">
      <h2 className="text-small font-medium text-ink-2">
        Book file *{" "}
        <span className="font-mono text-placeholder">.epub only</span>
      </h2>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onChange(e.dataTransfer.files[0] ?? null);
        }}
        className={`flex min-h-23 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-dashed px-4 py-3 text-center text-small has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-ink ${tone}`}
      >
        {name ? (
          <span className="max-w-full truncate font-mono">{name}</span>
        ) : (
          <span className="font-medium">Choose an .epub file</span>
        )}
        {error ? (
          <span id="epub-error" role="alert" className="text-danger">
            {error}
          </span>
        ) : (
          file && <span className="text-muted">{formatBytes(file.size)}</span>
        )}
        <input
          id="epub"
          type="file"
          accept=".epub,application/epub+zip"
          className="sr-only"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? "epub-error" : undefined}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      <p className="text-xs text-muted">
        {existingName && !file
          ? "Drop a new .epub here or browse to replace it."
          : "Drop an .epub here or browse."}
      </p>
    </section>
  );
}
