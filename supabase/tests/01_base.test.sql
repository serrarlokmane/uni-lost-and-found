-- Tests for SQL 1 (20261110_base.sql). Run: npx supabase@2.122.0 test db
-- Each test acts as a role: anon (visitor) or authenticated with a given user id (request.jwt.claims).
begin;
select plan(26);

-- Test users (inserted as postgres, like Supabase Auth would). The trigger creates their profiles.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'pending@test.local',
   '{"full_name":"Pending Pat","student_id":"2023-0001"}'),
  ('22222222-2222-2222-2222-222222222222', 'sara@test.local',
   '{"full_name":"Sara B","student_id":"2023-0002","role":"admin","status":"approved"}'),
  ('33333333-3333-3333-3333-333333333333', 'karim@test.local',
   '{"full_name":"Karim M","student_id":"2023-0003"}');

-- ---- sign-up trigger -------------------------------------------------------
select results_eq(
  $$ select role, status, student_id from public.profiles
      where id = '22222222-2222-2222-2222-222222222222' $$,
  $$ values ('student'::text, 'pending'::text, '2023-0002'::text) $$,
  'sign-up ignores role/status in metadata: always student + pending');

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('99999999-9999-9999-9999-999999999999', 'bad@test.local',
      '{"full_name":"Bad","student_id":"<script>"}') $$,
  '23514', null, 'a student ID with bad characters is refused');

-- Approve Sara and Karim (as postgres: in the app only an admin can do this, tested in SQL 2).
update public.profiles set status = 'approved'
 where id in ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');

-- ---- visitor (anon) --------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '', true);

select throws_ok($$ select count(*) from public.profiles $$, '42501', null,
  'visitor cannot read profiles at all');
select throws_ok(
  $$ insert into public.posts (owner_id, type, category, title, description, location, happened_on)
     values ('22222222-2222-2222-2222-222222222222', 'lost', 'keys', 'xxx', 'xxxxxxxxxx', 'xx',
             current_date) $$,
  '42501', null, 'visitor cannot insert a post directly');
select throws_ok(
  $$ select public.create_post('lost', 'keys', 'Lost keys', 'Blue keychain near the door',
                               'Library', current_date) $$,
  '42501', null, 'visitor cannot call create_post');
select is(public.is_admin(), false, 'is_admin() is false for a visitor (not null)');

-- ---- pending student -------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select throws_ok(
  $$ select public.create_post('lost', 'keys', 'Lost keys', 'Blue keychain near the door',
                               'Library', current_date) $$,
  '42501', 'not_approved', 'a pending student cannot create a post');

-- ---- approved student (Sara) -----------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select is((select count(*)::int from public.profiles), 1, 'a student reads only their own profile');
select throws_ok($$ update public.profiles set role = 'admin' $$, '42501', null,
  'a student cannot update profiles (no self-promotion to admin)');
select throws_ok($$ delete from public.posts $$, '42501', null,
  'a student cannot delete posts directly');
select is(public.is_admin(), false, 'a student is not an admin');

select isnt(
  public.create_post('lost', 'electronics', 'White earbuds case', 'White case, small scratch on top',
                     'Library, 2nd floor', current_date),
  null, 'an approved student can create a post');

select results_eq(
  $$ select status, is_mine from public.get_post(
       (select id from public.my_posts() limit 1)) $$,
  $$ values ('pending'::text, true) $$,
  'the owner sees their own pending post, marked as theirs');

select is((select count(*)::int from public.posts), 0,
  'the pending post is NOT in the public table view, even for its owner');
select throws_ok($$ select owner_id from public.posts $$, '42501', null,
  'nobody can read posts.owner_id directly (who wrote a post stays hidden)');

select throws_ok(
  $$ select public.create_post('lost', 'keys', 'Keys', 'Blue keychain near the door',
                               'Library', current_date + 1) $$,
  '22023', 'invalid_input', 'a date in the future is refused');
select throws_ok(
  $$ select public.create_post('lost', 'keys', 'Ke', 'Blue keychain near the door',
                               'Library', current_date) $$,
  '22023', 'invalid_input', 'a title shorter than 3 characters is refused');
select throws_ok(
  $$ select public.create_post('lost', 'weapons', 'My card', 'Blue keychain near the door',
                               'Library', current_date) $$,
  '22023', 'invalid_input', 'an unknown category is refused');

select throws_ok($$ select public.close_post((select id from public.my_posts() limit 1)) $$,
  'P0002', 'not_found', 'a pending post cannot be closed');

-- 4 more posts = 5 today; the 6th is refused.
select is(
  (select count(*)::int from (
     select public.create_post('found', 'keys', 'Keys ' || n, 'Found near the main entrance door',
                               'Entrance', current_date)
       from generate_series(1, 4) as n) s),
  4, 'the same student creates 4 more posts (5 today)');
select throws_ok(
  $$ select public.create_post('found', 'keys', 'Keys 6', 'Found near the main entrance door',
                               'Entrance', current_date) $$,
  'P0001', 'rate_limited', 'the 6th post in one day is refused');

-- ---- publish one post (as postgres; admin review is tested in SQL 2) -------
reset role;
update public.posts set status = 'published' where title = 'White earbuds case';

-- Visitor now sees exactly that one post.
set local role anon;
select set_config('request.jwt.claims', '', true);
select is((select count(*)::int from public.posts), 1, 'a visitor sees only the published post');
select is((select is_mine from public.get_post(
             (select id from public.posts where title = 'White earbuds case'))),
          false, 'is_mine is false for a visitor');

-- Another student (Karim) cannot close Sara's post.
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select throws_ok(
  $$ select public.close_post((select id from public.posts where title = 'White earbuds case')) $$,
  'P0002', 'not_found', 'a student cannot close someone else''s post');

-- Sara closes her own published post.
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select lives_ok(
  $$ select public.close_post((select id from public.posts where title = 'White earbuds case')) $$,
  'the owner can close their published post');
select is((select status from public.posts where title = 'White earbuds case'), 'resolved',
  'a closed post is resolved');

select * from finish();
rollback;
