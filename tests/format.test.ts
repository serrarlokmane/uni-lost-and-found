import { describe, expect, it } from "vitest";
import { formatDay } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

describe("formatDay", () => {
  it("formats a DB date as '6 Nov' (no time zone shift)", () => {
    expect(formatDay("2026-11-06")).toBe("6 Nov");
    expect(formatDay("2026-01-01")).toBe("1 Jan");
  });
  it("formats a timestamp", () => {
    expect(formatDay("2026-11-07T09:45:43.530Z")).toBe("7 Nov");
  });
  it("returns '' for a bad value instead of crashing", () => {
    expect(formatDay("nope")).toBe("");
  });
});

describe("categoryLabel", () => {
  it("shows a label, and 'Other' for an unknown value", () => {
    expect(categoryLabel("keys")).toBe("Keys");
    expect(categoryLabel("student_card")).toBe("Other");
  });
});
