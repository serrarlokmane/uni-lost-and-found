-- Tests for SQL 2 (20261111_search_admin.sql). Run: npx supabase@2.122.0 test db
begin;
select plan(27);

-- Users: pending Pat, students Sara and Karim, admin Adam.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'pat@test.local',
   '{"full_name":"Pending Pat","student_id":"2023-0001"}'),
  ('22222222-2222-2222-2222-222222222222', 'sara@test.local',
   '{"full_name":"Sara B","student_id":"2023-0002"}'),
  ('33333333-3333-3333-3333-333333333333', 'karim@test.local',
   '{"full_name":"Karim M","student_id":"2023-0003"}'),
  ('44444444-4444-4444-4444-444444444444', 'adam@test.local',
   '{"full_name":"Adam Admin","student_id":"STAFF-01"}');
update public.profiles set status = 'approved'
 where id <> '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'admin' where id = '44444444-4444-4444-4444-444444444444';

-- Posts (inserted as postgres for the setup).
insert into public.posts (id, owner_id, type, category, title, description, location, happened_on,
                          status) values
  ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'lost',
   'electronics', 'White earbuds case', 'White case with a small scratch', 'Library', current_date,
   'pending'),
  ('a0000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'found', 'keys',
   'Keys with a red keychain', 'Three keys and a 100% red keychain', 'Cafeteria', current_date,
   'published'),
  ('a0000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'found', 'bags',
   'Black backpack', 'Black backpack with a math book', 'Amphi B', current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'found',
   'clothing', 'Blue scarf', 'A blue wool scarf, folded', 'Gym', current_date, 'published');

-- ---- search (visitor) ------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '', true);

select is((select count(*)::int from public.search_posts()), 2,
  'search with no filters returns only the 2 public posts');
select is((select count(*)::int from public.search_posts('earbuds')), 0,
  'a pending post is never found by search');
select is((select title from public.search_posts('KEYCHAIN')), 'Keys with a red keychain',
  'search is case-insensitive and looks in title/description');
select is((select count(*)::int from public.search_posts('gym')), 1, 'search looks in location');
select is((select count(*)::int from public.search_posts('%')), 1,
  'a % typed by the user matches only text with a real % (not all 2 posts)');
select is((select count(*)::int from public.search_posts('1_0%')), 0,
  'escaped _ does not match the "0" in "100%"');
select is((select count(*)::int from public.search_posts('_')), 0,
  'a _ typed by the user is a plain character');
select is((select count(*)::int from public.search_posts(null, 'found', null)), 2,
  'type filter');
select is((select count(*)::int from public.search_posts(null, 'found', 'keys')), 1,
  'type + category filter');
select is((select count(*)::int from public.search_posts('   ')), 2,
  'a blank query means no keyword');

select throws_ok($$ select public.admin_review_user('11111111-1111-1111-1111-111111111111',
                                                   'approved') $$,
  '42501', null, 'a visitor cannot call admin functions');

-- ---- student (Sara) --------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select throws_ok($$ select public.admin_review_user('11111111-1111-1111-1111-111111111111',
                                                   'approved') $$,
  '42501', 'forbidden', 'a student cannot approve accounts');
select throws_ok($$ select public.admin_review_post('a0000000-0000-0000-0000-000000000003',
                                                   'published') $$,
  '42501', 'forbidden', 'a student cannot publish posts');
select throws_ok($$ select * from public.admin_list_users() $$, '42501', 'forbidden',
  'a student cannot list accounts (no student IDs leak)');
select throws_ok($$ select count(*) from public.admin_log $$, '42501', null,
  'a student cannot read the admin log table');

-- ---- admin (Adam) ----------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);

select results_eq(
  $$ select full_name, student_id, email from public.admin_list_users('pending') $$,
  $$ values ('Pending Pat'::text, '2023-0001'::text, 'pat@test.local'::text) $$,
  'the admin lists pending accounts with student ID and email');

select lives_ok($$ select public.admin_review_user('11111111-1111-1111-1111-111111111111',
                                                  'approved') $$,
  'the admin approves a pending account');
select throws_ok($$ select public.admin_review_user('11111111-1111-1111-1111-111111111111',
                                                   'rejected') $$,
  'P0001', 'conflict', 'an approved account cannot then be rejected');
select throws_ok($$ select public.admin_review_user('44444444-4444-4444-4444-444444444444',
                                                   'banned') $$,
  'P0002', 'not_found', 'an admin cannot ban themselves');

select lives_ok($$ select public.admin_review_user('33333333-3333-3333-3333-333333333333',
                                                  'banned') $$,
  'the admin bans Karim');

select throws_ok($$ select public.admin_review_post('a0000000-0000-0000-0000-000000000001',
                                                   'rejected', ' ') $$,
  '22023', 'invalid_input', 'rejecting a post needs a reason');
select lives_ok($$ select public.admin_review_post('a0000000-0000-0000-0000-000000000001',
                                                  'published') $$,
  'the admin publishes Sara''s post');
select throws_ok($$ select public.admin_review_post('a0000000-0000-0000-0000-000000000001',
                                                   'rejected', 'Too late') $$,
  'P0001', 'conflict', 'a post that is not pending cannot be reviewed again');
select throws_ok($$ select public.admin_review_post('a0000000-0000-0000-0000-000000000003',
                                                   'published') $$,
  '42501', 'forbidden', 'an admin cannot publish their own post (conflict of interest)');

select is((select count(*)::int from public.admin_list_log()), 3,
  'every decision is in the log (approve, ban, publish)');

-- ---- results, checked as postgres -----------------------------------------
reset role;
select results_eq(
  $$ select status, reject_reason from public.posts
      where id = 'a0000000-0000-0000-0000-000000000002' $$,
  $$ values ('rejected'::text, 'Account banned'::text) $$,
  'banning Karim hid his published post');
select results_eq(
  $$ select status, reviewed_by from public.posts
      where id = 'a0000000-0000-0000-0000-000000000001' $$,
  $$ values ('published'::text, '44444444-4444-4444-4444-444444444444'::uuid) $$,
  'the published post records who reviewed it');

select * from finish();
rollback;
