import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PriceChange } from "@/lib/types";
import { PriceHistory } from "./PriceHistory";

const change: PriceChange = {
  id: "c1",
  old_price: 49000,
  new_price: 59000,
  changed_by: "a1",
  changed_at: "2026-11-16T03:00:00Z",
};

describe("PriceHistory", () => {
  it("shows an empty state", () => {
    render(<PriceHistory changes={[]} />);
    expect(screen.getByText("No price changes yet.")).toBeInTheDocument();
  });

  it("lists changes without a 'Changed by' column when the API has no names", () => {
    render(<PriceHistory changes={[change]} />);
    expect(
      screen.getByRole("row", { name: /Rp 49.000.*Rp 59.000/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Changed by" }),
    ).not.toBeInTheDocument();
  });

  it("shows who changed the price when the API sends changed_by_name", () => {
    render(
      <PriceHistory
        changes={[
          { ...change, changed_by_name: "Demo Admin" },
          { ...change, id: "c2", changed_by_name: null },
        ]}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: "Changed by" }),
    ).toBeInTheDocument();
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Demo Admin")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Former admin")).toBeInTheDocument();
  });
});
