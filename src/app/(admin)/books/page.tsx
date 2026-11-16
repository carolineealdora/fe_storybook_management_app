import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { BookFilters } from "@/features/books/BookFilters";
import { BookListSkeleton } from "@/features/books/BookListSkeleton";
import { BookTable } from "@/features/books/BookTable";
import { PageHeader } from "@/features/shell/PageHeader";
import { serverGet } from "@/lib/server-api";
import type { AdminBook } from "@/lib/types";

export const metadata: Metadata = {
  title: "Master book · MainStory Book Management",
};

export default function BooksPage({ searchParams }: PageProps<"/books">) {
  return (
    <>
      <PageHeader
        title="Master book"
        description="Only Published books appear in StoryBook by MainStory."
        actions={
          <Link href="/books/new" className={buttonStyles()}>
            + Add book
          </Link>
        }
      />
      <Suspense fallback={<BookListSkeleton />}>
        <BookList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function BookList({
  searchParams,
}: Pick<PageProps<"/books">, "searchParams">) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const status =
    sp.status === "draft" || sp.status === "published" ? sp.status : "all";

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status !== "all") query.set("status", status);
  const books = await serverGet<AdminBook[]>(`/admin/books?${query}`);

  return (
    <>
      <BookFilters search={search} status={status} />
      <BookTable books={books} filtered={Boolean(search) || status !== "all"} />
    </>
  );
}
