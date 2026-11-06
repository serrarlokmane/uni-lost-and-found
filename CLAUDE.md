# CLAUDE.md — Lqito (University Lost & Found)

## Session rule (do this first, every session)
Ask: **what did each member finish, and what is blocking us?**
Then give each member their next steps from their own file in `docs/tasks/<name>.md` (calendar of the whole team: `docs/PLAN.md`). If someone is behind, give a concrete fix, not encouragement.

## Goal
A simple university Lost & Found website, built in 3 weeks by 5 cybersecurity students.
The main goal is learning teamwork and DevOps. Keep the site simple.

## What we build
**Read `docs/PROJECT.md` first** (full spec: roles, features, rules, data model, security, architecture). `docs/PLAN.md` = daily tasks. `docs/design-system.md` = UI.
Short version: verified students (email + student ID, approved by an admin) post lost/found items; admins approve posts and decide claims; hand-over at the Lost & Found office.

**Only the "Must" features (F1–F11) in v1.** "Could" features need Anfel's approval and only after v1 is done.
Planned exception: the "Student Card" category added live at the presentation.

## Team
**Only Lokmane writes website code** (frontend, backend, SQL, tests) with AI help. The other 4 have 11 points each and never edit `src/`, `supabase/` or `tests/`. Titles are parts in the presentation story. Full split: `docs/PLAN.md` → "Who does what" and "Who touches which files".

| Member | Title | Owns |
|---|---|---|
| Lokmane | Developer | All app code: SQL, Supabase client, auth, posts, search, admin, claims, middleware, tests, Student Card change |
| Younes | Project Manager | Board, CODEOWNERS, meetings, minutes, work log, evidence, report; scope + criteria; functional review of every app PR |
| Sif | DevOps Engineer | Dockerfile, compose, `ci.yml`, `deploy.yml`, GHCR, Render, auto-deploy, CI/CD + architecture diagrams |
| Anfel | Company Manager | Use Case, `security.yml`, `codeql.yml`, Dependabot, PR template, security review of every SQL PR, threat model, security section, slides |
| Aya | Client | Requirements, test script, client + security + accessibility tests, demo data, user guide, backup video, acceptance |

Lokmane is the one most at risk of falling behind: check the "safety cuts" in `PLAN.md` on Mon Nov 16.

**Claude's role:** guide, review and fix problems. Lokmane writes the code with AI help; Claude explains, reviews Lokmane's PRs and gives small fixes, and helps the others with their files.

## Stack (fixed) and why
- **Next.js 15 + TypeScript:** server rendering and Server Actions keep the DB key on the server; one app = one container.
- **Supabase:** Postgres with RLS + Auth (sessions via `@supabase/ssr` cookies). Uses the **publishable key** (`sb_publishable_...`, or the legacy anon key) **on the server only**, no `NEXT_PUBLIC_` prefix.
- **zod:** validates all input on the server.
- **Vitest:** fast TypeScript tests.
- **Docker:** same runtime on every machine. Multi-stage, non-root, standalone output.
- **GHCR:** free image registry using `GITHUB_TOKEN`.
- **Render (free):** runs the Docker image, HTTPS, deploy hook called from CI.
- **GitHub Actions:** lint, typecheck, test, build, npm audit, gitleaks, CodeQL, then deploy on main.

## Security rules
- Never commit `.env`. Only `.env.example` with placeholders.
- Never use, ask for, or print the **secret key** (`sb_secret_...`) or the legacy **service_role** key. Never print any key.
- RLS on for every table (`profiles`, `posts`, `claims`, `admin_log`). SELECT policies only; no direct writes for `anon` or `authenticated`.
- All writes go through `security definer` functions with `set search_path = ''` that check `auth.uid()`:
  `create_post`, `create_claim`, `close_post`, `admin_review_user`, `admin_review_post`, `admin_decide_claim`. Search goes through `search_posts` (`security invoker`).
- The role comes only from `profiles.role` (via `is_admin()`), **never from `user_metadata`**. The sign-up trigger always creates `student` + `pending`.
- `student_id` is personal data: only the owner and admins can see it. Posts show no phone or email.
- Admin checks happen on the server three times: page, Server Action, SQL function.
- No `dangerouslySetInnerHTML`. No SQL or PostgREST filters built from strings.
- CSP with a nonce, plus security headers. Pin GitHub Actions to commit SHAs. Least-privilege `permissions:`.
- The repo is public: no secrets, no personal emails, no Supabase keys in any file.

## Git rules
- Never push to `main` (the `protect-main` ruleset blocks it).
- One GitHub Issue (card on the Project board) = one branch = one PR. The PR body says `Closes #<issue>`. Branch names: `feat/...`, `fix/...`, `docs/...`, `ci/...`.
- 1 approval needed; stale approvals are dismissed on new pushes. The author merges after approval.
- Small PRs. Fill in the PR template.

## Commands (once the app exists)
```bash
npm install              # install dependencies
cp .env.example .env     # then fill SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY yourself
npm run dev              # http://localhost:3000
npm test                 # Vitest
npm run lint             # ESLint
npm run build            # production build
docker compose up --build   # run in Docker on port 3000
```

## Schedule (presentation ~Fri Nov 27, 2026)
- **Week 1 (Nov 7–13):** setup, SQL (4 tables, RLS, functions), skeleton, Docker, CI.
- **Week 2 (Nov 14–20):** accounts, posts, search, admin dashboard, claims, app in Docker, GHCR, first Render deploy, client tests.
- **Week 3 (Nov 21–27):** auto-deploy, Student Card prep (migration applied in advance), backup video, report, rehearsals, presentation.
- Weekly meeting: Fridays 20:00 on Google Meet. Full task list: `docs/PLAN.md` (see "Known pitfalls").
