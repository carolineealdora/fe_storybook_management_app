import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/button-styles";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/features/shell/PageHeader";
import { apiRequest } from "@/lib/api";
import { ApiError, type AdminBook, type BookStatus } from "@/lib/types";
import { AgeRangeField } from "./AgeRangeField";
import {
  FIELD_ORDER,
  fileFieldFor,
  coverError,
  epubError,
  initialValues,
  toFormData,
  validateBook,
  type BookFormErrors,
  type BookFormValues,
} from "./book-form";
import { CoverField } from "./CoverField";
import { EpubField } from "./EpubField";

interface BookFormProps {
  /** Present when editing. */
  book?: AdminBook;
}

export function BookForm({ book }: BookFormProps) {
  const navigate = useNavigate();
  const isEdit = Boolean(book);
  const [values, setValues] = useState<BookFormValues>(() =>
    initialValues(book),
  );
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<BookFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  // Before the first submit, only picked files are checked (instant format feedback).
  const errors: BookFormErrors = submitted
    ? { ...validateBook(values, isEdit), ...serverErrors }
    : {
        cover: coverError(values.cover, false),
        epub: epubError(values.epub, false),
        ...serverErrors,
      };

  function update(patch: Partial<BookFormValues>) {
    setValues((v) => ({ ...v, ...patch }));
    setServerErrors({});
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(undefined);
    const clientErrors = validateBook(values, isEdit);
    const first = FIELD_ORDER.find((f) => clientErrors[f]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setPending(true);
    try {
      await apiRequest(
        isEdit
          ? `/admin/books/${encodeURIComponent(book!.id)}`
          : "/admin/books",
        {
          method: isEdit ? "PUT" : "POST",
          body: toFormData(values),
        },
      );
      navigate("/books");
    } catch (err) {
      setPending(false);
      const fileField =
        err instanceof ApiError &&
        ["INVALID_FILE_FORMAT", "PAYLOAD_TOO_LARGE"].includes(err.code)
          ? fileFieldFor(err.message, values)
          : undefined;
      if (err instanceof ApiError && err.code === "INVALID_AGE_RANGE") {
        setServerErrors({ age: err.message });
      } else if (err instanceof ApiError && fileField) {
        setServerErrors({ [fileField]: err.message });
        document.getElementById(fileField)?.focus();
      } else {
        setFormError(
          err instanceof ApiError
            ? err.message
            : "We couldn't save the book. Please try again.",
        );
      }
    }
  }

  const label = isEdit ? "Edit book" : "Add book";
  return (
    <form
      id="book-form"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-1 flex-col gap-4.5"
    >
      <PageHeader
        breadcrumb={
          <>
            <Link to="/books" className="hover:underline">
              Master book
            </Link>{" "}
            / {label}
          </>
        }
        title={label}
        actions={
          <>
            <Link to="/books" className={buttonStyles("secondary")}>
              Cancel
            </Link>
            <Button type="submit" loading={pending}>
              {pending ? "Saving…" : "Save book"}
            </Button>
          </>
        }
      />
      {formError && <Alert>{formError}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 sm:p-5.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Title *" htmlFor="title" error={errors.title}>
              <Input
                id="title"
                value={values.title}
                invalid={Boolean(errors.title)}
                onChange={(e) => update({ title: e.target.value })}
              />
            </Field>
            <Field label="Author *" htmlFor="author" error={errors.author}>
              <Input
                id="author"
                value={values.author}
                invalid={Boolean(errors.author)}
                onChange={(e) => update({ author: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Description *"
            htmlFor="description"
            error={errors.description}
          >
            <Textarea
              id="description"
              rows={3}
              value={values.description}
              invalid={Boolean(errors.description)}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
          <AgeRangeField
            ageType={values.ageType}
            ageMin={values.ageMin}
            ageMax={values.ageMax}
            error={errors.age}
            onChange={update}
          />
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              label="Price (IDR) *"
              htmlFor="price"
              error={errors.price}
              hint={
                isEdit
                  ? "0 = Free book. A new price applies to new purchases only."
                  : "0 = Free book"
              }
            >
              <Input
                id="price"
                inputMode="numeric"
                adornment="Rp"
                className="font-mono"
                value={values.price}
                invalid={Boolean(errors.price)}
                onChange={(e) => update({ price: e.target.value })}
              />
            </Field>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-small font-medium text-ink-2">
                Publish status *
              </legend>
              <div className="flex h-9.5 items-center gap-4.5 text-sm">
                {(["draft", "published"] as BookStatus[]).map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={values.status === s}
                      onChange={() => update({ status: s })}
                      className="size-4 accent-brand"
                    />
                    {s === "draft" ? "Draft" : "Published"}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <CoverField
            file={values.cover}
            existingUrl={book?.cover_url}
            error={errors.cover}
            onChange={(cover) => update({ cover })}
          />
          <EpubField
            file={values.epub}
            existingName={book?.epub_file_name}
            error={errors.epub}
            onChange={(epub) => update({ epub })}
          />
        </div>
      </div>
    </form>
  );
}
