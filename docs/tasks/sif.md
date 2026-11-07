# Tasks — Sif (DevOps Engineer)

**Points:** 11 · **You own:** Containers, the CI/CD pipeline, hosting, and the 2 DevOps diagrams.

**Only you edit these files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `docs/diagrams/cicd.md`, `docs/diagrams/architecture.md`, `docs/report/cicd.md`, `docs/tasks/sif.md`

**Who reviews you:** Lokmane reviews your workflow and Docker PRs. Younes reviews your docs PRs.

> Read `docs/PROJECT.md` first. The board (GitHub Projects) shows the live status; tick the boxes here when a card is Done.
> If you need a change in a file you don't own, open an issue for its owner. Don't edit it yourself.

## Every day / every week

- Review Anfel's workflow PRs (`security.yml`, `codeql.yml`, Dependabot).
- If CI breaks on `main`, you are the first to look at the logs.
- Come to the Friday 20:00 meeting with: what I finished, what's next, what's blocking me.
- **You write the minutes of the meeting on Fri Nov 13 (weekly #2)**: copy `docs/minutes/TEMPLATE.md`, fill it during the meeting, open the PR the same evening.
- **After each task:** add one row to "My work log" at the bottom of this file (in the same PR as the task when you can).

## What is left for you (updated Sat Nov 7)

The app is ready for Docker: `next.config.ts` already has `output: "standalone"`, and `/api/health` exists (PR [#5](https://github.com/serrarlokmane/uni-lost-and-found/pull/5)).

| Task | Deadline |
|---|---|
| Dockerfile: multi-stage, `node:24-alpine`, user `node`; the image starts with `node .next/standalone/server.js` (not `next start`); `HEALTHCHECK` on `/api/health` | Tue Nov 10 |
| docker-compose | Wed Nov 11 |
| CI workflow `.github/workflows/ci.yml`: format, lint, typecheck, test, build, Docker build; green | Thu Nov 12 |
| Push the image to GHCR (`deploy.yml`) | Tue Nov 17 |
| Render service from the GHCR image with the 2 env vars `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (Environment tab, never in a file); send the URL to Lokmane | Wed Nov 18 |
| Auto-deploy with the Render deploy hook | Sat Nov 21 |

## Week 1 — Foundations (Nov 7 → Nov 13)

### Saturday Nov 7

- [ ] **GitHub 2FA and SSH key** — due Sat 7 — with: Everyone
  - Done when: `ssh -T git@github.com` says "Hi <user>"
  - AI: "On [my OS], walk me through creating an ed25519 SSH key with a passphrase and adding it to GitHub."

### Sunday Nov 8

- [ ] **First PR: team file** — due Sun 8 — with: Everyone
  - Done when: `docs/team/<name>.md` (name, title, what you own, what you want to learn) merged with 1 approval
  - AI: "Explain step by step: new branch, commit one file, push, open a PR, request a reviewer."

- [ ] **Dev setup** — due Sun 8 — with: Lokmane, Sif, Younes
  - Done when: Node 24, Git, VS Code, Docker Desktop; `node -v` and `docker run hello-world` work (Younes needs it to run PRs locally)

### Tuesday Nov 10

- [ ] **Dockerfile** — due Tue 10
  - Start command: `node .next/standalone/server.js` (copy `.next/static` and `public` next to it)
  - Done when: multi-stage, `node:24-alpine`, `output: "standalone"`, user `node`, `HEALTHCHECK` on `/api/health`; builds locally
  - AI: "Write a multi-stage Dockerfile for a Next.js 15 standalone app on node:24-alpine that runs as a non-root user, with a HEALTHCHECK."

### Wednesday Nov 11

- [ ] **docker-compose** — due Wed 11
  - Done when: `docker compose up --build` serves the app on port 3000, with `env_file: .env`, `read_only: true`, tmpfs `/tmp`, `cap_drop: [ALL]`, `no-new-privileges`

### Thursday Nov 12

- [ ] **CI: quality workflow** — due Thu 12
  - Done when: `.github/workflows/ci.yml` runs `npm ci`, `format:check`, lint, typecheck, test, build and a Docker build on every PR; green
  - AI: "Write a GitHub Actions workflow for Node 24: npm ci, format check, lint, typecheck, test, build, docker build on pull_request, with permissions: contents: read and actions pinned to commit SHAs."

## Week 2 — Features, deploy, client test (Nov 14 → Nov 20)

### Saturday Nov 14

- [ ] **CI/CD and architecture diagrams** — due Sat 14
  - Done when: `docs/diagrams/cicd.md` and `docs/diagrams/architecture.md` (start from `PROJECT.md` §12–13)

### Monday Nov 16

- [ ] **App in Docker with the real database** — due Mon 16
  - Done when: `docker compose up --build`, then sign up and log in; screenshot in `docs/evidence/`

### Tuesday Nov 17

- [ ] **Push the image to GHCR** — due Tue 17
  - Done when: on `main` only, `.github/workflows/deploy.yml` pushes `ghcr.io/<owner>/uni-lost-and-found:<sha>` and `:latest`; package public (no secrets in the image)

### Wednesday Nov 18

- [ ] **Render service** — due Wed 18
  - Done when: Render web service from the GHCR image, health check `/api/health`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the Environment tab; HTTPS URL works
  - AI: "How do I deploy a public GHCR Docker image to Render's free web service with a health check path and environment variables?"

## Week 3 — Auto-deploy, live change, report, presentation (Nov 21 → Nov 27)

### Saturday Nov 21

- [ ] **Auto-deploy** — due Sat 21
  - Done when: after the GHCR push on `main`, `deploy.yml` calls the Render deploy hook from the GitHub Secret `RENDER_DEPLOY_HOOK_URL` (never printed)

### Sunday Nov 22

- [ ] **Pipeline end-to-end test** — due Sun 22
  - Done when: a small text change goes PR → merge → live; time measured (goal < 10 min); a screenshot of each step

### Monday Nov 23

- [ ] **Pipeline write-up** — due Mon 23
  - Done when: `docs/report/cicd.md`: each job and why it exists

### Tuesday Nov 24

- [ ] **Own slides + "What I learned"** — due Tue 24 — with: Everyone
  - Done when: 2 slides each, and 5–8 lines in `docs/report/learned-<name>.md`

### Wednesday Nov 25

- [ ] **Rehearsal 1 (timed)** — due Wed 25, 20:00 — with: Everyone
  - Done when: timing noted; the live change tested on a test PR

### Thursday Nov 26

- [ ] **Rehearsal 2 + report merged** — due Thu 26 — with: Everyone
  - Done when: under the time limit; backup video checked; report PR approved

- [ ] **Pre-demo check** — due Thu 26
  - Done when: all checks green on `main`; Supabase project active; backup video on a USB stick

### Friday Nov 27

- [ ] **Presentation** — due Fri 27 — with: Everyone
  - Done when: open the site 2 minutes before (Render wakes up), then present

## My work log

> One row per finished task. The link is the proof: a PR, an issue, a commit or a screenshot in `docs/evidence/`.
> Younes copies all 5 logs into `docs/work-log.md` every Friday before the meeting.

| Date | Task | Time spent | Proof (link) |
|---|---|---|---|
| | | | |
