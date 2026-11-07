// The SQL functions raise short codes (see supabase/migrations). We turn them into friendly text.
// Database error text is never shown to users (design system §6).

const MESSAGES: Record<string, string> = {
  not_authenticated: "Please log in first.",
  not_approved: "Your account is waiting for approval.",
  forbidden: "You can't do this.",
  not_found: "This item no longer exists or was already handled.",
  conflict: "This was already handled. Refresh the page.",
  rate_limited: "You can create 5 posts per day. Try again tomorrow.",
  already_claimed: "You already sent a claim for this post.",
  invalid_input: "Some fields are not valid. Check them and try again.",
};

export const GENERIC_ERROR = "Something went wrong. Try again in a minute.";

/** Maps a Supabase/PostgREST error to a safe message for the user. */
export function friendlyError(
  error: { message?: string } | null | undefined,
): string {
  const code = error?.message?.trim();
  return (code && MESSAGES[code]) || GENERIC_ERROR;
}
