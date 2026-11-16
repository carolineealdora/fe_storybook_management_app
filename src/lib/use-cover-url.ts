import { useEffect, useState } from "react";
import { authedFetch } from "./api";

/**
 * Covers need the Authorization header, so they load via fetch → blob → object URL
 * (API-contracts.md, GET /books/:id/cover). `blob:` previews pass straight through.
 */
export function useCoverUrl(src: string): string | undefined {
  const [loaded, setLoaded] = useState<{ src: string; url: string }>();
  const isLocal = src.startsWith("blob:");

  useEffect(() => {
    if (isLocal) return;
    let cancelled = false;
    let objectUrl: string | undefined;
    // no-cache: the URL never changes when a cover is replaced, but the server sends max-age=3600.
    authedFetch(src.replace(/^\/api\/v1/, ""), { cache: "no-cache" })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setLoaded({ src, url: objectUrl });
      })
      .catch(() => undefined); // keep the placeholder
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, isLocal]);

  if (isLocal) return src;
  return loaded?.src === src ? loaded.url : undefined;
}
