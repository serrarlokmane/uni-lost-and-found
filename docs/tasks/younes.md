# Tasks — Younes (Project Manager)

**Points:** 11 · **You own:** The board, meetings, evidence, report, scope, and the functional review of every app PR.

**Only you edit these files:** `.github/CODEOWNERS`, `docs/minutes/TEMPLATE.md`, `docs/work-log.md`, `docs/evidence/`, `docs/scope.md`, `docs/report/REPORT.md`, `docs/tasks/younes.md`

**Who reviews you:** Anfel reviews your docs PRs.

> Read `docs/PROJECT.md` first. The board (GitHub Projects) shows the live status; tick the boxes here when a card is Done.
> If you need a change in a file you don't own, open an issue for its owner. Don't edit it yourself.

## Every day / every week

- Every day at 21:00: check the board and message the owner of any card stuck for more than 1 day.
- Every app PR from Lokmane: pull the branch, run `npm run dev`, click through the feature, then approve or ask for changes.
- After every Friday meeting: send Claude what each member finished and what is blocking.
- Review the docs PRs of Sif and Aya.
- Come to the Friday 20:00 meeting with: what I finished, what's next, what's blocking me.
- **You write the minutes of the meeting on Sat Nov 7 (kickoff)**: copy `docs/minutes/TEMPLATE.md`, fill it during the meeting, open the PR the same evening.
- **Every Friday before the meeting:** screenshot the board → `docs/evidence/board/<date>.png`, and copy the 5 "My work log" tables into `docs/work-log.md`.
- **After each task:** add one row to "My work log" at the bottom of this file (in the same PR as the task when you can).

## Week 1 — Foundations (Nov 7 → Nov 13)

### Saturday Nov 7

- [ ] **Create the board and Week 1 issues** — due Sat 7
  - Done when: board linked to the repo with the columns, fields and labels above; every Week 1 card is an issue with assignee, due date and points
  - AI: "How do I create a GitHub Projects board with a date field and auto-add for new issues, and create many issues at once with gh issue create?"

- [ ] **Kickoff meeting** — due Sat 7, 20:00
  - Done when: everyone has read `PROJECT.md`; name of the platform agreed; minutes in `docs/minutes/2026-11-07.md`
  - AI: "Give me a 30-minute kickoff agenda for a 5-person student project."

- [ ] **GitHub 2FA and SSH key** — due Sat 7 — with: Everyone
  - Done when: `ssh -T git@github.com` says "Hi <user>"
  - AI: "On [my OS], walk me through creating an ed25519 SSH key with a passphrase and adding it to GitHub."

### Sunday Nov 8

- [ ] **First PR: team file** — due Sun 8 — with: Everyone
  - Done when: `docs/team/<name>.md` (name, title, what you own, what you want to learn) merged with 1 approval
  - AI: "Explain step by step: new branch, commit one file, push, open a PR, request a reviewer."

- [ ] **Dev setup** — due Sun 8 — with: Lokmane, Sif, Younes
  - Done when: Node 24, Git, VS Code, Docker Desktop; `node -v` and `docker run hello-world` work (Younes needs it to run PRs locally)

### Monday Nov 9

- [ ] **Scope** — due Mon 9
  - Done when: `docs/scope.md`: Must / Could / Won't lists and categories, from `PROJECT.md` §6

### Tuesday Nov 10

- [ ] **Acceptance criteria** — due Tue 10
  - Done when: Given/When/Then for every v1 feature, in `docs/scope.md`

### Thursday Nov 12

- [ ] **Board automation + CODEOWNERS** — due Thu 12
  - Done when: new issues auto-added; merged PRs move cards to Done; `.github/CODEOWNERS` from the "Who touches which files" table

### Friday Nov 13

- [ ] **Weekly meeting #2** — due Fri 13, 20:00
  - Done when: minutes merged, work log up to date, status sent to Claude

## Week 2 — Features, deploy, client test (Nov 14 → Nov 20)

### Saturday Nov 14

- [ ] **Week 2 issues** — due Sat 14
  - Done when: all Week 2 cards are issues with assignee, due date and points

### Sunday Nov 15

- [ ] **Admin account for testing** — due Sun 15
  - Done when: signs up on the site; Lokmane makes this account admin in the SQL Editor (see "First admin")

### Monday Nov 16

- [ ] **Safety-cut check** — due Mon 16
  - Done when: is Lokmane more than 1 day late on the board? If yes, apply "Lokmane's safety cuts" and tell the team

### Thursday Nov 19

- [ ] **Prioritize the feedback** — due Thu 19
  - Done when: each issue labeled `must-fix` or `nice-to-have` (Anfel decides when unsure)

- [ ] **Start the evidence folder** — due Thu 19
  - Done when: `docs/evidence/`: meeting screenshots, board screenshot, commit graph screenshot

### Friday Nov 20

- [ ] **Weekly meeting #3** — due Fri 20, 20:00
  - Done when: minutes merged, work log up to date, status sent to Claude

## Week 3 — Auto-deploy, live change, report, presentation (Nov 21 → Nov 27)

### Saturday Nov 21

- [ ] **Week 3 issues** — due Sat 21
  - Done when: all Week 3 cards are issues

### Monday Nov 23

- [ ] **Collect the evidence** — due Mon 23
  - Done when: minutes, work log, board export (CSV + screenshot), closed issues, commit graph in `docs/evidence/`

### Tuesday Nov 24

- [ ] **Own slides + "What I learned"** — due Tue 24 — with: Everyone
  - Done when: 2 slides each, and 5–8 lines in `docs/report/learned-<name>.md`

### Wednesday Nov 25

- [ ] **Final report draft** — due Wed 25
  - Done when: `docs/report/REPORT.md` built from everyone's sections, opened as a PR

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
