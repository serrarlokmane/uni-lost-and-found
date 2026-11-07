// Options for the Supabase session cookies (PROJECT.md §11 "Stolen session").
// @supabase/ssr defaults to httpOnly: false because its BROWSER client reads the cookie.
// This app only uses the SERVER client, so we lock the cookie: JavaScript in the page
// (for example an XSS bug) can't read the session.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // HTTPS only in production (Render). Browsers also accept Secure cookies on http://localhost.
  secure: process.env.NODE_ENV === "production",
};
