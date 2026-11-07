# Final acceptance test

**Owner:** Aya (Client) · Date of the test: _Wed Nov 25_ · On: https://lqito-lokmane3.vercel.app

Each criterion comes from `docs/scope.md`. Try it on the live site, then mark **Pass** or **Fail**. Every Fail becomes a GitHub issue for Lokmane (link it in the Notes column).

| Criterion | Short description | Pass / Fail | Notes |
|---|---|---|---|
| AC1.1 | Sign-up creates a pending account | | |
| AC1.2 | Duplicate email or student ID refused | | |
| AC1.3 | Pending / rejected / banned see only their status | | |
| AC1.4 | Approved student logs in and out | | |
| AC1.5 | `"role":"admin"` in sign-up still makes a student | | |
| AC2.1 | Admin approves an account | | |
| AC2.2 | Admin rejects an account | | |
| AC2.3 | Admin bans a student; posts hidden | | |
| AC3.1 | Student creates a pending post | | |
| AC3.2 | Bad fields show a message under the field | | |
| AC3.3 | 6th post in a day refused | | |
| AC3.4 | Visitor / pending can't open `/new` | | |
| AC4.1 | Admin publishes a post | | |
| AC4.2 | Admin rejects with a reason; owner sees it | | |
| AC4.3 | Admin can't review their own post | | |
| AC5.1 | Home shows only public posts, newest first | | |
| AC5.2 | Search finds by word | | |
| AC5.3 | Type and category filters | | |
| AC5.4 | No result → message, not an error | | |
| AC6.1 | Post details page | | |
| AC6.2 | Pending post link → 404 for visitors | | |
| AC7.1 | Student sends a claim | | |
| AC7.2 | Own post / second claim refused | | |
| AC8.1 | Accepting a claim → Returned + hand-over message | | |
| AC8.2 | Admin can't decide their own claim | | |
| AC9.1 | My page shows my posts and claims | | |
| AC9.2 | Owner closes a post | | |
| AC10.1 | Admin dashboard tabs with counts | | |
| AC10.2 | `/admin` → 404 for students and visitors | | |
| AC10.3 | Decisions appear in the Log | | |
| AC11.1 | `/api/health` answers ok | | |
| NF1 | No horizontal scroll at 375px | | |
| NF2 | Labels on every input; keyboard only works | | |
| NF3 | A page loads in under 2 s | | |
| NF4 | Security headers present | | |

## Decision

- [ ] **Accepted:** the site does what the client asked.
- [ ] **Accepted with reservations:** list them below.
- [ ] **Not accepted:** list the blocking issues below.

**Signed:** _Aya, for the client_ · **Date:** _____
