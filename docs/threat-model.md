# Threat model (v1)

**Owner:** Anfel · Method: STRIDE · Start: `PROJECT.md` §11. Version 1, written from the merged code (PR #41). Version 2 (Fri Nov 20) adds Aya's security test results.

## Assets (what we protect)

| Asset | Why it matters |
|---|---|
| Students' personal data: full name, student ID, email | Personal data; visible only to the owner and admins |
| Admin role | An attacker with it can approve fake accounts and give items to the wrong person |
| Claims and the hand-over | A false claim means a real item goes to the wrong student |
| Session cookies | Whoever has them is logged in as that student |
| Supabase keys | The secret key bypasses all security; the publishable key is limited by RLS |
| Public repo and pipeline | A leaked secret or a bad workflow change reaches everyone |

## Trust boundaries

1. Browser ↔ Next.js server on Vercel (HTTPS).
2. Next.js server ↔ Supabase (publishable key + the user's session).
3. GitHub ↔ Vercel and GitHub Actions (the pipeline).

## STRIDE

| # | Threat (STRIDE) | Example | Control in our system | Where |
|---|---|---|---|---|
| T1 | **S**poofing: fake student accounts | A non-student signs up to post spam | Every account starts `pending`; an admin checks the student ID; 5 posts per day | `handle_new_user` trigger, `admin_review_user`, `create_post` |
| T2 | **S**poofing: stolen session | XSS reads the cookie | Session cookie is `HttpOnly`, `SameSite=Lax`, `Secure`; HSTS; CSP with a nonce | `src/lib/cookies.ts`, `src/middleware.ts`, `next.config.ts` |
| T3 | **T**ampering: writing to the database with the public key | `POST /rest/v1/posts` with the publishable key | No INSERT/UPDATE/DELETE grant on any table; writes only through `security definer` functions that check `auth.uid()` | `revoke all` + grants in every migration |
| T4 | **T**ampering: SQL injection | `'; drop table posts;--` in the search box | Parameters only, through RPC; no SQL or PostgREST filter strings built from input; `%`, `_` and `\` escaped in search | `search_posts`, `src/app/page.tsx` |
| T5 | **T**ampering: XSS in a post | `<script>` in a title | React escapes output; no `dangerouslySetInnerHTML`; CSP `script-src 'nonce-…' 'strict-dynamic'` | all pages, `src/lib/csp.ts` |
| T6 | **R**epudiation: an admin denies a decision | "I never rejected that claim" | Every admin decision is written to `admin_log` (who, what, when, note) | `admin_log` table, Log tab |
| T7 | **I**nformation disclosure: reading other students' data | Visitor asks for `owner_id` or `student_id` | RLS: own profile only; posts have a column grant without `owner_id`, `reviewed_by` and `reject_reason`; claims only through `my_claims()` / `admin_list_claims()` | migrations 1–3 |
| T8 | **I**nformation disclosure: pending posts | Guessing a post URL | `get_post` returns pending/rejected posts only to the owner or an admin; otherwise 404 ("missing" and "not allowed" look the same) | `get_post`, `/posts/[id]` |
| T9 | **I**nformation disclosure: leaked secret | A key in a commit | Only the publishable key, server only (no `NEXT_PUBLIC_`); the app refuses to start with a secret key; gitleaks in CI; GitHub push protection | `src/lib/env.ts`, `security.yml` |
| T10 | **D**enial of service: spam posts | A script posts 1,000 items | Only approved students can post; 5 posts per day per student; 1 claim per post | `create_post`, `claims` unique constraint |
| T11 | **E**levation of privilege: a student becomes admin | Sends `{"role":"admin"}` in the sign-up metadata | The trigger copies only `full_name` and `student_id`; the role comes only from `profiles.role`; no UPDATE grant | `handle_new_user`, `is_admin()` |
| T12 | **E**levation of privilege: student opens admin pages | Goes to `/admin` or calls an admin action | Checked 3 times on the server: the page (404), the Server Action (`requireAdmin`) and the SQL function (`require_admin()`) | `src/lib/auth.ts`, `src/app/admin/`, SQL |
| T13 | **E**levation of privilege: conflict of interest | An admin approves their own claim | SQL refuses: an admin can't review their own post, decide their own claim, or a claim on their own post | `admin_review_post`, `admin_decide_claim` |
| T14 | Tampering: supply chain | A bad npm package or a changed GitHub Action | Exact versions in `package-lock.json`; Dependabot; `npm audit`; CodeQL; actions pinned to commit SHAs; `permissions: contents: read` | `.github/` |

## Accepted risks (v1)

| Risk | Why we accept it | Later fix (v2) |
|---|---|---|
| Emails are not verified | Supabase's free email only sends to team addresses; the admin checks the student ID instead | Custom SMTP + email confirmation |
| No automatic backups | Free Supabase plan | Paid plan or a scheduled `pg_dump` |
| Login rate limit is Supabase's default only | Enough for a campus pilot | Add a CAPTCHA on sign-up and login |
| One Supabase project for everything | Free plan, 3-week project | A separate staging project |

## How we check it

- 85 pgTAP tests in `supabase/tests/` check RLS, grants, the trigger and every function's rules.
- 50 Vitest tests check that each Server Action checks the role first and sends the right parameters.
- Aya's security test plan tries every case as a visitor, a pending student, a student and an admin (`docs/tests/security-plan.md`).
