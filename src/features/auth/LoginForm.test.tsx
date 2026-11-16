import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const router = { replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function respond(status: number, body: unknown) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function signIn(email = "admin@mainstory.id", password = "secret") {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginForm", () => {
  it("posts credentials and goes to the book list", async () => {
    const fetchMock = respond(200, { data: { account_type: "admin" } });
    await signIn();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "admin@mainstory.id",
          password: "secret",
        }),
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/books");
  });

  it("shows a wrong-credentials error", async () => {
    respond(401, { error: { code: "INVALID_CREDENTIALS", message: "x" } });
    await signIn();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or password is incorrect.",
    );
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("refuses parent accounts (US-15)", async () => {
    respond(403, { error: { code: "FORBIDDEN", message: "x" } });
    await signIn("parent@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Admin accounts only.",
    );
  });
});
