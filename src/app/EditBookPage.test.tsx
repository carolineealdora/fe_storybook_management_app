import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderRoute } from "@/test/render-route";
import { EditBookPage } from "./EditBookPage";

const respond = (status: number, body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })),
  );

describe("EditBookPage", () => {
  it("shows a skeleton while the book loads", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => undefined)),
    );
    renderRoute(<EditBookPage />, "/books/b1/edit", "/books/:id/edit");
    expect(
      screen.getByRole("status", { name: "Loading book" }),
    ).toBeInTheDocument();
  });

  it("shows 'Book not found' for a deleted book (404)", async () => {
    respond(404, { error: { code: "BOOK_NOT_FOUND", message: "x" } });
    renderRoute(<EditBookPage />, "/books/b1/edit", "/books/:id/edit");
    expect(
      await screen.findByRole("heading", { name: "Book not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Master book" }),
    ).toHaveAttribute("href", "/books");
  });

  it("shows the retryable error for other failures", async () => {
    respond(500, {
      error: { code: "GENERAL_ERROR", message: "Server is busy." },
    });
    renderRoute(<EditBookPage />, "/books/b1/edit", "/books/:id/edit");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Server is busy.",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});
