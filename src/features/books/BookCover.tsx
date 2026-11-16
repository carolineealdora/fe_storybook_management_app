import Image from "next/image";

interface BookCoverProps {
  src: string;
  className?: string;
  width: number;
  height: number;
  alt?: string;
}

// unoptimized: the cover is served through our cookie-authenticated proxy, which the image optimizer can't call.
export function BookCover({
  src,
  className = "",
  width,
  height,
  alt = "",
}: BookCoverProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={`shrink-0 rounded-sm bg-sb-cream object-cover ${className}`}
    />
  );
}
