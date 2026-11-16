import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AdminBook } from "@/lib/types";
import { renderRoute } from "@/test/render-route";
import { BookTable } from "./BookTable";

const onDeleted = vi.fn();

const book = (over: Partial<AdminBook>): AdminBook => ({
  id: "b1",
  title: "Kiko the Little Duck",
  author: "Dimas Arya",
  description: "…",
  age_type: "range",
  age_min: 1,
  age_max: 3,
  age_label: "1–3",
  price: 29000,
  status: "published",
  cover_url: "/api/v1/books/b1/cover",
  epub_file_name: "kiko.epub",
  epub_size_bytes: 1000,
  created_at: "2026-11-10T00:00:00Z",
  updated_at: "2026-11-10T00:00:00Z",
  ...over,
});

describe("BookTable", () => {
  it("lists books with price, free label and status", () => {
    renderRoute(
      <BookTable
        onDeleted={onDeleted}
        filtered={false}
        books={[
          book({}),
          book({
            id: "b2",
            title: "The Sleepy Moon",
            price: 0,
            status: "draft",
          }),
        ]}
      />,
    );
    const kiko = screen.getByRole("row", { name: /Kiko the Little Duck/ });
    expect(within(kiko).getByText("Rp 29.000")).toBeInTheDocument();
    expect(within(kiko).getByText("Published")).toBeInTheDocument();
    const moon = screen.getByRole("row", { name: /The Sleepy Moon/ });
    expect(within(moon).getByText("Free")).toBeInTheDocument();
    expect(within(moon).getByText("Draft")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Edit The Sleepy Moon" }),
    ).toHaveAttribute("href", "/books/b2/edit");
  });

  it("shows an empty state with an add action", () => {
    renderRoute(
      <BookTable onDeleted={onDeleted} books={[]} filtered={false} />,
    );
    expect(screen.getByText("No books yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Add book" })).toHaveAttribute(
      "href",
      "/books/new",
    );
  });

  it("shows a no-results state when filtered", () => {
    renderRoute(<BookTable onDeleted={onDeleted} books={[]} filtered />);
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/books",
    );
  });

  it("soft-deletes after confirmation and refreshes the list", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderRoute(
      <BookTable onDeleted={onDeleted} books={[book({})]} filtered={false} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Delete Kiko the Little Duck" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Delete “Kiko the Little Duck”?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Delete book" }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/books/b1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(onDeleted).toHaveBeenCalled();
  });

  it("keeps the dialog open with the error when delete fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "GENERAL_ERROR", message: "Server is busy." },
          }),
          { status: 500 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderRoute(
      <BookTable onDeleted={onDeleted} books={[book({})]} filtered={false} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Delete Kiko the Little Duck" }),
    );
    await user.click(screen.getByRole("button", { name: "Delete book" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Server is busy.",
    );
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
