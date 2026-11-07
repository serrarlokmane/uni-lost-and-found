# Tasks — Lokmane (Developer)

**Points:** ~30 (see "Lokmane's safety cuts" in PLAN.md) · **You own:** All website code: frontend, backend, SQL, tests.

**Only you edit these files:** `src/`, `supabase/`, `tests/`, `package.json`, `next.config.ts`, `middleware.ts`, `docs/tasks/lokmane.md`

**Who reviews you:** Younes approves every app PR after running it locally. Anfel also reviews every `supabase/` PR for security.

> Read `docs/PROJECT.md` first. The board (GitHub Projects) shows the live status; tick the boxes here when a card is Done.
> If you need a change in a file you don't own, open an issue for its owner. Don't edit it yourself.

## Every day / every week

- Keep PRs small: one card = one PR. Run `npm run format` before each commit.
- Review Sif's PRs (Dockerfile, compose, `ci.yml`, `deploy.yml`).
- On Mon Nov 16, if you are more than 1 day late, apply the safety cuts with Younes.
- Come to the Friday 20:00 meeting with: what I finished, what's next, what's blocking me.
- **You write the minutes of the meeting on Thu Nov 26 (rehearsal 2)**: copy `docs/minutes/TEMPLATE.md`, fill it during the meeting, open the PR the same evening.
- **After each task:** add one row to "My work log" at the bottom of this file (in the same PR as the task when you can).

## Week 1 — Foundations (Nov 7 → Nov 13)

### Saturday Nov 7

- [ ] **Invite everyone to the repo** — due Sat 7
  - Done when: all 4 accepted (Settings → Collaborators). Supabase: invite Anfel (Developer role) so she can test the SQL.

- [ ] **GitHub 2FA and SSH key** — due Sat 7 — with: Everyone
  - Done when: `ssh -T git@github.com` says "Hi <user>"
  - AI: "On [my OS], walk me through creating an ed25519 SSH key with a passphrase and adding it to GitHub."

### Sunday Nov 8

- [ ] **First PR: team file** — due Sun 8 — with: Everyone
  - Done when: `docs/team/<name>.md` (name, title, what you own, what you want to learn) merged with 1 approval
  - AI: "Explain step by step: new branch, commit one file, push, open a PR, request a reviewer."

- [ ] **PR: PROJECT.md, PLAN.md, CLAUDE.md, design system** — due Sun 8
  - Done when: merged after Younes approves

- [ ] **Dev setup** — due Sun 8 — with: Lokmane, Sif, Younes
  - Done when: Node 24, Git, VS Code, Docker Desktop; `node -v` and `docker run hello-world` work (Younes needs it to run PRs locally)

### Monday Nov 9

- [ ] **App skeleton** — due Mon 9
  - Done when: Next.js 15 (TypeScript, App Router, `src/`, ESLint, no Tailwind), design-system colors and fonts, header, `/api/health` returning `{"status":"ok"}`, Prettier (`format`, `format:check`), Vitest with one passing test
  - AI: "Create a Next.js 15 app with TypeScript, App Router, src/ folder, ESLint, no Tailwind, using npm, then add Prettier with format and format:check scripts, Vitest with one example test, and a /api/health route."

### Tuesday Nov 10

- [ ] **SQL 1: profiles, posts, RLS, trigger** — due Tue 10
  - Done when: `supabase/migrations/20261110_base.sql`: `profiles`, `posts`, CHECK constraints, RLS, SELECT policies from `PROJECT.md` §5, no writes for `anon`/`authenticated`, `is_admin()`, sign-up trigger (`student` + `pending`), `create_post`, `close_post`. Reviewed by Anfel, applied.
  - AI: "Write Postgres SQL for Supabase: a profiles table linked to auth.users, filled by a trigger that copies full_name and student_id from raw_user_meta_data but always sets role 'student' and status 'pending'; a posts table with CHECK constraints; RLS on both; SELECT policies with auth.uid() and an is_admin() security definer helper; revoke writes from anon and authenticated. Explain each line."

### Wednesday Nov 11

- [ ] **SQL 2: search and admin** — due Wed 11
  - Done when: `20261111_search_admin.sql`: `search_posts` (`security invoker`, `%`/`_` escaped), `admin_log`, `admin_review_user`, `admin_review_post`. Reviewed by Anfel, applied.

### Thursday Nov 12

- [ ] **SQL 3: claims + test SQL** — due Thu 12
  - Done when: `20261112_claims.sql`: `claims`, `create_claim`, `admin_decide_claim`. Reviewed by Anfel, applied; the test SQL below passes (Anfel runs it too)

### Friday Nov 13

- [ ] **Supabase client, auth helpers, zod, middleware** — due Fri 13
  - Done when: `src/lib/supabase.ts` (`server-only`, `@supabase/ssr`), `src/lib/auth.ts` (`requireApproved()`, `requireAdmin()`), zod schemas with tests, `middleware.ts` (session refresh + CSP nonce) and security headers in `next.config.ts`; `.env.example`; in Supabase: "Confirm email" off
  - AI: "How do I combine @supabase/ssr session refresh and a Content-Security-Policy nonce in one Next.js 15 middleware?"

## Week 2 — Features, deploy, client test (Nov 14 → Nov 20)

### Saturday Nov 14

- [ ] **F1: sign-up, login, logout, pending page** — due Sat 14
  - Done when: sign-up with full name and student ID; after login users are sent by status (`pending`/`rejected`/`banned` → `/pending`)
  - AI: "In Next.js 15 with @supabase/ssr, write Server Actions for sign-up and login with useActionState, then redirect by the user's profile status."

### Sunday Nov 15

- [ ] **F5 + F6: home, search, filters, post details** — due Sun 15
  - Done when: home calls `search_posts` (GET `?q=&type=&category=`); `/posts/[id]` (404 if not public); empty and no-result states

### Monday Nov 16

- [ ] **F3 + F9: create post, My page, close post** — due Mon 16
  - Done when: `/new` → zod → `create_post` → "Sent. An admin will check it soon."; `/me` with status badges and "Close post"

### Tuesday Nov 17

- [ ] **F2 + F4 + F10: admin dashboard** — due Tue 17
  - Done when: `/admin` for admins only (404 otherwise, checked in the page and every Server Action); tabs Accounts, Posts, Log; Approve / Reject (reason) / Ban

### Wednesday Nov 18

- [ ] **F7 + F8: claims** — due Wed 18
  - Done when: "This is mine" / "I found it" form; admin Claims tab; "My claims" on `/me` with the hand-over message

### Thursday Nov 19

- [ ] **Data-layer tests** — due Thu 19
  - Done when: Vitest tests mock Supabase `rpc()` and check the parameters of every function; `npm test` passes

### Friday Nov 20

- [ ] **Fix must-fix issues (batch 1)** — due Fri 20
  - Done when: all `must-fix` issues from Thursday closed by PRs

## Week 3 — Auto-deploy, live change, report, presentation (Nov 21 → Nov 27)

### Saturday Nov 21

- [ ] **Fix must-fix issues (batch 2)** — due Sat 21
  - Done when: no open `must-fix` issues

### Sunday Nov 22

- [ ] **Student Card migration (applied in advance)** — due Sun 22
  - Done when: a new migration adds `student_card` to the category CHECK constraint, merged and applied. Safe: the old code never sends it.

### Monday Nov 23

- [ ] **Student Card code (draft PR, not merged)** — due Mon 23
  - Done when: branch `feat/student-card`; CI green; PR left as a draft for the demo

### Tuesday Nov 24

- [ ] **Backup video** — due Tue 24 — with: Aya (records) + Lokmane (does the change)
  - Done when: Student Card change (PR → CI → merge → live), under 4 min, in the shared drive

- [ ] **Own slides + "What I learned"** — due Tue 24 — with: Everyone
  - Done when: 2 slides each, and 5–8 lines in `docs/report/learned-<name>.md`

### Wednesday Nov 25

- [ ] **Code freeze** — due Wed 25
  - Done when: only the Student Card PR is allowed after this

- [ ] **Rehearsal 1 (timed)** — due Wed 25, 20:00 — with: Everyone
  - Done when: timing noted; the live change tested on a test PR

### Thursday Nov 26

- [ ] **Rehearsal 2 + report merged** — due Thu 26 — with: Everyone
  - Done when: under the time limit; backup video checked; report PR approved

### Friday Nov 27

- [ ] **Presentation** — due Fri 27 — with: Everyone
  - Done when: open the site 2 minutes before (Render wakes up), then present

## My work log

> One row per finished task. The link is the proof: a PR, an issue, a commit or a screenshot in `docs/evidence/`.
> Younes copies all 5 logs into `docs/work-log.md` every Friday before the meeting.

| Date | Task | Time spent | Proof (link) |
|---|---|---|---|
| 2026-11-06 | App skeleton: Next.js 15, design tokens, header, `/api/health`, Prettier, Vitest | 3h | [#2](https://github.com/serrarlokmane/uni-lost-and-found/issues/2) |
| 2026-11-07 | Design system: "Tag" direction (3 directions compared, A chosen) | 2h | [#3](https://github.com/serrarlokmane/uni-lost-and-found/issues/3) |
