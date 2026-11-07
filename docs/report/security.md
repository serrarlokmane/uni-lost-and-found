# Security — report section

**Owner:** Anfel

We are a cybersecurity team, so the site was built "secure by default": the database itself refuses what the user is not allowed to do, even if the website had a bug.

## 1. Roles

| Role | Can |
|---|---|
| Visitor | Read and search published posts |
| Pending / banned | Log in and see their status only |
| Student | Post, claim, see "My page", close their own post |
| Admin | Approve accounts, posts and claims; ban; read the log |

The role is stored only in `profiles.role`. The sign-up trigger always creates `student` + `pending`, whatever the user sends.

## 2. Row Level Security (RLS)

- RLS is on for all 4 tables: `profiles`, `posts`, `claims`, `admin_log`.
- There are only **SELECT** policies. `anon` and `authenticated` have **no** INSERT, UPDATE or DELETE grant.
- Visitors read posts through a **column grant** that leaves out `owner_id`, so "who wrote this post" never leaves the database.

## 3. Database functions

Every write goes through a `security definer` function with `set search_path = ''` that checks `auth.uid()` first: `create_post`, `close_post`, `create_claim`, `admin_review_user`, `admin_review_post`, `admin_decide_claim`. Search uses `search_posts` (`security invoker`, so RLS still applies). The functions raise short error codes (`not_approved`, `forbidden`, `rate_limited`…) that the site turns into friendly messages; database errors are never shown.

## 4. Validation, XSS and SQL injection

- Every form is checked on the server with **zod** (length, type, allowed values).
- React escapes all output; there is **no** `dangerouslySetInnerHTML`.
- A **Content Security Policy with a new nonce per request** blocks injected scripts.
- Queries only use parameters through RPC; search escapes `%`, `_` and `\`.

## 5. Sessions and headers

- The Supabase session is in an **HttpOnly, SameSite=Lax, Secure** cookie: JavaScript can't read it.
- Headers on every page: CSP, HSTS (2 years), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.

## 6. Admin checks, 3 times

1. The `/admin` page returns 404 to non-admins.
2. Every admin Server Action calls `requireAdmin()` before anything else.
3. Every admin SQL function calls `require_admin()`.

Hiding a button is not security; these 3 server checks are.

## 7. Secrets

- Only the **publishable** key is used, on the server only (no `NEXT_PUBLIC_` prefix).
- The secret and `service_role` keys are never used. The app **refuses to start** if one is configured.
- `.env` is never committed; the repo is public, so it contains no keys or personal emails.
- On Vercel the key is stored as a "sensitive" variable (it can't be read back).

## 8. CI security

| Check | What it catches |
|---|---|
| gitleaks | Secrets in any commit of the history |
| `npm audit --omit=dev --audit-level=high` | Known high-severity vulnerabilities in our packages |
| CodeQL (`security-extended`) | Injection and other security bugs in our code |
| Dependabot | Out-of-date packages, actions and the Docker base image |
| Pinned actions + `permissions: contents: read` | A changed or compromised GitHub Action |
| `protect-main` | No push to `main`, 1 approval, no bypass |

## 9. Accepted risks

See `docs/threat-model.md` → "Accepted risks": emails are not verified in v1, there are no automatic backups on the free plan, and login rate limiting uses Supabase's defaults.

## 10. Test results

_To fill from Aya's security report (`docs/tests/security-report.md`, Fri Nov 20): how many cases were tried, how many passed, and what was fixed._
