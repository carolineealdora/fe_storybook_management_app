import type { Metadata } from "next";
import { BookForm } from "@/features/books/BookForm";

export const metadata: Metadata = {
  title: "Add book · MainStory Book Management",
};

export default function NewBookPage() {
  return <BookForm />;
}
