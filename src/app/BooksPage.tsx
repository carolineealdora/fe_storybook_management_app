import { Link, useSearchParams } from "react-router";
import { buttonStyles } from "@/components/ui/button-styles";
import { LoadError } from "@/components/ui/LoadError";
import { BookFilters } from "@/features/books/BookFilters";
import { BookListSkeleton } from "@/features/books/BookListSkeleton";
import { BookTable } from "@/features/books/BookTable";
import { PageHeader } from "@/features/shell/PageHeader";
import type { AdminBook } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export function BooksPage() {
  const [params] = useSearchParams();
  const search = params.get("search") ?? "";
  const rawStatus = params.get("status");
  const status =
    rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status !== "all") query.set("status", status);
  const books = useApi<AdminBook[]>(`/admin/books?${query}`);

  return (
    <>
      <title>Master book · MainStory Book Management</title>
      <PageHeader
        title="Master book"
        description="Only Published books appear in StoryBook by MainStory."
        actions={
          <Link to="/books/new" className={buttonStyles()}>
            + Add book
          </Link>
        }
      />
      {books.error ? (
        <LoadError error={books.error} onRetry={books.reload} />
      ) : !books.data ? (
        <BookListSkeleton />
      ) : (
        <>
          <BookFilters search={search} status={status} busy={books.loading} />
          <BookTable
            books={books.data}
            filtered={Boolean(search) || status !== "all"}
            onDeleted={books.reload}
          />
        </>
      )}
    </>
  );
}
