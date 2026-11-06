# Tasks — Anfel (Company Manager)

**Points:** 11 · **You own:** Security: CI security checks, SQL security review, threat model, security section. Also the Use Case diagram and the slides.

**Only you edit these files:** `.github/workflows/security.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`, `.github/pull_request_template.md`, `docs/diagrams/use-case.md`, `docs/threat-model.md`, `docs/report/security.md`, `docs/tasks/anfel.md`

**Who reviews you:** Sif reviews your workflow PRs. Aya reviews your docs PRs.

> Read `docs/PROJECT.md` first. The board (GitHub Projects) shows the live status; tick the boxes here when a card is Done.
> If you need a change in a file you don't own, open an issue for its owner. Don't edit it yourself.

## Every day / every week

- Review every `supabase/` PR from Lokmane for security: RLS on, no write grants, `auth.uid()` checked, role never from `user_metadata`.
- Decide when Younes is unsure whether an issue is `must-fix`.
- Approve or refuse any new feature request (scope guard).
- Review Younes's docs PRs.
- Come to the Friday 20:00 meeting with: what I finished, what's next, what's blocking me.
- **You write the minutes of the meeting on Fri Nov 20 (weekly #3)**: copy `docs/minutes/TEMPLATE.md`, fill it during the meeting, open the PR the same evening.
- **After each task:** add one row to "My work log" at the bottom of this file (in the same PR as the task when you can).

## Week 1 — Foundations (Nov 7 → Nov 13)

### Saturday Nov 7

- [ ] **GitHub 2FA and SSH key** — due Sat 7 — with: Everyone
  - Done when: `ssh -T git@github.com` says "Hi <user>"
  - AI: "On [my OS], walk me through creating an ed25519 SSH key with a passphrase and adding it to GitHub."

### Sunday Nov 8

- [ ] **First PR: team file** — due Sun 8 — with: Everyone
  - Done when: `docs/team/<name>.md` (name, title, what you own, what you want to learn) merged with 1 approval
  - AI: "Explain step by step: new branch, commit one file, push, open a PR, request a reviewer."

### Monday Nov 9

- [ ] **Use Case diagram** — due Mon 9
  - Done when: `docs/diagrams/use-case.md` renders on GitHub
  - AI: "Write a Mermaid flowchart that looks like a Use Case diagram with actors Visitor, Student, Admin and the use cases from this table: [paste PROJECT.md sections 5 and 6]."

- [ ] **Dependabot and PR template** — due Mon 9
  - Done when: `.github/dependabot.yml` (npm, github-actions, docker; weekly) and `.github/pull_request_template.md` with a security checklist

### Tuesday Nov 10

- [ ] **Security review: SQL 1** — due Tue 10
  - Done when: review comment on Lokmane's SQL 1 PR: RLS on every table, no write grants for anon/authenticated, every function checks auth.uid() and uses set search_path = '', role never read from user_metadata; approve or request changes
  - AI: "Review this Supabase SQL for security like a senior reviewer: RLS, grants, SECURITY DEFINER functions, search_path, auth.uid() checks. List problems with line numbers: [paste SQL]."

### Wednesday Nov 11

- [ ] **Threat model v1** — due Wed 11
  - Done when: `docs/threat-model.md`: assets, STRIDE threats, the control for each (start from `PROJECT.md` §11)
  - AI: "Help me write a short STRIDE threat model for a website with visitors, students approved by an admin, and admins. Focus on fake accounts, privilege escalation, reading other students' IDs and false claims."

- [ ] **Security review: SQL 2** — due Wed 11
  - Done when: review comment on Lokmane's SQL 2 PR: RLS on every table, no write grants for anon/authenticated, every function checks auth.uid() and uses set search_path = '', role never read from user_metadata; approve or request changes
  - AI: "Review this Supabase SQL for security like a senior reviewer: RLS, grants, SECURITY DEFINER functions, search_path, auth.uid() checks. List problems with line numbers: [paste SQL]."

### Thursday Nov 12

- [ ] **Security review: SQL 3** — due Thu 12
  - Done when: review comment on Lokmane's SQL 3 PR: RLS on every table, no write grants for anon/authenticated, every function checks auth.uid() and uses set search_path = '', role never read from user_metadata; approve or request changes
  - AI: "Review this Supabase SQL for security like a senior reviewer: RLS, grants, SECURITY DEFINER functions, search_path, auth.uid() checks. List problems with line numbers: [paste SQL]."

### Friday Nov 13

- [ ] **CI: security workflows** — due Fri 13
  - Done when: `security.yml` (`npm audit --omit=dev --audit-level=high`, gitleaks) and `codeql.yml` green; Younes adds them as required checks in `protect-main`
  - AI: "Add gitleaks and a CodeQL workflow (javascript-typescript, build-mode none) to my GitHub Actions, and pin actions to commit SHAs."

## Week 2 — Features, deploy, client test (Nov 14 → Nov 20)

### Wednesday Nov 18

- [ ] **RLS review** — due Wed 18
  - Done when: comment on the SQL: every threat in the threat model mapped to a line of SQL

### Friday Nov 20

- [ ] **Threat model v2** — due Fri 20
  - Done when: updated with Aya's results and the accepted risks

## Week 3 — Auto-deploy, live change, report, presentation (Nov 21 → Nov 27)

### Monday Nov 23

- [ ] **Security section** — due Mon 23
  - Done when: `docs/report/security.md`: roles, RLS, functions, validation, XSS/SQLi, secrets, CI security, accepted risks

### Tuesday Nov 24

- [ ] **Own slides + "What I learned"** — due Tue 24 — with: Everyone
  - Done when: 2 slides each, and 5–8 lines in `docs/report/learned-<name>.md`

- [ ] **Slides assembled** — due Tue 24
  - Done when: one deck following the story in `PROJECT.md` §17

### Wednesday Nov 25

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
| | | | |
