## What

<!-- One or two lines: what this PR changes. -->

Closes #

## How to test

1.
2.

## Security checklist

- [ ] No secret, key or personal email in the code, the docs or the commit messages (the repo is public)
- [ ] No `sb_secret_...` or `service_role` key used anywhere
- [ ] Input is checked with zod on the server
- [ ] No `dangerouslySetInnerHTML`; no SQL or filter strings built from input
- [ ] Admin-only actions are checked on the server (page, Server Action and SQL)
- [ ] **SQL PRs only:** RLS on every new table, SELECT policies only, no write grants for `anon`/`authenticated`, every function has `set search_path = ''` and checks `auth.uid()`, the role never comes from `user_metadata`
- [ ] **Workflow PRs only:** actions pinned to a commit SHA, `permissions:` as small as possible

## Checks

- [ ] `npm run format:check`, `npm run lint`, `npm test` and `npm run build` pass locally
- [ ] One row added to "My work log" in my task file
