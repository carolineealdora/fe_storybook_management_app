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
      {notice && (
        <Notice onDismiss={() => setNotice(undefined)}>{notice}</Notice>
      )}
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
