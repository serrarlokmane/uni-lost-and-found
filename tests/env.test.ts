import { describe, expect, it } from "vitest";
import { isSecretKey, readSupabaseEnv } from "@/lib/env";

// A fake legacy JWT: header.payload.signature, payload = {"role":"service_role"}.
const fakeJwt = (role: string) =>
  ["eyJhbGciOiJIUzI1NiJ9", btoa(JSON.stringify({ role })), "sig"].join(".");

describe("isSecretKey", () => {
  it("flags the new secret key format", () => {
    expect(isSecretKey("sb_secret_abc123")).toBe(true);
  });
  it("flags a legacy service_role JWT", () => {
    expect(isSecretKey(fakeJwt("service_role"))).toBe(true);
  });
  it("accepts the publishable key and the legacy anon JWT", () => {
    expect(isSecretKey("sb_publishable_abc123")).toBe(false);
    expect(isSecretKey(fakeJwt("anon"))).toBe(false);
  });
});

describe("readSupabaseEnv", () => {
  const url = "https://example.supabase.co";

  it("returns null when a variable is missing", () => {
    expect(readSupabaseEnv({ SUPABASE_URL: url })).toBeNull();
  });
  it("refuses to start with a secret key, without printing it", () => {
    const key = "sb_secret_DO_NOT_PRINT";
    expect(() =>
      readSupabaseEnv({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key }),
    ).toThrow(/SECRET key/);
    try {
      readSupabaseEnv({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key });
    } catch (e) {
      expect(String(e)).not.toContain("DO_NOT_PRINT");
    }
  });
  it("refuses a URL that is not http(s)", () => {
    expect(() =>
      readSupabaseEnv({
        SUPABASE_URL: "javascript:alert(1)",
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      }),
    ).toThrow();
  });
  it("returns url and key when both are fine", () => {
    expect(
      readSupabaseEnv({
        SUPABASE_URL: url,
        SUPABASE_PUBLISHABLE_KEY: " sb_publishable_x ",
      }),
    ).toEqual({ url, key: "sb_publishable_x" });
  });
});
