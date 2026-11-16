import { Link } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/button-styles";
import { formatBookPrice, formatDate } from "@/lib/format";
import type { AdminBook } from "@/lib/types";
import { BookCover } from "./BookCover";
import { DeleteBookButton } from "./DeleteBookButton";

interface BookTableProps {
  books: AdminBook[];
  filtered: boolean;
  /** Called after a book is deleted, to reload the list. */
  onDeleted: (title: string) => void;
}

const th =
  "px-3 py-2.5 text-left font-mono text-xs font-semibold uppercase text-muted first:pl-4 last:pr-4";
const td = "px-3 py-2.5 first:pl-4 last:pr-4";

// Narrow screens keep Title, Status and Actions; the rest return as space allows.
const fromSm = "hidden sm:table-cell";
const fromLg = "hidden lg:table-cell";

export function BookTable({ books, filtered, onDeleted }: BookTableProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface px-6 py-14 text-center">
        <p className="font-medium">
          {filtered ? "No books match your filters." : "No books yet."}
        </p>
        <p className="text-small text-muted">
          {filtered
            ? "Try another title or status."
            : "Add your first book to start the StoryBook library."}
        </p>
        {filtered ? (
          <Link to="/books" className={buttonStyles("secondary")}>
            Clear filters
          </Link>
        ) : (
          <Link to="/books/new" className={buttonStyles()}>
            + Add book
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full text-sm lg:min-w-240">
        <caption className="sr-only">Books, {books.length} total</caption>
        <thead className="border-b border-line bg-canvas">
          <tr>
            <th scope="col" className={`${th} ${fromLg} w-18`}>
              Cover
            </th>
            <th scope="col" className={th}>
              Title
            </th>
            <th scope="col" className={`${th} ${fromLg}`}>
              Author
            </th>
            <th scope="col" className={`${th} ${fromSm} w-20`}>
              Age
            </th>
            <th scope="col" className={`${th} ${fromSm} w-30`}>
              Price
            </th>
            <th scope="col" className={`${th} w-30`}>
              Status
            </th>
            <th scope="col" className={`${th} ${fromLg} w-32`}>
              Updated
            </th>
            <th scope="col" className={`${th} w-30 text-right`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className="border-b border-line-soft last:border-0">
              <td className={`${td} ${fromLg}`}>
                <BookCover
                  src={b.cover_url}
                  width={36}
                  height={48}
                  className="h-12 w-9"
                />
              </td>
              <td className={`${td} font-medium`}>{b.title}</td>
              <td className={`${td} ${fromLg} text-ink-2`}>{b.author}</td>
              <td className={`${td} ${fromSm} font-mono`}>{b.age_label}</td>
              <td className={`${td} ${fromSm} font-mono`}>
                {formatBookPrice(b.price)}
              </td>
              <td className={td}>
                <Badge tone={b.status}>
                  {b.status === "published" ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className={`${td} ${fromLg} text-small text-muted`}>
                {formatDate(b.updated_at)}
              </td>
              <td className={td}>
                <div className="flex justify-end gap-3.5 text-small">
                  <Link
                    to={`/books/${encodeURIComponent(b.id)}/edit`}
                    aria-label={`Edit ${b.title}`}
                    className="rounded-sm font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    Edit
                  </Link>
                  <DeleteBookButton
                    id={b.id}
                    title={b.title}
                    purchaseCount={b.purchase_count}
                    onDeleted={onDeleted}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
