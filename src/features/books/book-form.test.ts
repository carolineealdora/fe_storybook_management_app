import { describe, expect, it } from "vitest";
import {
  AGE_RANGE_ERROR,
  initialValues,
  toFormData,
  validateBook,
  type BookFormValues,
} from "./book-form";

const file = (name: string, size = 10) =>
  new File([new Uint8Array(size)], name);

const valid: BookFormValues = {
  title: "Ollie and the Big Rain",
  author: "Rizky Hidayat",
  description: "Ollie the frog has never seen a storm.",
  ageType: "range",
  ageMin: "3",
  ageMax: "5",
  price: "32000",
  status: "draft",
  cover: file("ollie-cover.png"),
  epub: file("ollie.epub"),
};

describe("validateBook", () => {
  it("accepts a complete book", () => {
    expect(validateBook(valid, false)).toEqual({});
  });

  it("requires text fields and both files on create", () => {
    const errors = validateBook(
      { ...initialValues(), price: "0", ageMin: "1", ageMax: "3" },
      false,
    );
    expect(Object.keys(errors).sort()).toEqual([
      "author",
      "cover",
      "description",
      "epub",
      "title",
    ]);
  });

  it("keeps stored files on edit when none are picked", () => {
    expect(validateBook({ ...valid, cover: null, epub: null }, true)).toEqual(
      {},
    );
  });

  it.each([
    ["5", "3"],
    ["3", "3"],
    ["1.5", "3"],
    ["", "3"],
    ["-1", "3"],
  ])("rejects age range %s–%s (E16)", (min, max) => {
    expect(
      validateBook({ ...valid, ageMin: min, ageMax: max }, false).age,
    ).toBe(AGE_RANGE_ERROR);
  });

  it("needs only a whole min age for a plus age (3+)", () => {
    expect(
      validateBook(
        { ...valid, ageType: "plus", ageMin: "3", ageMax: "" },
        false,
      ).age,
    ).toBeUndefined();
    expect(
      validateBook({ ...valid, ageType: "plus", ageMin: "3.5" }, false).age,
    ).toBeDefined();
  });

  it.each(["", "-1", "1.5", "abc"])("rejects price %j", (price) => {
    expect(validateBook({ ...valid, price }, false).price).toBeDefined();
  });

  it("allows a free book (price 0)", () => {
    expect(validateBook({ ...valid, price: "0" }, false).price).toBeUndefined();
  });

  it("rejects wrong file formats (E15) and oversized files", () => {
    expect(
      validateBook({ ...valid, epub: file("ollie-final.pdf") }, false).epub,
    ).toBe("Only .epub files are accepted.");
    expect(
      validateBook({ ...valid, cover: file("cover.gif") }, false).cover,
    ).toMatch(/\.jpg/);
    expect(
      validateBook({ ...valid, cover: file("COVER.JPEG") }, false).cover,
    ).toBeUndefined();
    expect(
      validateBook(
        { ...valid, cover: file("big.png", 5 * 1024 * 1024 + 1) },
        false,
      ).cover,
    ).toMatch(/5 MB/);
  });
});

describe("toFormData", () => {
  it("omits age_max for a plus age and files that were not picked", () => {
    const fd = toFormData({
      ...valid,
      ageType: "plus",
      ageMax: "9",
      cover: null,
      epub: null,
    });
    expect(fd.get("age_type")).toBe("plus");
    expect(fd.has("age_max")).toBe(false);
    expect(fd.has("cover")).toBe(false);
    expect(fd.has("epub")).toBe(false);
  });

  it("sends trimmed fields for a range age", () => {
    const fd = toFormData({ ...valid, title: "  Ollie  " });
    expect(fd.get("title")).toBe("Ollie");
    expect(fd.get("age_max")).toBe("5");
    expect(fd.get("epub")).toBeInstanceOf(File);
  });
});
