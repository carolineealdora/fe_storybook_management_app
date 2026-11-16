import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiRequest } from "@/lib/api";
import { ApiError } from "@/lib/types";
import { deleteMessage } from "./delete-message";

interface DeleteBookButtonProps {
  id: string;
  title: string;
  purchaseCount?: number;
  /** Called with the book title once it is gone. */
  onDeleted: (title: string) => void;
}

export function DeleteBookButton({
  id,
  title,
  purchaseCount,
  onDeleted,
}: DeleteBookButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function onConfirm() {
    setPending(true);
    setError(undefined);
    try {
      await apiRequest(`/admin/books/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      // Already deleted elsewhere: the outcome the admin wanted, so just refresh.
      if (!(e instanceof ApiError && e.code === "BOOK_NOT_FOUND")) {
        setError(
          e instanceof ApiError
            ? e.message
            : "We couldn't delete the book. Please try again.",
        );
        setPending(false);
        return;
      }
    }
    setPending(false);
    setOpen(false);
    onDeleted(title);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${title}`}
        className="rounded-sm font-medium text-danger hover:underline focus-visible:outline-2 focus-visible:outline-danger"
      >
        Delete
      </button>
      <ConfirmDialog
        open={open}
        title={`Delete “${title}”?`}
        confirmLabel={pending ? "Deleting…" : "Delete book"}
        confirmVariant="danger"
        loading={pending}
        error={error}
        onConfirm={onConfirm}
        onCancel={() => {
          setOpen(false);
          setError(undefined);
        }}
      >
        {deleteMessage(purchaseCount)}
      </ConfirmDialog>
    </>
  );
}
