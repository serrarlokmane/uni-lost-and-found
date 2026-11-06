# Design System — Lqito (University Lost & Found)

**Owner:** Lokmane (builds it). **Reviewer:** Anfel (checks it against the scope); Aya tests it.
**Style:** minimal and functional (Swiss style). Content first, no decoration. The site is a tool students use in 30 seconds on their phone.

## 1. Colors (CSS variables)

Put these in `src/app/globals.css`. Components use the variables only, never raw hex codes.
Every text/background pair below was checked: **all pass WCAG AA (4.5:1) in both light and dark mode.**

```css
:root {
  --color-bg: #F8FAFC;
  --color-fg: #0F172A;
  --color-card: #FFFFFF;
  --color-muted-fg: #475569;   /* dates, helper text */
  --color-border: #CBD5E1;
  --color-primary: #1E3A5F;    /* buttons, header: university navy */
  --color-on-primary: #FFFFFF;
  --color-link: #2563EB;
  --color-lost: #A16207;       /* "Lost" badge (amber) */
  --color-found: #15803D;      /* "Found" badge + resolved state (green) */
  --color-error: #DC2626;
  --color-ring: #2563EB;       /* keyboard focus outline */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0B1220;
    --color-fg: #E2E8F0;
    --color-card: #131C2E;
    --color-muted-fg: #94A3B8;
    --color-border: #26324A;
    --color-primary: #93C5FD;
    --color-on-primary: #0B1220;
    --color-link: #93C5FD;
    --color-lost: #FBBF24;
    --color-found: #4ADE80;
    --color-error: #F87171;
    --color-ring: #93C5FD;
  }
}
```

**Never use color alone.** A "Lost" badge says the word "Lost", not only amber. A resolved post shows "✓ Found" text, not only green.

## 2. Typography

- **Headings:** Lexend 600. **Body:** Source Sans 3 400/600. Both were designed for readability.
- Load them with **`next/font/google`**, not a `<link>` to Google Fonts. next/font downloads the fonts at build time and serves them from our own domain, so our CSP (`font-src 'self'`) keeps working and no student IP addresses are sent to Google.
- Sizes: body **16px** (never smaller than 14px), line-height 1.5. Title of a post 18px/600. Page title 24px.

## 3. Spacing and layout

- Spacing scale: 4, 8, 12, 16, 24, 32, 48px. Use only these.
- One column, `max-width: 760px`, centered, `padding: 16px` on the sides. **Mobile first**: design for a 375px phone, then check 768px and 1440px.
- No horizontal scroll at 375px. Long words in descriptions wrap (`overflow-wrap: anywhere`).
- Never disable zoom in the viewport meta.

## 4. Components

**Header:** site name (links to `/`) on the left; on the right the primary button "New post", then "My page" (or "Log in"), and "Admin" for admins only.

**Search bar:** a full-width input with a visible label ("Search posts", can be visually hidden but must exist) and a Search button. It uses a GET form, so `?q=` sits in the URL and the back button works.

**Post card:**
- Top row: type badge (Lost / Found), category badge, and a "✓ Found" badge if resolved.
- Title, then description, then a muted line with location · date, and a status badge (`Pending`, `Published`, `Rejected`, `Resolved`).
- Resolved posts: lower opacity (0.7), and the "This is mine / I found it" claim button is hidden.
- Use the same card on every screen.

**Badges:** small rounded pill with a 1px border in the badge color and text in the same color. They always carry text.

**Buttons:** at least **44×44px** touch target. They show a loading state while submitting ("Publishing…") and are disabled during it to stop double submits.

**Icons:** use **SVG icons from `lucide-react`** (MapPin, Calendar, Search, Plus, Check, X, Shield). **No emoji as icons.** Decorative icons get `aria-hidden="true"`.

## 5. Forms (Sign-up, Login, New post, Claim)

- Every input has a **visible `<label>`**. Placeholders are examples only, never the label.
- Show errors **under the field** that has the problem, in `--color-error`, linked with `aria-describedby`. Example: `<input aria-describedby="title-error">` with `<p id="title-error">At least 3 characters</p>`.
- If the submit fails, show a short summary at the top with `role="alert"` and move focus to it.
- Use the same min/max lengths in HTML attributes and in zod. The browser check helps the user; the server check is the security.
- Student ID field helper text: *"Only admins see this. It is used to check you are a student."*
- Claim message helper text: *"Describe something only the owner would know (color, sticker, lock screen)."*
- After a post is created, show a success message: *"Your post was sent. An admin will check it soon."*
- Admin dashboard: one table per tab, Approve (primary) and Reject (secondary, asks for a reason) on each row.

## 6. States

- **Empty list:** "No posts yet. Lost something? Create the first post." plus the New post button.
- **No search results:** "No posts match 'phone'. Try fewer words or check the spelling." plus a "Clear search" link.
- **Load error:** "Could not load posts. Try again in a minute." Never show database error text (security: no internal details).
- **Not allowed / not found:** show the same 404 page for a missing post, a pending post and `/admin` opened by a student, so the site leaks nothing.
- **Pending account:** "Your account is waiting for approval. An admin checks student IDs every day."

## 7. Motion

Keep it minimal. Hover and focus transitions are 150–200ms. No scroll animations, no animation library.
Wrap any transition in `@media (prefers-reduced-motion: no-preference)`.

## 8. Accessibility checklist (Aya tests this in Week 2)

- [ ] Every page can be used with the keyboard only (Tab, Enter, Space).
- [ ] The focus ring is always visible (`outline: 2px solid var(--color-ring)`). Never `outline: none` without a replacement.
- [ ] `<html lang="en">`, one `<h1>` per page, and headings in order.
- [ ] Every input has a label, and errors are read by a screen reader (VoiceOver: Cmd+F5 on Mac).
- [ ] Contrast passes in light AND dark mode (check DevTools → Rendering → emulate dark).
- [ ] Works at 375px width with no horizontal scroll, and at 200% zoom.
- [ ] Lighthouse Accessibility score ≥ 95 (Chrome DevTools → Lighthouse).

**AI prompt if stuck:** "Here is my React component: [paste]. Check it against these rules: visible labels, errors linked with aria-describedby, 44px touch targets, visible focus ring, no emoji icons. Tell me what to fix."
