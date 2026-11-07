-- Tests for SQL 3 (20261112_claims.sql). Run: npx supabase@2.122.0 test db
-- Follows the two user journeys in PROJECT.md §7.
begin;
select plan(28);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'pat@test.local',
   '{"full_name":"Pending Pat","student_id":"2023-0001"}'),
  ('22222222-2222-2222-2222-222222222222', 'sara@test.local',
   '{"full_name":"Sara B","student_id":"2023-0002"}'),
  ('33333333-3333-3333-3333-333333333333', 'karim@test.local',
   '{"full_name":"Karim M","student_id":"2023-0003"}'),
  ('44444444-4444-4444-4444-444444444444', 'adam@test.local',
   '{"full_name":"Adam Admin","student_id":"STAFF-01"}'),
  ('55555555-5555-5555-5555-555555555555', 'amine@test.local',
   '{"full_name":"Amine K","student_id":"2023-0005"}'),
  ('66666666-6666-6666-6666-666666666666', 'nora@test.local',
   '{"full_name":"Nora L","student_id":"2023-0006"}');
update public.profiles set status = 'approved'
 where id <> '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'admin' where id = '44444444-4444-4444-4444-444444444444';

insert into public.posts (id, owner_id, type, category, title, description, location, happened_on,
                          status) values
  -- Sara's lost earbuds (published)
  ('b0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'lost',
   'electronics', 'White earbuds case', 'White case with a small scratch', 'Library', current_date,
   'published'),
  -- Amine's found keys (published)
  ('b0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'found', 'keys',
   'Keys with a red keychain', 'Keys found on a cafeteria table', 'Cafeteria', current_date,
   'published'),
  -- a pending post
  ('b0000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'found', 'bags',
   'Black backpack', 'Black backpack with a math book', 'Amphi B', current_date, 'pending'),
  -- the admin's own published post
  ('b0000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'found',
   'clothing', 'Blue scarf', 'A blue wool scarf, folded', 'Gym', current_date, 'published');

-- ---- visitor and pending ---------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '', true);
select throws_ok($$ select public.create_claim('b0000000-0000-0000-0000-000000000001',
                                              'I found it near the window') $$,
  '42501', null, 'a visitor cannot claim');
select throws_ok($$ select count(*) from public.claims $$, '42501', null,
  'a visitor cannot read claims');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select throws_ok($$ select public.create_claim('b0000000-0000-0000-0000-000000000001',
                                              'I found it near the window') $$,
  '42501', 'not_approved', 'a pending student cannot claim');

-- ---- journey 1: Karim found Sara's earbuds ---------------------------------
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select isnt(public.create_claim('b0000000-0000-0000-0000-000000000001',
                                'Found on a table near the window, I gave them to the office.'),
            null, 'Karim sends "I found it" on Sara''s lost post');
select throws_ok($$ select public.create_claim('b0000000-0000-0000-0000-000000000001',
                                              'Second try, same post') $$,
  'P0001', 'already_claimed', 'only 1 claim per post per student');
select throws_ok($$ select public.create_claim('b0000000-0000-0000-0000-000000000003',
                                              'This backpack is mine') $$,
  'P0002', 'not_found', 'a pending post cannot be claimed');
select throws_ok($$ select public.create_claim('b0000000-0000-0000-0000-000000000002', 'short') $$,
  '22023', 'invalid_input', 'a claim message needs at least 10 characters');
select is(public.my_claim_status('b0000000-0000-0000-0000-000000000001'), 'pending',
  'Karim sees his claim is pending');
select is((select count(*)::int from public.my_claims()), 1, 'Karim sees 1 claim in My claims');
select throws_ok($$ select * from public.admin_list_claims() $$, '42501', 'forbidden',
  'a student cannot list all claims');

select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select throws_ok($$ select public.create_claim('b0000000-0000-0000-0000-000000000001',
                                              'This is my own post, testing') $$,
  '42501', 'forbidden', 'a student cannot claim their own post');
select is((select count(*)::int from public.my_claims()), 0,
  'Sara does not see Karim''s claim (claims are private)');

-- Admin accepts Karim's claim -> Sara's post is resolved.
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select results_eq($$ select pending_users, pending_posts, pending_claims from public.admin_counts() $$,
  $$ values (1, 1, 1) $$, 'admin counts: 1 account, 1 post, 1 claim pending');
select lives_ok(
  $$ select public.admin_decide_claim(
       (select id from public.admin_list_claims() where post_ref =
          (select ref from public.posts where id = 'b0000000-0000-0000-0000-000000000001')),
       'accepted') $$,
  'the admin accepts Karim''s claim');
select is((select status from public.get_post('b0000000-0000-0000-0000-000000000001')), 'resolved',
  'accepting the claim resolves Sara''s post');

-- ---- journey 2: two students claim Amine's keys ----------------------------
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select isnt(public.create_claim('b0000000-0000-0000-0000-000000000002',
                                '3 keys, a red Barca keychain and a small USB stick'),
            null, 'Sara claims the keys with real details');
select set_config('request.jwt.claims',
  '{"sub":"66666666-6666-6666-6666-666666666666","role":"authenticated"}', true);
select isnt(public.create_claim('b0000000-0000-0000-0000-000000000002', 'they are mine, really'),
            null, 'Nora claims the keys with no details');
select throws_ok($$ select public.close_post('b0000000-0000-0000-0000-000000000002') $$,
  'P0002', 'not_found', 'Nora cannot close Amine''s post');

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select throws_ok(
  $$ select public.admin_decide_claim(
       (select id from public.admin_list_claims() where claimant_name = 'Nora L'), 'maybe') $$,
  '22023', 'invalid_input', 'the decision must be accepted or rejected');
select lives_ok(
  $$ select public.admin_decide_claim(
       (select id from public.admin_list_claims() where claimant_name = 'Sara B'), 'accepted',
       'Details match: Barca keychain + USB stick') $$,
  'the admin accepts the claim with the right details');
select is((select count(*)::int from public.admin_list_claims('pending')), 0,
  'the other pending claim was rejected automatically');
select throws_ok(
  $$ select public.admin_decide_claim(
       (select id from public.admin_list_claims('rejected') where claimant_name = 'Nora L'),
       'accepted') $$,
  'P0001', 'conflict', 'a decided claim cannot be decided again');

-- ---- conflict of interest --------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select isnt(public.create_claim('b0000000-0000-0000-0000-000000000004',
                                'Blue scarf with my initials K.M.'),
            null, 'Karim claims the scarf the admin posted');
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select throws_ok(
  $$ select public.admin_decide_claim(
       (select id from public.admin_list_claims() where post_title = 'Blue scarf'), 'accepted') $$,
  '42501', 'forbidden', 'an admin cannot decide a claim on their own post');
select is((select is_conflict from public.admin_list_claims() where post_title = 'Blue scarf'),
  true, 'the admin list marks that claim as a conflict');

-- ---- ban rejects pending claims --------------------------------------------
select lives_ok($$ select public.admin_review_user('33333333-3333-3333-3333-333333333333',
                                                  'banned') $$, 'the admin bans Karim');
select is((select count(*)::int from public.admin_list_claims('pending')), 0,
  'the banned user''s pending claim was rejected');

-- ---- results as Karim (banned) and Sara ------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select results_eq($$ select post_title, status from public.my_claims() $$,
  $$ values ('Keys with a red keychain'::text, 'accepted'::text) $$,
  'Sara sees her accepted claim (hand-over message on /me)');

select * from finish();
rollback;
