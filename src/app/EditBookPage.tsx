import { Link, useParams } from "react-router";
import { buttonStyles } from "@/components/ui/button-styles";
import { LoadError } from "@/components/ui/LoadError";
import { BookForm } from "@/features/books/BookForm";
import { ApiError, type AdminBook } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export function EditBookPage() {
  const { id = "" } = useParams();
  const book = useApi<AdminBook>(`/admin/books/${encodeURIComponent(id)}`);

  // 404: missing or deleted; 400: malformed id.
  const notFound =
    book.error instanceof ApiError && [400, 404].includes(book.error.status);
  return (
    <>
      <title>Edit book · MainStory Book Management</title>
      {notFound ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6">
          <h1 className="text-lg font-semibold">Book not found</h1>
          <p className="text-sm text-ink-2">
            This book doesn&apos;t exist or has been deleted.
          </p>
          <Link to="/books" className={buttonStyles("secondary")}>
            Back to Master book
          </Link>
        </div>
      ) : book.error ? (
        <LoadError error={book.error} onRetry={book.reload} />
      ) : !book.data || book.loading ? (
        <div
          role="status"
          aria-label="Loading book"
          className="flex flex-col gap-5"
        >
          <div className="h-12 w-60 animate-pulse rounded-md bg-line" />
          <div className="h-120 animate-pulse rounded-lg bg-line" />
        </div>
      ) : (
        <BookForm key={book.data.id} book={book.data} />
      )}
    </>
  );
}
