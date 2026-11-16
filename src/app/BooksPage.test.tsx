import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { AdminBook } from "@/lib/types";
import { BooksPage } from "./BooksPage";

const kiko: AdminBook = {
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
};

function stubApi() {
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    if (init?.method === "DELETE")
      return Promise.resolve(new Response(null, { status: 204 }));
    if (url.startsWith("/api/v1/admin/books"))
      return Promise.resolve(
        new Response(JSON.stringify({ data: [kiko], meta: { total: 1 } }), {
          status: 200,
        }),
      );
    return Promise.resolve(new Response(null, { status: 404 })); // covers
  });
  vi.stubGlobal("fetch", fetchMock);
}

function renderAt(state?: unknown) {
  const router = createMemoryRouter(
    [{ path: "/books", element: <BooksPage /> }],
    {
      initialEntries: [{ pathname: "/books", state }],
    },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("BooksPage notices (item 16)", () => {
  it("shows the saved message passed from the form, once", async () => {
    stubApi();
    const router = renderAt({
      confirmedLeave: true,
      notice: "“Kiko the Little Duck” was saved.",
    });
    expect(
      await screen.findByText("“Kiko the Little Duck” was saved."),
    ).toBeInTheDocument();
    // Cleared from history so a reload doesn't show it again.
    expect(router.state.location.state).toBeNull();
  });

  it("can be dismissed", async () => {
    stubApi();
    const user = userEvent.setup();
    renderAt({ notice: "“Kiko the Little Duck” was saved." });
    await user.click(
      await screen.findByRole("button", { name: "Dismiss message" }),
    );
    expect(
      screen.queryByText("“Kiko the Little Duck” was saved."),
    ).not.toBeInTheDocument();
  });

  it("confirms a delete", async () => {
    stubApi();
    const user = userEvent.setup();
    renderAt();
    await user.click(
      await screen.findByRole("button", {
        name: "Delete Kiko the Little Duck",
      }),
    );
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete book",
      }),
    );
    const notice = await screen.findByText(
      "“Kiko the Little Duck” was deleted.",
    );
    // Focus moves to the message instead of being lost with the removed row (review #1).
    await waitFor(() => expect(notice.closest("[tabindex]")).toHaveFocus());
  });

  it("announces the number of results to screen readers (review #2)", async () => {
    stubApi();
    renderAt();
    expect(await screen.findByText("1 book")).toBeInTheDocument();
  });
});
