import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

// Needs the Go backend running with the seeded admin account.
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Master book" }),
  ).toBeVisible();
}

test("redirects signed-out visitors to login", async ({ page }) => {
  await page.goto("/books");
  await expect(page).toHaveURL(/\/login$/);
});

test.describe("signed in", () => {
  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");

  test("admin adds, finds, edits and deletes a book", async ({ page }) => {
    const title = `E2E Book ${Date.now()}`;
    await signIn(page);

    await page.getByRole("link", { name: "+ Add book" }).click();
    await page.getByLabel("Title *").fill(title);
    await page.getByLabel("Author *").fill("Playwright");
    await page
      .getByLabel("Description *")
      .fill("A book created by the end-to-end test.");
    await page.getByLabel("Minimum age").fill("3");
    await page.getByLabel("Maximum age").fill("5");
    await page.getByLabel("Price (IDR) *").fill("15000");

    // Wrong format is rejected before upload (E15).
    await page.locator("#epub").setInputFiles(fixture("book.pdf"));
    await expect(
      page.getByText("Only .epub files are accepted."),
    ).toBeVisible();

    await page.locator("#cover").setInputFiles(fixture("cover.png"));
    await page.locator("#epub").setInputFiles(fixture("book.epub"));
    await page.getByRole("button", { name: "Save book" }).click();

    await expect(page).toHaveURL(/\/books$/);
    await page.getByRole("searchbox", { name: "Search by title" }).fill(title);
    await page
      .getByRole("searchbox", { name: "Search by title" })
      .press("Enter");
    const row = page.getByRole("row", { name: new RegExp(title) });
    await expect(row).toContainText("3–5");
    await expect(row).toContainText("Draft");

    await row.getByRole("link", { name: `Edit ${title}` }).click();
    await page.getByLabel("Published").check();
    await page.getByRole("button", { name: "Save book" }).click();
    await expect(
      page.getByRole("row", { name: new RegExp(title) }),
    ).toContainText("Published");

    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete book" })
      .click();
    await expect(
      page.getByRole("row", { name: new RegExp(title) }),
    ).toHaveCount(0);
  });

  test("admin updates subscription benefits and sees the preview", async ({
    page,
  }) => {
    await signIn(page);
    await page.getByRole("link", { name: "Subscription" }).click();
    const benefits = page.getByLabel("Benefits (one per line) *");
    const original = await benefits.inputValue();
    const extra = `E2E benefit ${Date.now()}`;

    await benefits.fill(`${original}\n${extra}`);
    await expect(
      page.getByRole("region", { name: "Preview in StoryBook" }),
    ).toContainText(extra);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible();

    // Put the plan back the way it was.
    await benefits.fill(original);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible();
  });
});
