-- Student Card category (the live change at the presentation, PROJECT.md §17 step 5).
-- Applied IN ADVANCE: the database accepts 'student_card' before the app offers it.
-- Safe: the old app never sends this value, so nothing changes until the code PR is merged.

alter table public.posts drop constraint posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('electronics', 'keys', 'bags', 'clothing', 'documents', 'other',
                      'student_card'));
