-- SQL 1: profiles, posts, RLS, sign-up trigger, create_post, close_post.
-- Spec: docs/PROJECT.md §5 (who sees what), §9 (business rules), §10 (data model), §11 (security).
--
-- Security model, in short:
--   * RLS is on for every table. anon / authenticated get NO insert, update or delete grant.
--   * Visitors read public posts through a column grant that leaves out owner_id and reviewer data,
--     so "who wrote a post" never leaves the database (PROJECT.md §5).
--   * Every write, and every read of private data, goes through a SECURITY DEFINER function with
--     search_path = '' that checks auth.uid() first (PLAN.md pitfall #8).
--   * The role is read ONLY from public.profiles, never from user metadata (pitfall #9).
--
-- Errors: functions raise short machine codes (not_authenticated, not_approved, ...) that the app
-- maps to friendly text. Database error text is never shown to users.

-- ---------------------------------------------------------------------------
-- 1. profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 2 and 80),
  student_id  text not null unique check (student_id ~ '^[A-Za-z0-9-]{4,20}$'),
  role        text not null default 'student' check (role in ('student', 'admin')),
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected', 'banned')),
  created_at  timestamptz not null default now()
);

comment on column public.profiles.student_id is 'Personal data: visible only to the owner and admins.';

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- 2. helpers: who is calling?
-- ---------------------------------------------------------------------------
-- True only for an APPROVED admin. Returns false (never null) for visitors.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role = 'admin' and p.status = 'approved'
       from public.profiles p
      where p.id = (select auth.uid())),
    false
  );
$$;

-- Raises unless the caller is logged in AND approved. Returns the caller's id.
create function public.require_approved()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  select p.status into v_status from public.profiles p where p.id = v_uid;
  if v_status is distinct from 'approved' then
    raise exception 'not_approved' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

-- Raises unless the caller is an approved admin. Returns the caller's id.
create function public.require_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. sign-up trigger: always student + pending
-- ---------------------------------------------------------------------------
-- Copies ONLY full_name and student_id from the sign-up metadata. role and status come from the
-- column defaults, so a user who sends {"role":"admin"} in their metadata still gets 'student'.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, student_id)
  values (
    new.id,
    btrim(new.raw_user_meta_data ->> 'full_name'),
    upper(btrim(new.raw_user_meta_data ->> 'student_id'))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  ref            bigint generated always as identity unique, -- "No. 142" on the tag, said at the office
  owner_id       uuid not null references public.profiles (id) on delete cascade,
  type           text not null check (type in ('lost', 'found')),
  category       text not null
                 check (category in ('electronics', 'keys', 'bags', 'clothing', 'documents', 'other')),
  title          text not null check (char_length(title) between 3 and 80),
  description    text not null check (char_length(description) between 10 and 1000),
  location       text not null check (char_length(location) between 2 and 80),
  happened_on    date not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'published', 'rejected', 'resolved')),
  reject_reason  text check (char_length(reject_reason) <= 200),
  reviewed_by    uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

create index posts_public_idx on public.posts (status, created_at desc);
create index posts_owner_idx on public.posts (owner_id, created_at desc);
create index posts_reviewed_by_idx on public.posts (reviewed_by);

alter table public.posts enable row level security;

-- ---------------------------------------------------------------------------
-- 5. grants + SELECT policies (no write grants at all)
-- ---------------------------------------------------------------------------
-- Supabase gives anon/authenticated full table rights by default: take them all back first.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.posts from anon, authenticated;

-- profiles: a logged-in user reads their own row; an admin reads all rows.
grant select on table public.profiles to authenticated;
create policy "profiles: own row or admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- posts: everyone reads PUBLIC posts, and only the safe columns (no owner_id, no reviewer, no reason).
grant select (id, ref, type, category, title, description, location, happened_on, status,
              created_at, resolved_at)
  on table public.posts to anon, authenticated;
create policy "posts: public ones"
  on public.posts for select
  to anon, authenticated
  using (status in ('published', 'resolved'));

-- ---------------------------------------------------------------------------
-- 6. create_post (F3)
-- ---------------------------------------------------------------------------
create function public.create_post(
  p_type text,
  p_category text,
  p_title text,
  p_description text,
  p_location text,
  p_happened_on date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_approved();
  v_id uuid;
begin
  -- Business rule: 5 posts per day at most.
  if (select count(*) from public.posts p
       where p.owner_id = v_uid and p.created_at > now() - interval '1 day') >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  -- The date can't be in the future or more than a year ago.
  if p_happened_on is null
     or p_happened_on > current_date
     or p_happened_on < current_date - 365 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  insert into public.posts (owner_id, type, category, title, description, location, happened_on)
  values (v_uid, p_type, p_category, btrim(p_title), btrim(p_description), btrim(p_location),
          p_happened_on)
  returning id into v_id;

  return v_id;
exception
  when check_violation or not_null_violation then
    raise exception 'invalid_input' using errcode = '22023';
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. close_post (F9): the owner marks their published post as resolved
-- ---------------------------------------------------------------------------
-- Only a published post can be closed: closing a pending post would make unreviewed text public.
-- (SQL 3 replaces this function so it also rejects the pending claims on the post.)
create function public.close_post(p_post_id uuid)
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
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. reads that need private columns
-- ---------------------------------------------------------------------------
-- One post for /posts/[id]. Public posts for everyone; pending/rejected ones only for the owner or
-- an admin. Returns no row otherwise, so "missing" and "not allowed" look the same (404).
create function public.get_post(p_post_id uuid)
returns table (
  id uuid, ref bigint, type text, category text, title text, description text, location text,
  happened_on date, status text, reject_reason text, created_at timestamptz,
  resolved_at timestamptz, is_mine boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.ref, p.type, p.category, p.title, p.description, p.location, p.happened_on,
         p.status,
         case when p.owner_id = (select auth.uid()) or (select public.is_admin())
              then p.reject_reason end,
         p.created_at, p.resolved_at,
         coalesce(p.owner_id = (select auth.uid()), false)
    from public.posts p
   where p.id = p_post_id
     and (p.status in ('published', 'resolved')
          or p.owner_id = (select auth.uid())
          or (select public.is_admin()));
$$;

-- "My posts" on /me: all of the caller's posts, any status, with the reject reason.
create function public.my_posts()
returns table (
  id uuid, ref bigint, type text, category text, title text, location text, happened_on date,
  status text, reject_reason text, created_at timestamptz, resolved_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.ref, p.type, p.category, p.title, p.location, p.happened_on, p.status,
         p.reject_reason, p.created_at, p.resolved_at
    from public.posts p
   where p.owner_id = (select auth.uid())
   order by p.created_at desc;
$$;

-- ---------------------------------------------------------------------------
-- 9. who may call which function
-- ---------------------------------------------------------------------------
-- Postgres lets PUBLIC execute new functions by default: close that, then open only what's needed.
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.require_approved() from public, anon, authenticated;
revoke all on function public.require_admin() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.create_post(text, text, text, text, text, date) from public, anon;
revoke all on function public.close_post(uuid) from public, anon;
revoke all on function public.get_post(uuid) from public;
revoke all on function public.my_posts() from public, anon;

-- is_admin() is used inside RLS policies, so the roles that run those policies need it.
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.create_post(text, text, text, text, text, date) to authenticated;
grant execute on function public.close_post(uuid) to authenticated;
grant execute on function public.get_post(uuid) to anon, authenticated;
grant execute on function public.my_posts() to authenticated;
