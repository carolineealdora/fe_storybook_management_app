import { Link } from "react-router";
import { buttonStyles } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotFoundPage() {
  return (
    <>
      <title>Page not found · MainStory Book Management</title>
      <EmptyState
        title="Page not found"
        action={
          <Link to="/books" className={buttonStyles("secondary")}>
            Back to Master book
          </Link>
        }
      >
        There&apos;s nothing at this address.
      </EmptyState>
    </>
  );
}
