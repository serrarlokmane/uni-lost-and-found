import { describe, expect, it } from "vitest";
import { SESSION_COOKIE_OPTIONS } from "@/lib/cookies";
import { readFields } from "@/lib/form-state";
import { LIMITS } from "@/lib/schemas";
import { LIMITS_CLIENT } from "@/lib/limits";

describe("session cookie", () => {
  it("is HttpOnly and SameSite=Lax (JavaScript can't read the session)", () => {
    expect(SESSION_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(SESSION_COOKIE_OPTIONS.sameSite).toBe("lax");
  });
});

describe("readFields", () => {
  it("reads text fields and turns files or missing fields into ''", () => {
    const fd = new FormData();
    fd.set("email", "a@b.dz");
    fd.set("avatar", new Blob(["x"]));
    expect(readFields(fd, ["email", "avatar", "missing"])).toEqual({
      email: "a@b.dz",
      avatar: "",
      missing: "",
    });
  });
});

describe("limits", () => {
  it("the browser and the server use the same numbers", () => {
    expect(LIMITS).toBe(LIMITS_CLIENT);
  });
});
