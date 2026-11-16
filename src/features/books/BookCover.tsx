import { useCoverUrl } from "@/lib/use-cover-url";

interface BookCoverProps {
  src: string;
  className?: string;
  width: number;
  height: number;
  alt?: string;
}

/** Shows a neutral block until the authenticated cover loads (or if it fails). */
export function BookCover({
  src,
  className = "",
  width,
  height,
  alt = "",
}: BookCoverProps) {
  const url = useCoverUrl(src);
  const box = `shrink-0 rounded-sm bg-sb-cream object-cover ${className}`;
  if (!url) return <span aria-hidden className={`block ${box}`} />;
  return (
    <img src={url} alt={alt} width={width} height={height} className={box} />
  );
}
