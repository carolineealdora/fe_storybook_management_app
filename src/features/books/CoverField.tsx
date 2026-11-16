import { useEffect, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";
import { BookCover } from "./BookCover";

interface CoverFieldProps {
  file: File | null;
  /** Stored cover when editing. */
  existingUrl?: string;
  error?: string;
  onChange: (file: File | null) => void;
}

export function CoverField({
  file,
  existingUrl,
  error,
  onChange,
}: CoverFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const urlRef = useRef<string>(undefined);
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  function pick(next: File | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next ? URL.createObjectURL(next) : undefined;
    setPreviewUrl(urlRef.current);
    onChange(next);
  }

  const src = previewUrl ?? existingUrl;
  const hasCover = Boolean(file || existingUrl);
  return (
    <section className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4.5">
      <h2 className="text-small font-medium text-ink-2">
        Cover image *{" "}
        <span className="font-mono text-placeholder">.jpg .jpeg .png</span>
      </h2>
      <div className="flex items-center gap-3.5">
        {src ? (
          <BookCover
            src={src}
            width={90}
            height={120}
            alt="Cover preview"
            className="h-30 w-22.5 rounded-md"
          />
        ) : (
          <div
            aria-hidden
            className="h-30 w-22.5 shrink-0 rounded-md bg-sb-cream"
          />
        )}
        <div className="flex min-w-0 flex-col gap-1 text-small">
          {file && (
            <>
              <span className="truncate font-mono">{file.name}</span>
              <span className="text-muted">{formatBytes(file.size)}</span>
            </>
          )}
          {!file && existingUrl && (
            <span className="text-muted">Current cover</span>
          )}
          <label className="w-fit cursor-pointer rounded-sm text-ink underline has-focus-visible:outline-2 has-focus-visible:outline-ink">
            {hasCover ? "Replace" : "Choose image"}
            <input
              id="cover"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="sr-only"
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? "cover-error" : undefined}
              onChange={(e) => {
                const next = e.target.files?.[0];
                if (next) pick(next); // cancelled dialog: keep the current file
              }}
            />
          </label>
        </div>
      </div>
      {error && (
        <p id="cover-error" role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
