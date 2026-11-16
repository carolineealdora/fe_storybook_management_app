import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { BookFilters } from "./BookFilters";

function Location() {
  const { search } = useLocation();
  return <output aria-label="query">{search}</output>;
}

function renderFilters() {
  render(
    <MemoryRouter initialEntries={["/books"]}>
      <BookFilters search="" status="all" />
      <Location />
    </MemoryRouter>,
  );
}

describe("BookFilters", () => {
  it("searches by title on Enter", async () => {
    const user = userEvent.setup();
    renderFilters();
    await user.type(
      screen.getByRole("searchbox", { name: "Search by title" }),
      "bear{Enter}",
    );
    expect(screen.getByLabelText("query")).toHaveTextContent("?search=bear");
  });

  it("keeps the typed search when the status changes (review #5)", async () => {
    const user = userEvent.setup();
    renderFilters();
    await user.type(
      screen.getByRole("searchbox", { name: "Search by title" }),
      "bear",
    );
    await user.click(screen.getByRole("radio", { name: "Published" }));
    expect(screen.getByLabelText("query")).toHaveTextContent(
      "?search=bear&status=published",
    );
  });

  it("searches as you type, after a short pause (item 14)", async () => {
    const user = userEvent.setup();
    renderFilters();
    await user.type(
      screen.getByRole("searchbox", { name: "Search by title" }),
      "moon",
    );
    await waitFor(() =>
      expect(screen.getByLabelText("query")).toHaveTextContent("?search=moon"),
    );
    // Focus stays in the box while the URL updates.
    expect(
      screen.getByRole("searchbox", { name: "Search by title" }),
    ).toHaveFocus();
  });

  it("a pending search does not undo a status picked meanwhile", async () => {
    const user = userEvent.setup();
    renderFilters();
    await user.type(
      screen.getByRole("searchbox", { name: "Search by title" }),
      "moon",
    );
    await user.click(screen.getByRole("radio", { name: "Draft" }));
    await new Promise((r) => setTimeout(r, 400)); // past the debounce
    expect(screen.getByLabelText("query")).toHaveTextContent(
      "?search=moon&status=draft",
    );
  });

  it("empties the box when the URL's search is cleared elsewhere (Clear filters)", () => {
    const ui = (search: string) => (
      <MemoryRouter>
        <BookFilters search={search} status="all" />
      </MemoryRouter>
    );
    const { rerender } = render(ui("bear"));
    expect(
      screen.getByRole("searchbox", { name: "Search by title" }),
    ).toHaveValue("bear");
    rerender(ui(""));
    expect(
      screen.getByRole("searchbox", { name: "Search by title" }),
    ).toHaveValue("");
  });

  it("a pending search does not undo Clear filters (review #3)", async () => {
    const user = userEvent.setup();
    const ui = (search: string) => (
      <MemoryRouter initialEntries={["/books?search=bear"]}>
        <BookFilters search={search} status="all" />
        <Location />
      </MemoryRouter>
    );
    const { rerender } = render(ui("bear"));
    await user.type(
      screen.getByRole("searchbox", { name: "Search by title" }),
      "x",
    );
    rerender(ui("")); // "Clear filters" changed the URL while "bearx" was pending
    await new Promise((r) => setTimeout(r, 400));
    expect(screen.getByLabelText("query")).not.toHaveTextContent("bearx");
    expect(
      screen.getByRole("searchbox", { name: "Search by title" }),
    ).toHaveValue("");
  });
});
