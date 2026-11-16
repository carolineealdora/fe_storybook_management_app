import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookForm } from "@/features/books/BookForm";
import { serverGet } from "@/lib/server-api";
import { ApiError, type AdminBook } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit book · MainStory Book Management",
};

export default function EditBookPage({
  params,
}: PageProps<"/books/[id]/edit">) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="Loading book"
          className="flex flex-col gap-5"
        >
          <div className="h-12 w-60 animate-pulse rounded-md bg-line" />
          <div className="h-120 animate-pulse rounded-lg bg-line" />
        </div>
      }
    >
      <EditBook params={params} />
    </Suspense>
  );
}

async function EditBook({
  params,
}: Pick<PageProps<"/books/[id]/edit">, "params">) {
  const { id } = await params;
  const book = await serverGet<AdminBook>(`/admin/books/${id}`).catch(
    (e: unknown) => {
      if (e instanceof ApiError && e.code === "VALIDATION_ERROR") notFound(); // malformed id
      throw e;
    },
  );
  return <BookForm key={book.id} book={book} />;
}
