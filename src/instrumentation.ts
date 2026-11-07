// Runs once when the server starts. The app refuses to start with a secret key (PLAN.md §env).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { readSupabaseEnv } = await import("@/lib/env");
  readSupabaseEnv(); // throws on a secret key; missing vars are reported on first use
}
