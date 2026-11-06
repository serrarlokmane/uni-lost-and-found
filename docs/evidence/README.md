# Evidence — how we prove our teamwork

**Owner:** Younes. **Goal:** on presentation day, the professor can check that each member did their part, that we met every week, and that we worked like a real company.

We use 3 layers of proof. The first one is automatic: just work through GitHub and it fills itself.

## Layer 1 — GitHub (automatic, the strongest proof)

GitHub records the date, the author and the content of everything. Nobody can fake it later.

| What | Proves | Where to see it |
|---|---|---|
| Issues (cards) with an assignee | Who had which task | repo → Issues |
| Pull requests | Who did the work, when | repo → Pull requests |
| PR reviews and comments | We checked each other's work | inside each PR |
| Commits | Real work, day by day | repo → Insights → Contributors / Commits |
| Project board | Planning and progress | repo → Projects |
| CI runs (Actions) | Automatic tests and deploys | repo → Actions |
| Minutes merged by PR | When each meeting was written | `docs/minutes/` + the PR merge date |

**Rule:** if a task isn't an issue and a PR, it didn't happen. Even a document is a PR.

## Layer 2 — Our documents (written by us)

| File | Who writes it | When |
|---|---|---|
| `docs/minutes/<date>.md` (from `TEMPLATE.md`) | The note-taker of that meeting (rotation in `PLAN.md`) | Same evening as the meeting |
| "My work log" at the bottom of `docs/tasks/<name>.md` | Each member, their own | After each task |
| `docs/work-log.md` (all 5 logs together) | Younes | Every Friday before the meeting |
| `docs/report/learned-<name>.md` | Each member | Tue Nov 24 |

## Layer 3 — Screenshots and exports (files in this folder)

```
docs/evidence/
  meetings/   2026-11-07.png, 2026-11-13.png, ...   one Meet screenshot per meeting
  board/      2026-11-13.png, 2026-11-20.png, ...   board screenshot every Friday
  github/     contributors.png, commits.png, closed-issues.csv, board.json
  pipeline/   one screenshot per step of the pipeline test (Sif, Sun Nov 22)
  app/        the site running: Docker (Sif), live URL, admin dashboard
  client/     Facebook problem screenshots, blurred (Aya)
```

**Meetings:** at the start of each Meet, the note-taker asks "OK for a screenshot?", then takes one with everyone's camera or name visible, and saves it as `meetings/<date>.png`.
Free Google accounts can't record Meet or download attendance reports, so the screenshot + the minutes PR are our proof.

**Board:** every Friday before the meeting, Younes takes a screenshot of the board → `board/<date>.png`. This shows the progress week by week.

**Final exports (Younes, Mon Nov 23):**
```bash
gh issue list --state closed --limit 200 --json number,title,assignees,closedAt > docs/evidence/github/closed-issues.json
```
```bash
gh pr list --state merged --limit 200 --json number,title,author,mergedAt,reviews > docs/evidence/github/merged-prs.json
```
```bash
gh project item-list <project-number> --owner <github-user> --format json > docs/evidence/github/board.json
```
Plus 2 screenshots: Insights → Contributors (`contributors.png`) and Insights → Commits (`commits.png`).

## Privacy rules

- Ask everyone before any screenshot or recording of a meeting. If someone says no, write "screenshot skipped" in the minutes.
- No phone numbers, personal emails or faces of people outside the team. Blur them.
- No real student names or IDs in demo data or screenshots of the site.
- No keys or tokens in any screenshot (check the browser tabs and terminal before you capture).
- WhatsApp: don't screenshot private chats. If a decision was taken on WhatsApp, write it in the next minutes under "Decisions".

## What we show at the presentation

1. Board screenshots from week 1, 2 and 3 (the progress).
2. One minutes file opened on GitHub, with its PR and approval.
3. Insights → Contributors: all 5 members have commits.
4. A merged PR with a review comment (proof that we review each other).
5. The work log table: one line per task, each with a link.
