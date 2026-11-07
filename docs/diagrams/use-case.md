# Use Case diagram

**Owner:** Anfel · Source: `PROJECT.md` §5 (roles) and §6 (features F1–F11).

A Student can do everything a Visitor can; an Admin is also a logged-in user. Pending and banned users can only log in and see their status.

```mermaid
flowchart LR
  V(["👤 Visitor"])
  P(["👤 Pending / banned user"])
  S(["👤 Student (approved)"])
  A(["👤 Admin"])

  subgraph L["Lqito — University Lost & Found"]
    UC1(["Browse published posts (F5)"])
    UC2(["Search and filter by type and category (F5)"])
    UC3(["Open a post (F6)"])
    UC4(["Sign up with email and student ID (F1)"])
    UC5(["Log in / log out (F1)"])
    UC6(["See 'waiting for approval' or 'blocked' (F1)"])
    UC7(["Create a post (F3)"])
    UC8(["Claim: 'This is mine' / 'I found it' (F7)"])
    UC9(["My page: my posts and my claims (F9)"])
    UC10(["Close my own post (F9)"])
    UC11(["Approve / reject / ban accounts (F2)"])
    UC12(["Publish / reject posts with a reason (F4)"])
    UC13(["Accept / reject claims (F8)"])
    UC14(["Read the admin log (F10)"])
  end

  V --- UC1
  V --- UC2
  V --- UC3
  V --- UC4
  V --- UC5

  P --- UC5
  P --- UC6

  S --- UC1
  S --- UC2
  S --- UC3
  S --- UC5
  S --- UC7
  S --- UC8
  S --- UC9
  S --- UC10

  A --- UC5
  A --- UC11
  A --- UC12
  A --- UC13
  A --- UC14

  UC8 -.->|"«include» hand-over at the office (post No.)"| UC13
  UC7 -.->|"«include» admin review"| UC12
```

## Notes

- **An admin never reviews their own post or claim** (no conflict of interest). This is checked in SQL.
- **The hand-over happens in person** at the Lost & Found office: the student says the post number ("No. 16") and shows their student card.
- **Not in v1:** chat, photos and email notifications (`PROJECT.md` §6, "Could" and "Won't").
