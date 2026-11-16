import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AdminBook } from "@/lib/types";
import { renderRoute } from "@/test/render-route";
import { BookForm } from "./BookForm";

URL.createObjectURL = vi.fn(() => "blob:preview");
URL.revokeObjectURL = vi.fn();

const file = (name: string) => new File(["x"], name);

const storedBook: AdminBook = {
  id: "b1",
  title: "Counting Stars",
  author: "Bayu Pratama",
  description: "Count with me.",
  age_type: "plus",
  age_min: 2,
  age_max: null,
  age_label: "2+",
  price: 0,
  status: "published",
  cover_url: "/api/v1/books/b1/cover",
  epub_file_name: "stars.epub",
  epub_size_bytes: 100,
  created_at: "2026-11-02T00:00:00Z",
  updated_at: "2026-11-02T00:00:00Z",
};

async function fillValidBook(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Title *"), "Ollie and the Big Rain");
  await user.type(screen.getByLabelText("Author *"), "Rizky Hidayat");
  await user.type(
    screen.getByLabelText("Description *"),
    "Ollie the frog has never seen a storm.",
  );
  await user.type(screen.getByLabelText("Minimum age"), "3");
  await user.type(screen.getByLabelText("Maximum age"), "5");
  await user.type(screen.getByLabelText("Price (IDR) *"), "32000");
  await user.upload(
    screen.getByLabelText(/Choose image/),
    file("ollie-cover.png"),
  );
  await user.upload(
    screen.getByLabelText(/Choose an \.epub file/),
    file("ollie.epub"),
  );
}

describe("BookForm", () => {
  it("shows validation errors, focuses the first one, and does not submit", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderRoute(<BookForm />, "/books/new");

    await user.type(screen.getByLabelText("Minimum age"), "5");
    await user.type(screen.getByLabelText("Maximum age"), "3");
    await user.click(screen.getByRole("button", { name: "Save book" }));

    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Min age must be lower than max age. Use whole numbers.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Upload the book file (.epub)."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title *")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a non-epub file as soon as it is picked (E15)", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderRoute(<BookForm />, "/books/new");
    await user.upload(
      screen.getByLabelText(/Choose an \.epub file/),
      file("ollie-final.pdf"),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Only .epub files are accepted.",
    );
  });

  it("creates the book as multipart and returns to the list", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: {} }), { status: 201 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderRoute(<BookForm />, "/books/new");

    await fillValidBook(user);
    await user.click(screen.getByLabelText("Published"));
    await user.click(screen.getByRole("button", { name: "Save book" }));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/admin/books");
    expect(init.method).toBe("POST");
    const body = init.body as FormData;
    expect(body.get("status")).toBe("published");
    expect(body.get("age_max")).toBe("5");
    expect(await screen.findByText("Book list page")).toBeInTheDocument();
  });

  it("shows the server's age error next to the field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "INVALID_AGE_RANGE",
              message: "age_max must be greater.",
            },
          }),
          {
            status: 400,
          },
        ),
      ),
    );
    const user = userEvent.setup();
    renderRoute(<BookForm />, "/books/new");
    await fillValidBook(user);
    await user.click(screen.getByRole("button", { name: "Save book" }));
    expect(
      await screen.findByText("age_max must be greater."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Book list page")).not.toBeInTheDocument();
  });

  it("edits with PUT and keeps stored files when none are picked", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderRoute(<BookForm book={storedBook} />, "/books/b1/edit");

    expect(
      screen.getByRole("heading", { name: "Edit book" }),
    ).toBeInTheDocument();
    expect(screen.getByText("stars.epub")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save book" }));

    // The stored cover also loads via fetch, so pick out the save call.
    const calls = fetchMock.mock.calls as [string, RequestInit | undefined][];
    const [url, init] = calls.find(([, i]) => i?.method === "PUT")!;
    expect(url).toBe("/api/v1/admin/books/b1");
    if (!init) throw new Error("PUT call missing");
    const body = init.body as FormData;
    expect(body.get("age_type")).toBe("plus");
    expect(body.has("cover")).toBe(false);
    expect(body.has("epub")).toBe(false);
  });

  it("keeps the picked cover when the file dialog is cancelled (review #4)", async () => {
    const user = userEvent.setup();
    renderRoute(<BookForm />, "/books/new");
    await user.upload(
      screen.getByLabelText(/Choose image/),
      file("ollie-cover.png"),
    );
    fireEvent.change(screen.getByLabelText(/Replace/), {
      target: { files: [] },
    });
    expect(screen.getByText("ollie-cover.png")).toBeInTheDocument();
  });

  it("puts the server's file-format error on the file that was sent (review #3)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) =>
        Promise.resolve(
          init?.method === "PUT"
            ? new Response(
                JSON.stringify({
                  error: {
                    code: "INVALID_FILE_FORMAT",
                    message: "File content is not a valid image.",
                  },
                }),
                { status: 400 },
              )
            : new Response("", { status: 404 }),
        ),
      ),
    );
    const user = userEvent.setup();
    renderRoute(<BookForm book={storedBook} />, "/books/b1/edit");
    await user.upload(screen.getByLabelText(/Replace/), file("fake.png"));
    await user.click(screen.getByRole("button", { name: "Save book" }));

    const error = await screen.findByText("File content is not a valid image.");
    expect(error).toHaveAttribute("id", "cover-error");
  });
});
