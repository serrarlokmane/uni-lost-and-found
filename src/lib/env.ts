// Reads and checks the 2 environment variables. No NEXT_PUBLIC_ prefix: they never reach the browser.
// This file has no "server-only" import so middleware (edge) and tests can use it too;
// it never exposes anything, it only reads process.env.

export type SupabaseEnv = { url: string; key: string };

/**
 * True if the key is a SECRET key: the new `sb_secret_...` format or a legacy JWT with
 * role "service_role". Such a key bypasses RLS, so the app must never run with it.
 */
export function isSecretKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length === 3) {
    try {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64)) as { role?: unknown };
      return payload.role === "service_role";
    } catch {
      return false;
    }
  }
  return false;
}

/** Returns the env, or null if it is missing. Throws if a secret key is configured. */
export function readSupabaseEnv(
  env: Record<string, string | undefined> = process.env,
): SupabaseEnv | null {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  if (isSecretKey(key)) {
    // Never print the key itself.
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY is a SECRET key. Use the publishable key (sb_publishable_...).",
    );
  }
  if (!/^https?:\/\/[^\s]+$/.test(url)) {
    throw new Error("SUPABASE_URL must be an http(s) URL.");
  }
  return { url, key };
}

/** Like readSupabaseEnv, but throws a clear error when the variables are missing. */
export function getSupabaseEnv(): SupabaseEnv {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set (copy .env.example to .env).",
    );
  }
  return env;
}
