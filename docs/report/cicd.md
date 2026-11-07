# CI/CD — report section

**Owner:** Sif

## Goal

Every change goes through the same path: branch → pull request → automatic checks → 1 human review → merge → live. Nobody can push straight to `main`, and a change that breaks the build, the tests or the security checks can't be merged.

## Why each job exists

| Job | Problem it prevents |
|---|---|
| `format:check` | Messy diffs: everyone's code looks the same, so reviews show only real changes |
| `lint` | Common bugs and unsafe React patterns |
| `typecheck` | Wrong types between the pages, the actions and the database types |
| `test` (Vitest) | A Server Action that skips the role check, or sends the wrong parameters to SQL |
| `build` | A page that compiles in dev but breaks in production |
| Docker build | A Dockerfile that no longer works (the image is our "runs anywhere" proof) |
| `npm audit` | A dependency with a known high-severity vulnerability |
| gitleaks | A key or password committed by mistake (the repo is public) |
| CodeQL | Injection and other security bugs found by static analysis |

## Deploy

- **Before (plan):** GitHub Actions builds a Docker image → GHCR → Render deploy hook.
- **Now:** Vercel is connected to the GitHub repo. Every PR gets a **preview URL**, so reviewers click through the real change before approving. Every merge to `main` deploys **production** by itself.
- **Why we changed:** Render's free plan sleeps after 15 minutes (first load ~50 s, a risk during the demo). Vercel needs no deploy hook secret and gives a preview per PR.
- **What stays:** the Dockerfile and `docker compose` for local runs and the CI Docker build.

## Numbers to measure (Pipeline end-to-end test, Sun Nov 22)

| Step | Time |
|---|---|
| Push → CI green | _to measure_ |
| Approval → merge | _to measure_ |
| Merge → live on Vercel | _to measure_ |
| **Total** (goal < 10 min) | _to measure_ |

Fill this table from a real test PR, with a screenshot of each step in `docs/evidence/`.
