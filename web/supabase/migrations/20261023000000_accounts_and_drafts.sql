-- Resite: accounts (Supabase Auth + profiles) and each user's saved progress (drafts).
-- Applied with `supabase db push` (from web/). Safe to re-run: every statement replaces or skips what already exists,
-- so pasting it into the dashboard's SQL Editor works too. Change the schema with a new migration, not by editing this one.

-- ─── profiles: the username for each auth user ─────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null check (username ~ '^[a-zA-Z0-9_-]{3,30}$'),
  created_at timestamptz not null default now()
);

-- Usernames are unique ignoring case: "Alice" and "alice" can't both exist.
create unique index if not exists profiles_username_lower on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "Users read their own profile" on public.profiles;
create policy "Users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
-- No insert/update/delete policies: only the trigger below writes profiles, so a username can't be changed to bypass the checks.

-- Creates the profile from the username passed to auth.signUp({ options: { data: { username } } }).
-- If the username is invalid or taken, this raises and the whole sign-up is rolled back.
-- Users added from the dashboard have no username, so they get "user_" + the start of their id.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form say "username taken" before creating the account. Reveals only whether a name exists.
create or replace function public.username_available(name text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(name));
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ─── drafts: one latest Resume per user ────────────────────────────────────

create table if not exists public.drafts (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  content    jsonb not null,
  updated_at timestamptz not null default now(),
  -- Same ceiling as the app (MAX_DRAFT_BYTES), enforced here too because the publishable key can reach this table directly.
  constraint drafts_content_size check (octet_length(content::text) <= 8 * 1024 * 1024)
);

alter table public.drafts enable row level security;

drop policy if exists "Users read their own draft" on public.drafts;
create policy "Users read their own draft" on public.drafts
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own draft" on public.drafts;
create policy "Users create their own draft" on public.drafts
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own draft" on public.drafts;
create policy "Users update their own draft" on public.drafts
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
