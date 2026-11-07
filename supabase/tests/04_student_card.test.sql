-- Tests for 20261122_student_card.sql. Run: npx supabase@2.122.0 test db
begin;
select plan(4);

insert into auth.users (id, email, raw_user_meta_data) values
  ('22222222-2222-2222-2222-222222222222', 'sara@test.local',
   '{"full_name":"Sara B","student_id":"2023-0002"}');
update public.profiles set status = 'approved';

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select isnt(
  public.create_post('found', 'student_card', 'Student card, Sara B.',
                     'Found a student card near the library entrance', 'Library', current_date),
  null, 'a student_card post can be created');
select throws_ok(
  $$ select public.create_post('found', 'weapons', 'Something', 'Not a real category here',
                               'Library', current_date) $$,
  '22023', 'invalid_input', 'unknown categories are still refused');

reset role;
select is((select count(*)::int from public.posts where category = 'student_card'), 1,
  'the post is stored with the new category');

-- The old categories still work (nothing else changed).
set local role authenticated;
select isnt(
  public.create_post('lost', 'keys', 'Lost keys', 'Blue keychain near the door', 'Library',
                     current_date),
  null, 'the old categories still work');

select * from finish();
rollback;
