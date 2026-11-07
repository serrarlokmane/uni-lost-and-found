# Security test plan

**Owner:** Aya · Based on `PROJECT.md` §5 ("Who sees what") and §11. Results go in `docs/tests/security-report.md` (round 1: Fri Nov 20, round 2: Sun Nov 22, on the live URL).

## Test accounts

Make 4 accounts on the live site (no real names): **Visitor** (not logged in), **Pending** (signed up, not approved), **Student A** and **Student B** (approved), **Admin**. Write the post numbers you use in the "Notes" column.

## 1. Authorization: who can see and do what

| # | As | Try | Expected | Result | Notes |
|---|---|---|---|---|---|
| A1 | Visitor | Open `/` | Only published and returned posts | | |
| A2 | Visitor | Open the link of a **pending** post (copy it from Student A's My page) | 404 page | | |
| A3 | Visitor | Open `/new`, `/me`, `/admin` | `/new` and `/me` → login page; `/admin` → 404 | | |
| A4 | Visitor | Open a post page | No claim form; no author name, student ID or email anywhere | | |
| A5 | Pending | Log in | Sent to `/pending` "waiting for approval" | | |
| A6 | Pending | Type `/new`, `/me`, `/admin` in the address bar | `/pending` or 404, never the page | | |
| A7 | Student A | Open `/admin` | 404, and no "Admin" link in the header | | |
| A8 | Student A | Open Student B's pending post link | 404 | | |
| A9 | Student A | Claim their **own** post | Refused | | |
| A10 | Student A | Claim the same post twice | Second claim refused ("already claimed") | | |
| A11 | Student A | Close Student B's post (change the post id in a request) | Refused | | |
| A12 | Student A | Create a 6th post in one day | Refused (daily limit) | | |
| A13 | Admin | Approve their **own** post or claim | Refused | | |
| A14 | Admin | Ban Student B | B sees "Your account is blocked"; B's posts disappear from `/` | | |
| A15 | Anyone | Sign up with `"role":"admin"` added to the request (DevTools → Network → edit and resend) | The account is still a pending student | | |

## 2. Direct database access with the public key

The publishable key is not secret, so an attacker can call Supabase directly. Use the URL and key from the site's `.env.example` format (ask Lokmane, never post the key in the group).

| # | Try | Expected | Result |
|---|---|---|---|
| D1 | `GET /rest/v1/profiles` without login | Empty list or error, never names or student IDs | |
| D2 | `GET /rest/v1/posts?select=owner_id` | Error: permission denied for the column | |
| D3 | `POST /rest/v1/posts` with a JSON body | Error: permission denied | |
| D4 | `GET /rest/v1/claims` and `/rest/v1/admin_log` | Empty or error | |
| D5 | `POST /rest/v1/rpc/admin_review_user` as Student A | Error `forbidden` | |

## 3. Input attacks: try each string in each field

**Strings:**

| Id | String | Attack |
|---|---|---|
| X1 | `<script>alert(1)</script>` | XSS |
| X2 | `<img src=x onerror=alert(1)>` | XSS |
| X3 | `"><svg onload=alert(1)>` | XSS (breaking out of an attribute) |
| S1 | `' OR '1'='1` | SQL injection |
| S2 | `'; DROP TABLE posts; --` | SQL injection |
| S3 | `%` and `_` (search box only) | Wildcard abuse: must match only those characters |
| L1 | 2,000 × `a` | Too long: must be refused |

**Fields:**

| Form | Field | Limit | X1 | X2 | X3 | S1 | S2 | L1 |
|---|---|---|---|---|---|---|---|---|
| Sign up | Full name | 2–80 | | | | | | |
| Sign up | Student ID | 4–20, letters/digits/`-` | | | | | | |
| Sign up | Email | email format | | | | | | |
| New post | Title | 3–80 | | | | | | |
| New post | Description | 10–1000 | | | | | | |
| New post | Location | 2–80 | | | | | | |
| Claim | Message | 10–1000 | | | | | | |
| Admin | Reject reason | 3–200 | | | | | | |
| Home | Search box (+ S3) | 100 | | | | | | |

**Pass** = the text is shown as plain text (no popup), or the form refuses it with a message. **Fail** = a popup, a database error, or data from other users.

## 4. Session and headers

| # | Try | Expected | Result |
|---|---|---|---|
| H1 | `curl -I https://lqito-lokmane3.vercel.app/` | `content-security-policy`, `strict-transport-security`, `x-frame-options: DENY`, `x-content-type-options: nosniff` | |
| H2 | DevTools → Application → Cookies after login | The `sb-…` cookie has **HttpOnly** and **Secure** | |
| H3 | In the console: `document.cookie` | The session cookie is **not** shown | |
| H4 | Put the site in an `<iframe>` on another page | Refused (X-Frame-Options / CSP) | |
| H5 | Log out, then press Back and reload | Not logged in any more | |

## Every failure

Open a GitHub issue for Lokmane: steps, expected, actual, a screenshot, label `security`.
