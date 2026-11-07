# Scope and acceptance criteria — v1

**Owner:** Younes · Source: `PROJECT.md` §6 (features), §7 (journeys), §9 (business rules). Aya marks each criterion pass/fail in `docs/acceptance.md`.

## Must (v1, needed for the presentation)

| # | Feature | Status (Sat Nov 7) |
|---|---|---|
| F1 | Sign up (email, password, full name, student ID), log in, log out | Built, merged in #41 |
| F2 | Account approval by an admin; ban a user | Built, merged in #41 |
| F3 | Create a post | Built, merged in #41 |
| F4 | Post review by an admin (publish / reject with a reason) | Built, merged in #41 |
| F5 | Home page: published posts, newest first, search, filters | Built, merged in #41 |
| F6 | Post details page | Built, merged in #41 |
| F7 | Claims: "This is mine" / "I found it" with a message | Built, merged in #41 |
| F8 | Claim decision by an admin; hand-over instructions | Built, merged in #41 |
| F9 | My page: my posts, my claims, close my post | Built, merged in #41 |
| F10 | Admin dashboard: Accounts, Posts, Claims, Log, pending counts | Built, merged in #41 |
| F11 | Health check `/api/health` | Built, merged in #5 |
| — | Student Card category (live change at the presentation) | Migration applied; code in draft PR #37 |

## Could (v2: only after v1 is done, and only if Anfel approves)

Photos on posts · email notifications · password reset by email · "Report this post" button · auto-hide posts older than 30 days · suggested matches · statistics page · Arabic / French interface.

## Won't (out of scope)

Chat between students · mobile app · payments or rewards · login with Google.

## Categories (v1)

`electronics`, `keys`, `bags`, `clothing`, `documents`, `other`. `student_card` is added live at the presentation.

---

## Acceptance criteria (Given / When / Then)

### F1: Sign up, log in, log out
- **AC1.1** Given a visitor on `/signup`, when they enter a valid email, a password (8+ characters), a full name and a student ID, then the account is created as **pending** and they see "waiting for approval".
- **AC1.2** Given a visitor, when they sign up with an email or student ID that is already used, then they see an error and no second account is created.
- **AC1.3** Given a pending, rejected or banned user, when they log in, then they are sent to `/pending` and see their status, and nothing else.
- **AC1.4** Given an approved student, when they log in, then they reach the home page with "My page" in the header; when they log out, then the header shows "Log in" again.
- **AC1.5** Given anyone who signs up, when they add `"role":"admin"` to the request, then the account is still a **student**.

### F2: Account approval and ban
- **AC2.1** Given an admin on the Accounts tab, when they click Approve on a pending account, then the student can log in and use the site.
- **AC2.2** Given an admin, when they reject a pending account, then that user only sees their status after login.
- **AC2.3** Given an approved student, when an admin bans them, then their posts are hidden and they see "Your account is blocked".

### F3: Create a post
- **AC3.1** Given an approved student on `/new`, when they fill type, category, title, description, location and date, then the post is saved as **pending** and they see "Sent. An admin will check it soon."
- **AC3.2** Given a student, when a field is empty, too long or the date is in the future, then they see a message under that field and nothing is saved.
- **AC3.3** Given a student who already posted 5 times today, when they post again, then they see the daily-limit message.
- **AC3.4** Given a visitor or a pending user, when they open `/new`, then they are sent to log in or to `/pending`.

### F4: Post review
- **AC4.1** Given an admin on the Posts tab, when they publish a pending post, then it appears on the home page.
- **AC4.2** Given an admin, when they reject a post with a reason (3–200 characters), then the owner sees the reason on My page, and the post is not public.
- **AC4.3** Given an admin, when the post is their own, then they can't publish or reject it.

### F5: Home page, search, filters
- **AC5.1** Given anyone on `/`, then they see only published and resolved posts, newest first.
- **AC5.2** Given anyone, when they search "earbuds", then only posts with that word in the title, description or location are shown.
- **AC5.3** Given anyone, when they choose Lost or Found or a category, then only matching posts are shown.
- **AC5.4** Given a search with no result, then they see a "no posts found" message, not an error.

### F6: Post details
- **AC6.1** Given anyone, when they open a published post, then they see type, category, title, description, location, date and the post number.
- **AC6.2** Given a visitor, when they open a pending or rejected post's link, then they get the 404 page.

### F7: Claims
- **AC7.1** Given an approved student on someone else's published post, when they send a claim with a message (10+ characters), then the claim is saved as pending.
- **AC7.2** Given a student, when they try to claim their own post or the same post twice, then it is refused with a clear message.

### F8: Claim decision
- **AC8.1** Given an admin on the Claims tab, when they accept a claim, then the post becomes **Returned**, the other pending claims on it are rejected, and the claimant sees the hand-over message with the post number.
- **AC8.2** Given an admin, when the claim is their own or on their own post, then they can't decide it.

### F9: My page
- **AC9.1** Given an approved student on `/me`, then they see all their posts and claims with a status badge.
- **AC9.2** Given the owner of a published post, when they click "Close post" and confirm, then the post becomes Returned.

### F10: Admin dashboard
- **AC10.1** Given an admin, then `/admin` shows the tabs Accounts, Posts, Claims and Log with pending counts.
- **AC10.2** Given a student or a visitor, when they open `/admin`, then they get the 404 page and the header has no Admin link.
- **AC10.3** Given an admin decision, then it appears in the Log tab with the admin's name and the time.

### F11: Health check
- **AC11.1** Given the live site, when anyone opens `/api/health`, then it answers `{"status":"ok"}`.

### Non-functional
- **NF1** On a 375px phone screen there is no horizontal scroll.
- **NF2** Every input has a label, and the site works with the keyboard only.
- **NF3** A page loads in under 2 seconds.
- **NF4** The response headers include a CSP, HSTS, `X-Frame-Options: DENY` and `nosniff`.
