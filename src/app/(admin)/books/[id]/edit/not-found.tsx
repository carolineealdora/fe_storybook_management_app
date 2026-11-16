import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";

export default function BookNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6">
      <h1 className="text-lg font-semibold">Book not found</h1>
      <p className="text-sm text-ink-2">
        This book doesn&apos;t exist or has been deleted.
      </p>
      <Link href="/books" className={buttonStyles("secondary")}>
        Back to Master book
      </Link>
    </div>
  );
}
