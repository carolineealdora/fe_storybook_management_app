import { render, screen } from "@testing-library/react";
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
});
