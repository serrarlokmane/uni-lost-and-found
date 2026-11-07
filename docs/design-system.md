# Design System — Lqito (University Lost & Found)

**Owner:** Lokmane (builds it). **Reviewer:** Anfel (checks it against the scope); Aya tests it.
**Direction: "Tag".** Every post looks like the paper tag a Lost & Found office ties to an item: a coloured stub with a punched hole, a dashed tear line, and a reference number. The rest of the page stays quiet so the tags are the one memorable thing.
**Why:** the site is a tool students use in 30 seconds on a phone. The tag tells them at a glance *lost or found*, and the reference number is what they say at the office ("I'm here for No. 142").

Mockup of the three directions we compared (A was chosen, with C's fonts): https://claude.ai/artifact/1tg2V3m8FM7EneSyLKBjWF (private: ask Lokmane for access).

## 1. Colors (CSS variables)

They live in `src/app/globals.css`. Components use the variables only, never raw hex codes.
Every pair below was checked with the WCAG formula. **Text pairs are all ≥ 4.5:1** and UI borders / focus ring are ≥ 3:1, in light and dark mode.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--color-bg` | `#F3F4F1` | `#10141F` | Page background |
| `--color-fg` | `#1B2440` | `#E6E8EE` | Main text (ink indigo) |
| `--color-card` | `#FFFFFF` | `#181E2C` | Cards, inputs, header |
| `--color-muted-fg` | `#545B6B` | `#A3AAB8` | Dates, places, helper text |
| `--color-border` | `#D5D8DE` | `#2C3446` | Card and header borders (decorative) |
| `--color-input-border` | `#7C8294` | `#737C91` | Input and chip borders (3:1 UI contrast) |
| `--color-primary` | `#1B2440` | `#C9D3F5` | Primary buttons, selected chip |
| `--color-on-primary` | `#FFFFFF` | `#10141F` | Text on primary |
| `--color-link` | `#2B4CC2` | `#9DB1F5` | Links in text |
| `--color-lost` | `#B4410E` | `#F5A06E` | "Lost" words on white/card |
| `--color-lost-tag` | `#EDCF7E` | `#4A3B12` | Stub of a Lost tag (manila); text on it is `--color-fg` |
| `--color-found` | `#1A6443` | `#6FD69A` | "Found" words, "Returned" badge, success messages |
| `--color-found-tag` | `#CFE6D8` | `#173B2B` | Stub of a Found tag; text on it is `--color-found` |
| `--color-error` | `#B91C1C` | `#F98B8B` | Field errors, error summary |
| `--color-ring` | `#2B4CC2` | `#9DB1F5` | Keyboard focus outline |

Checked ratios (light / dark): fg on bg 13.9 / 15.0 · muted on card 6.8 / 7.1 · on-primary 15.3 / 12.4 · link 7.2 / 8.0 · lost 5.7 / 8.0 · found 7.1 / 9.3 · fg on lost-tag 10.1 / 8.9 · found on found-tag 5.4 / 6.9 · error 6.5 / 7.2 · input border 3.8 / 4.0 · ring 6.5 / 8.8.

**Never use color alone.** A tag always says the word "Lost" or "Found". A resolved post shows a "Returned" badge with a check icon, not only green.

## 2. Typography

- **Headings:** Lexend 600. **Body:** Source Sans 3 400/600. Both were designed for readability.
- Load them with **`next/font/google`**, not a `<link>` to Google Fonts. next/font downloads the fonts at build time and serves them from our own domain, so our CSP (`font-src 'self'`) keeps working and no student IP addresses are sent to Google.

| Role | Font | Size / line-height |
|---|---|---|
| Page title (`h1`) | Lexend 600 | 28px / 1.15, letter-spacing -0.01em |
| Section title (`h2`) | Lexend 600 | 20px / 1.3 |
| Post title on a tag | Lexend 600 | 18px / 1.3 |
| Tag word ("Lost", "Found") | Lexend 600 | 17px |
| Body | Source Sans 3 400 | 16px / 1.5 (never smaller than 14px) |
| Labels, buttons | Source Sans 3 600 | 16px |
| Meta (place, date, helper) | Source Sans 3 400 | 14px / 1.4 |

Sentence case everywhere ("New post", not "NEW POST"). No all-caps labels.

## 3. Spacing and layout

- Spacing scale: 4, 8, 12, 16, 24, 32, 48px (`--space-1` … `--space-7`). Use only these.
- Radius: `--radius` 8px for buttons and inputs, `--radius-card` 10px for tags and panels, `999px` for chips and badges.
- One column, `max-width: 760px`, centered, `padding: 16px` on the sides. **Mobile first**: design for a 375px phone, then check 768px and 1440px.
- On wider screens the post list stays one column (tags are easier to scan in a list than a grid).
- No horizontal scroll at 375px. Long words wrap (`overflow-wrap: anywhere`).
- Never disable zoom in the viewport meta.

## 4. Components

**Header:** white (`--color-card`) bar with a bottom border. Left: tag logo + "Lqito" (links to `/`). Right: "Log in" or "My page" (text link), "Admin" (admins only), then the primary "New post" button with a Plus icon. At 375px all of it fits on one row; "New post" can shrink to its icon with `aria-label="New post"` only below 360px.

**Search bar:** label "Search posts" above a full-width input, and a square Search button (icon, `aria-label="Search"`). It is a GET form, so `?q=` sits in the URL and the back button works.

**Filters:** chips "All", "Lost", "Found" (`aria-pressed`, selected = primary fill) and a "Category" `<select>`. They are links/GET params, so they work without JavaScript.

**Post tag (the card):** the same component on every list (home, My page, admin).
```
┌────────┬──────────────────────────────┐
│  (o)   │ Electronics                  │
│  Lost  │ White earbuds case           │
│ No.142 │ ⌖ Library, 2nd floor  ▦ 6 Nov │
└────────┴──────────────────────────────┘
  stub ┆ dashed tear line
```
- **Stub** (76px wide): `--color-lost-tag` or `--color-found-tag`, a 12px punched hole (circle filled with `--color-bg`), the word "Lost"/"Found", and `No. <ref>`. Right edge: `2px dashed`.
- **Body:** category (muted, 600), title (Lexend 18px), then place and date with MapPin and Calendar icons (no `·` separators).
- The whole tag is one link to `/posts/[id]` with the title as its accessible name.
- **Status:** on My page and admin lists a status badge sits next to the category: `Pending`, `Published`, `Rejected`, `Returned`.
- **Resolved:** opacity 0.72, a "Returned" badge with a Check icon, and the claim button is hidden.

**Post details page:** a big tag at the top (stub 96px, title as `h1`), then the description, then the action box: claim form for students, "Close post" for the owner, or a "Log in to claim it" link for visitors.

**Badges:** small pill with a 1.5px border and text in the same color (`--color-found` for Returned/Published, `--color-lost` for Rejected, `--color-muted-fg` for Pending). They always carry text.

**Buttons:** at least **44×44px**. Primary = `--color-primary` fill. Secondary = card background + `--color-input-border` border. Destructive actions (Reject, Ban, Close post) are secondary buttons with a clear verb, and ask for confirmation. Buttons show a loading state ("Publishing…") and are disabled while submitting to stop double submits.

**Admin dashboard:** tabs Accounts · Posts · Claims · Log, each tab shows a count of pending items ("Accounts 3"). Tabs are links (`?tab=accounts`) with `aria-current="page"`. On phones each row becomes a stacked panel (name, student ID, date, then the buttons in a row); from 768px it is a table. Reject opens a small inline form asking for the reason.

**Icons:** SVG icons from `lucide-react` (MapPin, Calendar, Search, Plus, Check, X, Shield, ChevronDown). **No emoji as icons.** Decorative icons get `aria-hidden="true"`; icon-only buttons get `aria-label`.

## 5. Forms (Sign-up, Login, New post, Claim)

- Every input has a **visible `<label>`**. Placeholders are examples only, never the label.
- Inputs: 48px high, `--color-input-border`, `--radius` 8px, card background.
- Show errors **under the field** that has the problem, in `--color-error`, linked with `aria-describedby`. Example: `<input aria-describedby="title-error">` with `<p id="title-error">At least 3 characters</p>`. The field also gets `aria-invalid="true"`.
- If the submit fails, show a short summary at the top with `role="alert"` and move focus to it.
- Use the same min/max lengths in HTML attributes and in zod. The browser check helps the user; the server check is the security.
- Student ID helper text: *"Only admins see this. It is used to check you are a student."*
- Claim message helper text: *"Describe something only the owner would know (color, sticker, lock screen)."*
- New post "Type" is two big radio cards that look like the two tag stubs (Lost / Found).
- After a post is created: *"Your post was sent. An admin will check it soon."* (green success box, `role="status"`).

## 6. States

- **Empty list:** "No posts yet. Lost something? Create the first post." plus the New post button.
- **No search results:** "No posts match 'phone'. Try fewer words or check the spelling." plus a "Clear search" link.
- **Load error:** "Could not load posts. Try again in a minute." Never show database error text (security: no internal details).
- **Not allowed / not found:** one 404 page for a missing post, a pending post and `/admin` opened by a student, so the site leaks nothing. It shows an empty tag with "No. 404" and "We couldn't find this page." plus a link home.
- **Pending account:** "Your account is waiting for approval. An admin checks student IDs every day."
- **Banned account:** "Your account is blocked. Contact the Lost & Found office."
- **Claim accepted (My page):** "Good news: go to the Lost & Found office with your student card and say No. 142."

## 7. Motion

Keep it minimal. Hover and focus transitions are 150ms. No scroll animations, no animation library.
Wrap any transition in `@media (prefers-reduced-motion: no-preference)`.

## 8. Accessibility checklist (Aya tests this in Week 2)

- [ ] Every page can be used with the keyboard only (Tab, Enter, Space).
- [ ] The focus ring is always visible (`outline: 2px solid var(--color-ring)`, offset 2px). Never `outline: none` without a replacement.
- [ ] `<html lang="en">`, one `<h1>` per page, and headings in order.
- [ ] Every input has a label, and errors are read by a screen reader (VoiceOver: Cmd+F5 on Mac).
- [ ] Contrast passes in light AND dark mode (check DevTools → Rendering → emulate dark).
- [ ] Works at 375px width with no horizontal scroll, and at 200% zoom.
- [ ] Lighthouse Accessibility score ≥ 95 (Chrome DevTools → Lighthouse).

**AI prompt if stuck:** "Here is my React component: [paste]. Check it against these rules: visible labels, errors linked with aria-describedby, 44px touch targets, visible focus ring, no emoji icons. Tell me what to fix."
