import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BookStatus } from "@/lib/types";

type StatusFilter = BookStatus | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

interface BookFiltersProps {
  search: string;
  status: StatusFilter;
  /** True while the filtered list loads. */
  busy?: boolean;
}

/** Filters live in the URL, so the filtered list survives reloads and links are shareable. */
export function BookFilters({ search, status, busy }: BookFiltersProps) {
  const navigate = useNavigate();

  function go(nextSearch: string, nextStatus: StatusFilter) {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextStatus !== "all") params.set("status", nextStatus);
    const qs = params.toString();
    navigate(qs ? `/books?${qs}` : "/books", { replace: true });
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    go(String(new FormData(e.currentTarget).get("search") ?? ""), status);
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2.5"
      aria-busy={busy || undefined}
    >
      <form role="search" onSubmit={onSearch} className="w-full sm:w-80">
        <label htmlFor="book-search" className="sr-only">
          Search by title
        </label>
        <input
          key={search}
          id="book-search"
          name="search"
          type="search"
          defaultValue={search}
          placeholder="Search by title"
          className="h-9.5 w-full rounded-md border border-line-strong bg-surface px-3 text-sm placeholder:text-placeholder focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
        />
      </form>
      <SegmentedControl
        label="Filter by publish status"
        name="status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => go(search, v)}
      />
      {busy && (
        <span role="status" className="text-small text-muted">
          Loading…
        </span>
      )}
    </div>
  );
}
