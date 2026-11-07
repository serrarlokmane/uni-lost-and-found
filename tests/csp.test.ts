import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { buildCsp, createNonce } from "@/lib/csp";
import { friendlyError, GENERIC_ERROR } from "@/lib/errors";
import { middleware } from "@/middleware";

describe("CSP", () => {
  it("creates a different nonce every time", () => {
    expect(createNonce()).not.toBe(createNonce());
  });
  it("allows only nonced scripts in production, no unsafe-inline or unsafe-eval", () => {
    const csp = buildCsp("abc", false);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});

describe("middleware", () => {
  it("sets a CSP with a fresh nonce on every response (even without Supabase env)", async () => {
    delete process.env.SUPABASE_URL;
    const a = await middleware(new NextRequest("http://localhost/"));
    const b = await middleware(new NextRequest("http://localhost/"));
    const cspA = a.headers.get("content-security-policy") ?? "";
    const cspB = b.headers.get("content-security-policy") ?? "";
    expect(cspA).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(cspA).not.toBe(cspB);
  });
});

describe("friendlyError", () => {
  it("maps SQL codes to friendly text", () => {
    expect(friendlyError({ message: "rate_limited" })).toMatch(/5 posts/);
  });
  it("never shows raw database text", () => {
    expect(
      friendlyError({ message: 'relation "public.posts" does not exist' }),
    ).toBe(GENERIC_ERROR);
    expect(friendlyError(null)).toBe(GENERIC_ERROR);
  });
});
