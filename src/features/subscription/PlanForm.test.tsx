import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AdminPlan } from "@/lib/types";
import { PlanForm } from "./PlanForm";

const onSaved = vi.fn();

const plan: AdminPlan = {
  id: "p1",
  code: "monthly",
  name: "Monthly Subscription",
  price: 49000,
  benefits: "Unlock every published book\nCancel anytime",
  duration: "1 month",
  updated_at: "2026-11-01T00:00:00Z",
  updated_by: null,
  price_history: [],
};

const ok = () =>
  vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ data: plan }), { status: 200 }),
    );

describe("PlanForm", () => {
  it("previews price and benefits live", async () => {
    const user = userEvent.setup();
    render(<PlanForm plan={plan} onSaved={onSaved} />);
    const preview = screen.getByRole("region", {
      name: "Preview in StoryBook",
    });
    expect(within(preview).getByText("Rp 49.000")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Monthly price (IDR) *"));
    await user.type(screen.getByLabelText("Monthly price (IDR) *"), "59000");
    await user.type(
      screen.getByLabelText("Benefits (one per line) *"),
      "\nNew stories every month",
    );
    expect(within(preview).getByText("Rp 59.000")).toBeInTheDocument();
    expect(
      within(preview).getByText("New stories every month"),
    ).toBeInTheDocument();
  });

  it("disables save until something changes", () => {
    render(<PlanForm plan={plan} onSaved={onSaved} />);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("asks to confirm a price change with the CR-001 wording, then saves", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PlanForm plan={plan} onSaved={onSaved} />);

    await user.clear(screen.getByLabelText("Monthly price (IDR) *"));
    await user.type(screen.getByLabelText("Monthly price (IDR) *"), "59000");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const dialog = screen.getByRole("dialog", {
      name: "Change the subscription price?",
    });
    expect(dialog).toHaveTextContent(
      "New subscribers will pay Rp 59.000 immediately. Existing subscribers will pay Rp 59.000 from their next renewal.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    await user.click(
      within(dialog).getByRole("button", { name: "Save new price" }),
    );

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/admin/subscription-plan");
    expect(JSON.parse(init.body as string)).toEqual({
      price: 59000,
      benefits: "Unlock every published book\nCancel anytime",
    });
    expect(await screen.findByText("Changes saved.")).toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledWith(plan);
  });

  it("saves a benefits-only change without the price dialog", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PlanForm plan={plan} onSaved={onSaved} />);
    await user.type(
      screen.getByLabelText("Benefits (one per line) *"),
      "\nNew stories every month",
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("blocks a price of 0 (E-CR2)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PlanForm plan={plan} onSaved={onSaved} />);
    await user.clear(screen.getByLabelText("Monthly price (IDR) *"));
    await user.type(screen.getByLabelText("Monthly price (IDR) *"), "0");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      screen.getByText("Enter a whole number above 0."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly price (IDR) *")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("names the active subscriber count when the API sends it (design E4)", () => {
    render(
      <PlanForm
        plan={{ ...plan, active_subscriber_count: 214 }}
        onSaved={onSaved}
      />,
    );
    expect(
      screen.getByText(/214 active subscribers keep the price they paid/),
    ).toBeInTheDocument();
  });
});
