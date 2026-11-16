import { Link } from "react-router";
import { buttonStyles } from "@/components/ui/button-styles";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6">
      <title>Page not found · MainStory Book Management</title>
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="text-sm text-ink-2">
        There&apos;s nothing at this address.
      </p>
      <Link to="/books" className={buttonStyles("secondary")}>
        Back to Master book
      </Link>
    </div>
  );
}
