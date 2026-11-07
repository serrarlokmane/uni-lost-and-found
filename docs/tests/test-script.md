# Test Script: Lqito (University Lost & Found)

How to use: run each journey on the live URL, step by step. Write Pass or Fail in the last column. Every Fail becomes a GitHub Issue (steps, expected result, actual result) assigned to the file's owner.

Test accounts (no real names): `student-a` (Sara), `student-b` (Karim), `student-c` (Amine), `student-d` (extra claimant), `admin-1`. Use a separate browser profile (or a private window) for each role.

---

## Journey 1: Sara loses her earbuds

**Roles:** Visitor, Pending student, Student, Admin
**Preconditions:** Sara has no account yet. `admin-1` exists.

| # | Role | Step | Expected result | Pass/Fail |
|---|------|------|-----------------|-----------|
| 1.1 | Visitor | Open the home page `/` | Page loads; published posts, search bar and filters are visible | |
| 1.2 | Visitor | Click "Sign up" | The sign-up form opens | |
| 1.3 | Visitor | Submit the form with an empty email | An error message appears; no account is created | |
| 1.4 | Visitor | Sign up with email, password, full name and student ID | Account created; message "Waiting for approval" | |
| 1.5 | Pending student | Try to open `/new` | Blocked; only the "Your account is waiting for approval" message is shown | |
| 1.6 | Admin | Log in and open `/admin`, tab Accounts | Sara appears in the list with Approve / Reject buttons | |
| 1.7 | Admin | Click "Approve" on Sara | Sara disappears from pending; an entry appears in the Log tab | |
| 1.8 | Student | Log in as Sara | She can see "New post" and "My page" | |
| 1.9 | Student | Open `/new`; create a post: Lost, Electronics, "White earbuds case", Library 2nd floor, today's date | Post saved with status Pending; it is NOT on the home page | |
| 1.10 | Student | Submit the post form with an empty title | Error message; nothing saved | |
| 1.11 | Student | Open "My page", tab My posts | The post shows with a Pending badge | |
| 1.12 | Admin | Open `/admin`, tab Posts | Sara's post is listed with Approve / Reject | |
| 1.13 | Admin | Click "Approve" on the post | Post becomes Published; Log updated | |
| 1.14 | Visitor | Open the home page `/` | The earbuds post is visible, newest first | |

---

## Journey 2: Karim found them

**Roles:** Visitor, Student, Admin
**Preconditions:** Journey 1 done; Karim has an approved account.

| # | Role | Step | Expected result | Pass/Fail |
|---|------|------|-----------------|-----------|
| 2.1 | Student | On the home page, type "earbuds" in the search box and search | Sara's post is in the results | |
| 2.2 | Student | Use the filters: Lost, category Electronics | The post is still listed | |
| 2.3 | Student | Open the post (`/posts/[id]`) | Full details are shown; the author's name and student ID are NOT shown | |
| 2.4 | Student | Click "I found it", leave the message empty, send | Error message; no claim created | |
| 2.5 | Student | Write "Found on a table near the window, I gave them to the office." and send | Claim created with status Pending | |
| 2.6 | Student | Send a second claim on the same post | Refused (1 claim per post) | |
| 2.7 | Student | Open "My page", tab My claims | The claim shows with a Pending badge | |
| 2.8 | Admin | Open `/admin`, tab Claims | Karim's claim is listed with its message | |
| 2.9 | Admin | Click "Accept" | Claim Accepted; Sara's post becomes Resolved; Log updated | |
| 2.10 | Student | Log in as Sara, open "My page" | Message "Good news: go to the Lost & Found office with your student card" | |
| 2.11 | Visitor | Open the home page | The post shows as Resolved | |

---

## Journey 3: Amine found keys (two claims)

**Roles:** Student, Admin
**Preconditions:** `student-c`, `student-b` and `student-d` have approved accounts.

| # | Role | Step | Expected result | Pass/Fail |
|---|------|------|-----------------|-----------|
| 3.1 | Student | As Amine, create a post: Found, Keys, "Keys with a red Barça keychain", Cafeteria | Post saved as Pending | |
| 3.2 | Admin | Approve the post | Post is Published | |
| 3.3 | Student | As Amine, open his own post | No claim form is shown (cannot claim own post) | |
| 3.4 | Student | As Karim, click "This is mine" and write "3 keys, a red Barça keychain and a small USB stick" | Claim created, Pending | |
| 3.5 | Student | As `student-d`, click "This is mine" and write "they are mine" | Claim created, Pending | |
| 3.6 | Admin | Open Claims | Both claims are listed | |
| 3.7 | Admin | Accept the detailed claim | Post becomes Resolved; the other claim is automatically Rejected; Log updated | |
| 3.8 | Student | As `student-d`, open "My claims" | The claim shows as Rejected | |
| 3.9 | Student | As Amine, create a post and then click "Close post" on it | Post becomes Resolved/closed | |

---

## Journey 4: Admin rules and edge cases

| # | Role | Step | Expected result | Pass/Fail |
|---|------|------|-----------------|-----------|
| 4.1 | Admin | Create a post as admin, then try to approve it | Refused (admin cannot approve their own post) | |
| 4.2 | Admin | Reject a pending post with a reason | Post Rejected; owner sees the reason in "My page" | |
| 4.3 | Admin | Ban a student account | Account status Banned; the student's posts are hidden | |
| 4.4 | Banned | Log in as the banned student | Only "Your account is blocked" is shown | |
| 4.5 | Student | Create 6 posts in one day | The 6th is refused (limit 5 posts per day) | |
| 4.6 | Any | Open `/api/health` | Returns an OK response | |

---

## Journey 5: Phone (375px)

| # | Role | Step | Expected result | Pass/Fail |
|---|------|------|-----------------|-----------|
| 5.1 | Visitor | Open the home page on a phone (or browser at 375px width) | No horizontal scroll; cards readable | |
| 5.2 | Visitor | Search a post and open its details | Done in under 30 seconds | |
| 5.3 | Student | Use the site with keyboard only (Tab, Enter) | Every button and field can be reached and used | |