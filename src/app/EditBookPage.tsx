import { Link, useParams } from "react-router";
import { buttonStyles } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadError } from "@/components/ui/LoadError";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
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
        <EmptyState
          title="Book not found"
          action={
            <Link to="/books" className={buttonStyles("secondary")}>
              Back to Master book
            </Link>
          }
        >
          This book doesn&apos;t exist or has been deleted.
        </EmptyState>
      ) : book.error ? (
        <LoadError error={book.error} onRetry={book.reload} />
      ) : !book.data || book.loading ? (
        <PageSkeleton label="Loading book" />
      ) : (
        <BookForm key={book.data.id} book={book.data} />
      )}
    </>
  );
}
