import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { buttonStyles } from "@/components/ui/button-styles";
import { LoadError } from "@/components/ui/LoadError";
import { Notice } from "@/components/ui/Notice";
import { BookFilters } from "@/features/books/BookFilters";
import { BookListSkeleton } from "@/features/books/BookListSkeleton";
import { BookTable } from "@/features/books/BookTable";
import { PageHeader } from "@/features/shell/PageHeader";
import { readNavState } from "@/lib/navigation-state";
import type { AdminBook } from "@/lib/types";
import { useApi } from "@/lib/use-api";

/** Spoken result feedback for live search (the region stays mounted so changes are announced). */
function resultsAnnouncement(
  loading: boolean,
  count: number | undefined,
  filtered: boolean,
) {
  if (loading || count === undefined) return "Loading books…";
  if (count === 0)
    return filtered ? "No books match your filters." : "No books yet.";
  return count === 1 ? "1 book" : `${count} books`;
}

export function BooksPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(
    () => readNavState(location.state).notice,
  );

  // Drop the one-off message from history so a reload or Back does not show it again.
  useEffect(() => {
    if (readNavState(location.state).notice) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  const search = params.get("search") ?? "";
  const rawStatus = params.get("status");
  const status =
    rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status !== "all") query.set("status", status);
  const filtered = Boolean(search) || status !== "all";
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
      <Notice message={notice} onDismiss={() => setNotice(undefined)} />
      <p role="status" className="sr-only">
        {resultsAnnouncement(books.loading, books.data?.length, filtered)}
      </p>
      {books.error ? (
        <LoadError error={books.error} onRetry={books.reload} />
      ) : !books.data ? (
        <BookListSkeleton />
      ) : (
        <>
          <BookFilters search={search} status={status} busy={books.loading} />
          <BookTable
            books={books.data}
            filtered={filtered}
            onDeleted={(title) => {
              setNotice(`“${title}” was deleted.`);
              books.reload();
            }}
          />
        </>
      )}
    </>
  );
}
