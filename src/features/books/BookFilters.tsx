import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BookStatus } from "@/lib/types";

type StatusFilter = BookStatus | "all";

const SEARCH_DEBOUNCE_MS = 300;

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
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [text, setText] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);

  // The URL changed from outside (e.g. "Clear filters"): show its search text.
  // Skip when it's just our own trimmed copy of what's being typed.
  if (search !== syncedSearch) {
    setSyncedSearch(search);
    if (search !== text.trim()) setText(search);
  }

  const pending = useRef<string>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // The URL's search changed from outside while a typed search was waiting
  // (e.g. "Clear filters"): drop the stale search instead of re-applying it.
  useEffect(() => {
    if (pending.current !== undefined && search !== pending.current)
      clearTimeout(timer.current);
  }, [search]);

  function go(nextSearch: string, nextStatus: StatusFilter) {
    clearTimeout(timer.current); // a pending typed search is folded into this navigation
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextStatus !== "all") params.set("status", nextStatus);
    const qs = params.toString();
    navigate(qs ? `/books?${qs}` : "/books", { replace: true });
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    go(text, status);
  }

  function onType(value: string) {
    setText(value);
    pending.current = value.trim();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(value, status), SEARCH_DEBOUNCE_MS);
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
          id="book-search"
          name="search"
          type="search"
          value={text}
          onChange={(e) => onType(e.target.value)}
          placeholder="Search by title"
          className="h-9.5 w-full rounded-md border border-line-strong bg-surface px-3 text-sm placeholder:text-placeholder focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
        />
      </form>
      <SegmentedControl
        label="Filter by publish status"
        name="status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => go(text, v)}
      />
      {busy && (
        <span aria-hidden className="text-small text-muted">
          Loading…
        </span>
      )}
    </div>
  );
}
