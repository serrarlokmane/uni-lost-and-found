-- SQL 2: search_posts, admin_log, admin_review_user, admin_review_post and the admin lists.
-- Spec: docs/PROJECT.md §6 (F2, F4, F5, F10), §9 (business rules), §11 (security).

-- ---------------------------------------------------------------------------
-- 1. search_posts (F5): SECURITY INVOKER, so RLS + column grants still apply
-- ---------------------------------------------------------------------------
-- Only public posts, newest first. The keyword is matched with ILIKE on title, description and
-- location; %, _ and \ typed by the user are escaped, so they are searched as plain characters.
create function public.search_posts(
  p_query text default null,
  p_type text default null,
  p_category text default null
)
returns table (
  id uuid, ref bigint, type text, category text, title text, description text, location text,
  happened_on date, status text, created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  with q as (
    select '%' || replace(replace(replace(btrim(left(p_query, 100)),
                                          '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select p.id, p.ref, p.type, p.category, p.title, p.description, p.location, p.happened_on,
         p.status, p.created_at
    from public.posts p, q
   where p.status in ('published', 'resolved')
     and (p_type is null or p.type = p_type)
     and (p_category is null or p.category = p_category)
     and (nullif(btrim(p_query), '') is null
          or p.title ilike q.pattern escape '\'
          or p.description ilike q.pattern escape '\'
          or p.location ilike q.pattern escape '\')
   order by p.created_at desc
   limit 50;
$$;

-- ---------------------------------------------------------------------------
-- 2. admin_log: every admin decision (F10 "Log" tab)
-- ---------------------------------------------------------------------------
create table public.admin_log (
  id           bigint generated always as identity primary key,
  admin_id     uuid references public.profiles (id) on delete set null,
  action       text not null check (action in (
                 'user_approved', 'user_rejected', 'user_banned',
                 'post_published', 'post_rejected',
                 'claim_accepted', 'claim_rejected')),
  target_type  text not null check (target_type in ('user', 'post', 'claim')),
  target_id    uuid not null,
  note         text check (char_length(note) <= 200),
  created_at   timestamptz not null default now()
);

create index admin_log_created_idx on public.admin_log (created_at desc);
create index admin_log_admin_idx on public.admin_log (admin_id);

alter table public.admin_log enable row level security;
revoke all on table public.admin_log from anon, authenticated;
-- No table grant: admins read the log through admin_list_log(). The policy is a second lock.
create policy "admin_log: admins only"
  on public.admin_log for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 3. admin_review_user (F2): approve, reject or ban an account
-- ---------------------------------------------------------------------------
-- Allowed moves: pending -> approved | rejected, approved -> banned. Admins can't act on themselves
-- or on other admins. Banning hides the user's posts (PROJECT.md §9).
-- (SQL 3 replaces this function so a ban also rejects the user's pending claims.)
create function public.admin_review_user(p_user_id uuid, p_decision text)
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
  end if;

  insert into public.admin_log (admin_id, action, target_type, target_id)
  values (v_admin, 'user_' || p_decision, 'user', p_user_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. admin_review_post (F4): publish or reject a pending post
-- ---------------------------------------------------------------------------
create function public.admin_review_post(
  p_post_id uuid,
  p_decision text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := public.require_admin();
  v_post public.posts%rowtype;
  v_reason text := nullif(btrim(p_reason), '');
begin
  if p_decision not in ('published', 'rejected') then
    raise exception 'invalid_input' using errcode = '22023';
  end if;
  if p_decision = 'rejected' and (v_reason is null or char_length(v_reason) not between 3 and 200)
  then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select * into v_post from public.posts p where p.id = p_post_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  -- No conflict of interest: an admin never reviews their own post.
  if v_post.owner_id = v_admin then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_post.status <> 'pending' then
    raise exception 'conflict' using errcode = 'P0001';
  end if;

  update public.posts p
     set status = p_decision,
         reject_reason = case when p_decision = 'rejected' then v_reason end,
         reviewed_by = v_admin
   where p.id = p_post_id;

  insert into public.admin_log (admin_id, action, target_type, target_id, note)
  values (v_admin, 'post_' || p_decision, 'post', p_post_id,
          case when p_decision = 'rejected' then v_reason end);
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. admin lists (F10 tabs). Each one checks require_admin() first.
-- ---------------------------------------------------------------------------
create function public.admin_list_users(p_status text default 'pending')
returns table (
  id uuid, full_name text, student_id text, email text, status text, created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();
  return query
    select p.id, p.full_name, p.student_id, u.email::text, p.status, p.created_at
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.role = 'student' and p.status = p_status
     order by p.created_at
     limit 200;
end;
$$;

create function public.admin_list_posts(p_status text default 'pending')
returns table (
  id uuid, ref bigint, type text, category text, title text, description text, location text,
  happened_on date, status text, reject_reason text, created_at timestamptz,
  owner_name text, is_mine boolean
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
    select p.id, p.ref, p.type, p.category, p.title, p.description, p.location, p.happened_on,
           p.status, p.reject_reason, p.created_at, o.full_name, p.owner_id = v_admin
      from public.posts p
      join public.profiles o on o.id = p.owner_id
     where p.status = p_status
     order by p.created_at
     limit 200;
end;
$$;

create function public.admin_list_log()
returns table (
  id bigint, admin_name text, action text, target_type text, target_id uuid, note text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();
  return query
    select l.id, a.full_name, l.action, l.target_type, l.target_id, l.note, l.created_at
      from public.admin_log l
      left join public.profiles a on a.id = l.admin_id
     order by l.created_at desc, l.id desc
     limit 100;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. who may call which function
-- ---------------------------------------------------------------------------
revoke all on function public.search_posts(text, text, text) from public;
revoke all on function public.admin_review_user(uuid, text) from public, anon;
revoke all on function public.admin_review_post(uuid, text, text) from public, anon;
revoke all on function public.admin_list_users(text) from public, anon;
revoke all on function public.admin_list_posts(text) from public, anon;
revoke all on function public.admin_list_log() from public, anon;

grant execute on function public.search_posts(text, text, text) to anon, authenticated;
grant execute on function public.admin_review_user(uuid, text) to authenticated;
grant execute on function public.admin_review_post(uuid, text, text) to authenticated;
grant execute on function public.admin_list_users(text) to authenticated;
grant execute on function public.admin_list_posts(text) to authenticated;
grant execute on function public.admin_list_log() to authenticated;
