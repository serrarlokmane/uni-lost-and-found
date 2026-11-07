-- SQL 3: claims, create_claim, admin_decide_claim, claim lists, pending counts.
-- Spec: docs/PROJECT.md §6 (F7, F8, F9, F10), §7 (user journeys), §9 (business rules).

-- ---------------------------------------------------------------------------
-- 1. claims: "This is mine" (on found posts) or "I found it" (on lost posts)
-- ---------------------------------------------------------------------------
create table public.claims (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts (id) on delete cascade,
  claimant_id  uuid not null references public.profiles (id) on delete cascade,
  message      text not null check (char_length(message) between 10 and 1000),
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  decided_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  decided_at   timestamptz,
  unique (post_id, claimant_id) -- business rule: 1 claim per post per student
);

create index claims_status_idx on public.claims (status, created_at);
create index claims_claimant_idx on public.claims (claimant_id, created_at desc);
create index claims_decided_by_idx on public.claims (decided_by);

alter table public.claims enable row level security;
revoke all on table public.claims from anon, authenticated;
-- No table grant: claims are read through my_claims() and admin_list_claims().
-- The policy is a second lock in case a grant is added by mistake later.
create policy "claims: own or admin"
  on public.claims for select
  to authenticated
  using (claimant_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 2. create_claim (F7)
-- ---------------------------------------------------------------------------
-- Only approved students, only on published posts, never on their own post, once per post.
create function public.create_claim(p_post_id uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_approved();
  v_post public.posts%rowtype;
  v_id uuid;
begin
  select * into v_post from public.posts p where p.id = p_post_id;
  if not found or v_post.status <> 'published' then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_post.owner_id = v_uid then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.claims (post_id, claimant_id, message)
  values (p_post_id, v_uid, btrim(p_message))
  returning id into v_id;
  return v_id;
exception
  when unique_violation then
    raise exception 'already_claimed' using errcode = 'P0001';
  when check_violation or not_null_violation then
    raise exception 'invalid_input' using errcode = '22023';
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. admin_decide_claim (F8)
-- ---------------------------------------------------------------------------
-- Accepting a claim resolves the post and rejects the other pending claims on it.
-- No conflict of interest: an admin never decides their own claim, or a claim on their own post.
create function public.admin_decide_claim(
  p_claim_id uuid,
  p_decision text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := public.require_admin();
  v_claim public.claims%rowtype;
  v_post public.posts%rowtype;
  v_note text := nullif(btrim(p_note), '');
begin
  if p_decision not in ('accepted', 'rejected') or char_length(v_note) > 200 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select * into v_claim from public.claims c where c.id = p_claim_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  select * into v_post from public.posts p where p.id = v_claim.post_id for update;

  if v_claim.claimant_id = v_admin or v_post.owner_id = v_admin then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_claim.status <> 'pending' or (p_decision = 'accepted' and v_post.status <> 'published') then
    raise exception 'conflict' using errcode = 'P0001';
  end if;

  update public.claims c
     set status = p_decision, decided_by = v_admin, decided_at = now()
   where c.id = p_claim_id;

  insert into public.admin_log (admin_id, action, target_type, target_id, note)
  values (v_admin, 'claim_' || p_decision, 'claim', p_claim_id, v_note);

  if p_decision = 'accepted' then
    update public.posts p
       set status = 'resolved', resolved_at = now()
     where p.id = v_post.id;

    -- The other pending claims on this post lose (logged one by one, so the Log tab is complete).
    with lost as (
      update public.claims c
         set status = 'rejected', decided_by = v_admin, decided_at = now()
       where c.post_id = v_post.id and c.status = 'pending'
      returning c.id
    )
    insert into public.admin_log (admin_id, action, target_type, target_id, note)
    select v_admin, 'claim_rejected', 'claim', lost.id, 'Another claim was accepted'
      from lost;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. close_post v2: also rejects the pending claims on the post
-- ---------------------------------------------------------------------------
create or replace function public.close_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_approved();
begin
  update public.posts p
     set status = 'resolved', resolved_at = now()
   where p.id = p_post_id and p.owner_id = v_uid and p.status = 'published';
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  update public.claims c
     set status = 'rejected', decided_at = now()
   where c.post_id = p_post_id and c.status = 'pending';
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. admin_review_user v2: a ban also rejects the user's pending claims
-- ---------------------------------------------------------------------------
create or replace function public.admin_review_user(p_user_id uuid, p_decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := public.require_admin();
  v_target public.profiles%rowtype;
begin
  if p_decision not in ('approved', 'rejected', 'banned') then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select * into v_target from public.profiles p where p.id = p_user_id for update;
  if not found or v_target.role = 'admin' or v_target.id = v_admin then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if not ((v_target.status = 'pending' and p_decision in ('approved', 'rejected'))
          or (v_target.status = 'approved' and p_decision = 'banned')) then
    raise exception 'conflict' using errcode = 'P0001';
  end if;

  update public.profiles p set status = p_decision where p.id = p_user_id;

  if p_decision = 'banned' then
    update public.posts p
       set status = 'rejected', reject_reason = 'Account banned', reviewed_by = v_admin
     where p.owner_id = p_user_id and p.status <> 'rejected';

    update public.claims c
       set status = 'rejected', decided_by = v_admin, decided_at = now()
     where c.claimant_id = p_user_id and c.status = 'pending';
  end if;

  insert into public.admin_log (admin_id, action, target_type, target_id)
  values (v_admin, 'user_' || p_decision, 'user', p_user_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. reads
-- ---------------------------------------------------------------------------
-- "My claims" on /me (F9). post_ref is what the student says at the office.
create function public.my_claims()
returns table (
  id uuid, post_id uuid, post_ref bigint, post_type text, post_title text, message text,
  status text, created_at timestamptz, decided_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.post_id, p.ref, p.type, p.title, c.message, c.status, c.created_at, c.decided_at
    from public.claims c
    join public.posts p on p.id = c.post_id
   where c.claimant_id = (select auth.uid())
   order by c.created_at desc;
$$;

-- The caller's claim status on one post (null if none), for the post details page.
create function public.my_claim_status(p_post_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select c.status from public.claims c
   where c.post_id = p_post_id and c.claimant_id = (select auth.uid());
$$;

-- Admin "Claims" tab (F10): the claim, the post, and who claims it.
create function public.admin_list_claims(p_status text default 'pending')
returns table (
  id uuid, message text, status text, created_at timestamptz,
  post_id uuid, post_ref bigint, post_type text, post_title text, post_description text,
  claimant_name text, claimant_student_id text, is_conflict boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin uuid := public.require_admin();
begin
  return query
    select c.id, c.message, c.status, c.created_at,
           p.id, p.ref, p.type, p.title, p.description,
           u.full_name, u.student_id,
           (c.claimant_id = v_admin or p.owner_id = v_admin)
      from public.claims c
      join public.posts p on p.id = c.post_id
      join public.profiles u on u.id = c.claimant_id
     where c.status = p_status
     order by c.created_at
     limit 200;
end;
$$;

-- Pending counts for the admin tabs ("Accounts 3", "Posts 5", "Claims 2").
create function public.admin_counts()
returns table (pending_users int, pending_posts int, pending_claims int)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();
  return query
    select (select count(*)::int from public.profiles where role = 'student' and status = 'pending'),
           (select count(*)::int from public.posts where status = 'pending'),
           (select count(*)::int from public.claims where status = 'pending');
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. who may call which function
-- ---------------------------------------------------------------------------
revoke all on function public.create_claim(uuid, text) from public, anon;
revoke all on function public.admin_decide_claim(uuid, text, text) from public, anon;
revoke all on function public.my_claims() from public, anon;
revoke all on function public.my_claim_status(uuid) from public, anon;
revoke all on function public.admin_list_claims(text) from public, anon;
revoke all on function public.admin_counts() from public, anon;

grant execute on function public.create_claim(uuid, text) to authenticated;
grant execute on function public.admin_decide_claim(uuid, text, text) to authenticated;
grant execute on function public.my_claims() to authenticated;
grant execute on function public.my_claim_status(uuid) to authenticated;
grant execute on function public.admin_list_claims(text) to authenticated;
grant execute on function public.admin_counts() to authenticated;
