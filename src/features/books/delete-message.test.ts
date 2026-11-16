import { describe, expect, it } from "vitest";
import { deleteMessage } from "./delete-message";

describe("deleteMessage (design E5)", () => {
  it("names how many families keep the book when the API sends purchase_count", () => {
    expect(deleteMessage(38)).toBe(
      "The book will be hidden from the StoryBook showcase. 38 families who bought it keep access in My Book, and order history stays intact.",
    );
    expect(deleteMessage(1)).toContain("1 family who bought it keeps access");
    expect(deleteMessage(0)).toBe(
      "The book will be hidden from the StoryBook showcase. Nobody has bought it yet.",
    );
  });

  it("falls back to general copy when the count is unknown", () => {
    expect(deleteMessage(undefined)).toContain(
      "Families who bought it keep access in My Book",
    );
  });
});
