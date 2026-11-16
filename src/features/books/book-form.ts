import type { AdminBook, AgeType, BookStatus } from "@/lib/types";

// Rules from API-contracts.md "POST /admin/books" and PRD US-16 / E15 / E16.
export const COVER_EXTENSIONS = [".jpg", ".jpeg", ".png"];
export const EPUB_EXTENSION = ".epub";
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const MAX_EPUB_BYTES = 50 * 1024 * 1024;

export interface BookFormValues {
  title: string;
  author: string;
  description: string;
  ageType: AgeType;
  ageMin: string;
  ageMax: string;
  price: string;
  status: BookStatus;
  cover: File | null;
  epub: File | null;
}

export type BookField =
  "title" | "author" | "description" | "age" | "price" | "cover" | "epub";
export type BookFormErrors = Partial<Record<BookField, string>>;

/** Form order, used to focus the first invalid field. */
export const FIELD_ORDER: BookField[] = [
  "title",
  "author",
  "description",
  "age",
  "price",
  "cover",
  "epub",
];

export const AGE_RANGE_ERROR =
  "Min age must be lower than max age. Use whole numbers.";

const isWhole = (s: string) => /^\d+$/.test(s.trim());
const hasExtension = (file: File, exts: string[]) =>
  exts.some((e) => file.name.toLowerCase().endsWith(e));

export function initialValues(book?: AdminBook): BookFormValues {
  return {
    title: book?.title ?? "",
    author: book?.author ?? "",
    description: book?.description ?? "",
    ageType: book?.age_type ?? "range",
    ageMin: book ? String(book.age_min) : "",
    ageMax: book?.age_max != null ? String(book.age_max) : "",
    price: book ? String(book.price) : "",
    status: book?.status ?? "draft",
    cover: null,
    epub: null,
  };
}

export function coverError(
  file: File | null,
  required: boolean,
): string | undefined {
  if (!file) return required ? "Upload a cover image." : undefined;
  if (!hasExtension(file, COVER_EXTENSIONS))
    return "Only .jpg, .jpeg and .png covers are accepted.";
  if (file.size > MAX_COVER_BYTES) return "Cover must be 5 MB or smaller.";
}

export function epubError(
  file: File | null,
  required: boolean,
): string | undefined {
  if (!file) return required ? "Upload the book file (.epub)." : undefined;
  if (!hasExtension(file, [EPUB_EXTENSION]))
    return "Only .epub files are accepted.";
  if (file.size > MAX_EPUB_BYTES) return "Book file must be 50 MB or smaller.";
}

/** On edit, files are optional: leaving them empty keeps the stored ones. */
export function validateBook(
  v: BookFormValues,
  isEdit: boolean,
): BookFormErrors {
  const errors: BookFormErrors = {};
  if (!v.title.trim()) errors.title = "Title is required.";
  if (!v.author.trim()) errors.author = "Author is required.";
  if (!v.description.trim()) errors.description = "Description is required.";

  if (v.ageType === "range") {
    if (
      !isWhole(v.ageMin) ||
      !isWhole(v.ageMax) ||
      Number(v.ageMin) >= Number(v.ageMax)
    ) {
      errors.age = AGE_RANGE_ERROR;
    }
  } else if (!isWhole(v.ageMin)) {
    errors.age = "Enter the age as a whole number.";
  }

  if (!isWhole(v.price))
    errors.price = "Price must be a whole number, 0 or more.";

  const cover = coverError(v.cover, !isEdit);
  if (cover) errors.cover = cover;
  const epub = epubError(v.epub, !isEdit);
  if (epub) errors.epub = epub;
  return errors;
}

/**
 * Which file field a server INVALID_FILE_FORMAT / PAYLOAD_TOO_LARGE error belongs to:
 * the only file sent, else whichever file the message names.
 */
// ponytail: message matching is a heuristic; a `field` in the API error body would make it exact.
export function fileFieldFor(
  message: string,
  v: BookFormValues,
): "cover" | "epub" | undefined {
  if (v.cover && !v.epub) return "cover";
  if (v.epub && !v.cover) return "epub";
  if (/cover|image/i.test(message)) return "cover";
  if (/epub|book file/i.test(message)) return "epub";
}

export function toFormData(v: BookFormValues): FormData {
  const fd = new FormData();
  fd.set("title", v.title.trim());
  fd.set("author", v.author.trim());
  fd.set("description", v.description.trim());
  fd.set("age_type", v.ageType);
  fd.set("age_min", v.ageMin.trim());
  if (v.ageType === "range") fd.set("age_max", v.ageMax.trim());
  fd.set("price", v.price.trim());
  fd.set("status", v.status);
  if (v.cover) fd.set("cover", v.cover);
  if (v.epub) fd.set("epub", v.epub);
  return fd;
}
