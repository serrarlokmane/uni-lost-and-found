import { describe, expect, it } from "vitest";
import {
  claimSchema,
  fieldErrors,
  loginSchema,
  postSchema,
  searchParamsSchema,
  signUpSchema,
} from "@/lib/schemas";

const today = new Date().toISOString().slice(0, 10);

describe("signUpSchema", () => {
  const valid = {
    fullName: "  Sara B ",
    studentId: "2023-abc",
    email: " Sara@Uni.DZ ",
    password: "longenough",
  };

  it("cleans the input: trims, upper-cases the ID, lower-cases the email", () => {
    expect(signUpSchema.parse(valid)).toEqual({
      fullName: "Sara B",
      studentId: "2023-ABC",
      email: "sara@uni.dz",
      password: "longenough",
    });
  });
  it("refuses a student ID with other characters", () => {
    const r = signUpSchema.safeParse({ ...valid, studentId: "<script>" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).studentId).toMatch(/4 to 20/);
  });
  it("refuses a short password and a bad email", () => {
    const r = signUpSchema.safeParse({
      ...valid,
      password: "short",
      email: "nope",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errors = fieldErrors(r.error);
      expect(errors.password).toBeDefined();
      expect(errors.email).toBeDefined();
    }
  });
});

describe("loginSchema", () => {
  it("needs a password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.dz", password: "" }).success,
    ).toBe(false);
  });
});

describe("postSchema", () => {
  const valid = {
    type: "lost",
    category: "electronics",
    title: "White earbuds case",
    description: "White case with a small scratch",
    location: "Library, 2nd floor",
    happenedOn: today,
  };

  it("accepts a valid post", () => {
    expect(postSchema.safeParse(valid).success).toBe(true);
  });
  it("refuses an unknown type or category", () => {
    expect(postSchema.safeParse({ ...valid, type: "stolen" }).success).toBe(
      false,
    );
    expect(
      postSchema.safeParse({ ...valid, category: "weapons" }).success,
    ).toBe(false);
  });
  it("accepts the Student card category", () => {
    expect(
      postSchema.safeParse({ ...valid, category: "student_card" }).success,
    ).toBe(true);
  });
  it("refuses a title that is only spaces", () => {
    expect(postSchema.safeParse({ ...valid, title: "     " }).success).toBe(
      false,
    );
  });
  it("refuses a date in the future and a date more than a year ago", () => {
    expect(
      postSchema.safeParse({ ...valid, happenedOn: "2999-01-01" }).success,
    ).toBe(false);
    expect(
      postSchema.safeParse({ ...valid, happenedOn: "2020-01-01" }).success,
    ).toBe(false);
    expect(
      postSchema.safeParse({ ...valid, happenedOn: "not-a-date" }).success,
    ).toBe(false);
  });
});

describe("claimSchema", () => {
  it("needs a real post id and a 10+ character message", () => {
    expect(
      claimSchema.safeParse({ postId: "1", message: "a long enough message" })
        .success,
    ).toBe(false);
    expect(
      claimSchema.safeParse({
        postId: "b0000000-0000-4000-8000-000000000001",
        message: "short",
      }).success,
    ).toBe(false);
    expect(
      claimSchema.safeParse({
        postId: "b0000000-0000-4000-8000-000000000001",
        message: "3 keys and a red keychain",
      }).success,
    ).toBe(true);
  });
});

describe("searchParamsSchema", () => {
  it("keeps valid filters", () => {
    expect(
      searchParamsSchema.parse({
        q: " earbuds ",
        type: "lost",
        category: "keys",
      }),
    ).toEqual({ q: "earbuds", type: "lost", category: "keys" });
  });
  it("turns unknown values into 'no filter' instead of an error", () => {
    expect(
      searchParamsSchema.parse({ q: "", type: "stolen", category: ["a", "b"] }),
    ).toEqual({ q: undefined, type: undefined, category: undefined });
  });
});
