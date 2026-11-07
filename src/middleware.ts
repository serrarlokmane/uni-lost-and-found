import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { readSupabaseEnv } from "@/lib/env";
import { buildCsp, createNonce } from "@/lib/csp";

/**
 * Runs before every page:
 * 1. Creates a fresh CSP nonce. Next.js reads it from the request's CSP header and puts it on
 *    its own <script> tags (this needs dynamic rendering: layout.tsx has force-dynamic).
 * 2. Refreshes the Supabase session cookie (HttpOnly) if it is about to expire.
 * It does NOT decide who may see a page: pages, actions and SQL functions check that themselves.
 */
export async function middleware(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  // Builds the response with the CURRENT request headers (they change when cookies are refreshed).
  const makeResponse = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", csp);
    return NextResponse.next({ request: { headers } });
  };

  let response = makeResponse();

  const env = readSupabaseEnv();
  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = makeResponse();
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    // Must be called right after createServerClient: it refreshes the session if needed.
    await supabase.auth.getUser();
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Every path except static files, images and the health check.
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
