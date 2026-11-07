# Tasks — Aya (Client)

**Points:** 11 · **You own:** What the client wants and whether the site really works: requirements, all tests by hand, demo data, user guide, backup video, acceptance.

**Only you edit these files:** `docs/client-requirements.md`, `docs/tests/`, `docs/acceptance.md`, `docs/user-guide.md`, `docs/evidence/client/`, `docs/tasks/aya.md`

**Who reviews you:** Younes reviews your docs PRs.

> Read `docs/PROJECT.md` first. The board (GitHub Projects) shows the live status; tick the boxes here when a card is Done.
> If you need a change in a file you don't own, open an issue for its owner. Don't edit it yourself.

## Every day / every week

- Every problem you find becomes a GitHub Issue assigned to the file's owner: steps, expected result, actual result.
- Review Anfel's docs PRs.
- Come to the Friday 20:00 meeting with: what I finished, what's next, what's blocking me.
- **You write the minutes of the meeting on Wed Nov 25 (rehearsal 1)**: copy `docs/minutes/TEMPLATE.md`, fill it during the meeting, open the PR the same evening.
- **After each task:** add one row to "My work log" at the bottom of this file (in the same PR as the task when you can).

## What is left for you (updated Sat Nov 7)

All the v1 pages exist now (PRs [#22](https://github.com/serrarlokmane/uni-lost-and-found/pull/22) to [#27](https://github.com/serrarlokmane/uni-lost-and-found/pull/27)). Write your scripts from them; you run them on the live URL once Sif's Render service is up (Wed Nov 18).

| Task | Deadline |
|---|---|
| Client test script `docs/tests/test-script.md` (every journey in `PROJECT.md` §7) | Wed Nov 11 |
| Security test plan `docs/tests/security-plan.md` (every role, XSS/SQLi strings for each form field) | Fri Nov 13 |
| Guided client test on the live URL; each problem becomes an issue for Lokmane | Thu Nov 19 |
| Security tests round 1 + accessibility test (design-system §8 checklist); results in `docs/tests/security-report.md` | Fri Nov 20 |
| Security tests round 2 on the live URL | Sun Nov 22 |

## Week 1 — Foundations (Nov 7 → Nov 13)

### Saturday Nov 7

- [x] **GitHub 2FA and SSH key** — due Sat 7 — with: Everyone
  - Done when: `ssh -T git@github.com` says "Hi <user>"
  - AI: "On [my OS], walk me through creating an ed25519 SSH key with a passphrase and adding it to GitHub."

### Sunday Nov 8

- [x] **First PR: team file** — due Sun 8 — with: Everyone
  - Done when: `docs/team/<name>.md` (name, title, what you own, what you want to learn) merged with 1 approval
  - AI: "Explain step by step: new branch, commit one file, push, open a PR, request a reviewer."

- [x] **Client requirements** — due Sun 8
  - Done when: `docs/client-requirements.md`: the problem, the 3 roles, user stories for F1–F11
  - AI: "Help me turn these features into user stories 'As a <role>, I want <goal>, so that <reason>': [paste the feature table]."

### Monday Nov 9

- [x] **Problem evidence** — due Mon 9
  - Done when: 3–5 Facebook screenshots with names and faces blurred in `docs/evidence/client/`

### Wednesday Nov 11

- [ ] **Test script** — due Wed 11
  - Done when: `docs/tests/test-script.md`: steps for each journey in `PROJECT.md` §7

### Friday Nov 13

- [ ] **Security test plan** — due Fri 13
  - Done when: `docs/tests/security-plan.md`: authorization tests per role (from the "Who sees what" table) + XSS/SQLi strings for each form field

## Week 2 — Features, deploy, client test (Nov 14 → Nov 20)

### Tuesday Nov 17

- [ ] **Demo data plan** — due Tue 17
  - Done when: 10 realistic posts and 3 claims in `docs/tests/demo-data.md` (no real names)

### Thursday Nov 19

- [ ] **Guided client test** — due Thu 19
  - Done when: in Meet, Aya runs the test script on the live URL; each problem filed as an issue for Lokmane
  - AI: "Help me write a clear GitHub issue: steps to reproduce, expected result, actual result."

### Friday Nov 20

- [ ] **Security tests round 1 + accessibility test** — due Fri 20
  - Done when: every case in the security plan tried as visitor, pending, student and admin; design-system §8 checklist marked pass/fail; results in `docs/tests/security-report.md`

## Week 3 — Auto-deploy, live change, report, presentation (Nov 21 → Nov 27)

### Saturday Nov 21

- [ ] **Load the demo data** — due Sat 21
  - Done when: the 10 posts and 3 claims created through the site with test accounts, approved by the admin

### Sunday Nov 22

- [ ] **Security tests round 2** — due Sun 22
  - Done when: re-test the fixed issues on the live URL; headers with `curl -I`; report updated

### Monday Nov 23

- [ ] **User guide** — due Mon 23
  - Done when: `docs/user-guide.md`: one page for students, one page for admins, with screenshots

### Tuesday Nov 24

- [ ] **Backup video** — due Tue 24 — with: Aya (records) + Lokmane (does the change)
  - Done when: Student Card change (PR → CI → merge → live), under 4 min, in the shared drive

- [ ] **Own slides + "What I learned"** — due Tue 24 — with: Everyone
  - Done when: 2 slides each, and 5–8 lines in `docs/report/learned-<name>.md`

### Wednesday Nov 25

- [ ] **Final acceptance test** — due Wed 25
  - Done when: `docs/acceptance.md`: every acceptance criterion marked pass/fail and signed

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

| 7 Nov | GitHub 2FA + SSH key | 1h | ssh -T success (screenshot) |
| 8 Nov | First PR: team file | 30 min | https://github.com/serrarlokmane/uni-lost-and-found/pull/38 |
| 8 Nov | Client requirements | 1h | https://github.com/serrarlokmane/uni-lost-and-found/pull/39 |
| 9 Nov | Problem evidence (illustrations) | 1h | https://github.com/serrarlokmane/uni-lost-and-found/pull/40 |