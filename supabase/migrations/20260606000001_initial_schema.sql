-- OpenBio initial schema: tables, RLS, public-write RPCs and storage.

-- ===== Tables =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  seo_title text,
  seo_description text,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,30}$')
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  position int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  thumbnail_url text,
  visible_from timestamptz,
  visible_until timestamptz,
  created_at timestamptz not null default now()
);
create index links_user_id_idx on public.links(user_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  link_id uuid references public.links(id) on delete set null,
  type text not null check (type in ('view','click')),
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index events_user_id_created_idx on public.events(user_id, created_at);
create index events_link_id_idx on public.events(link_id);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
create index leads_user_id_idx on public.leads(user_id);

-- ===== Row Level Security =====
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.events enable row level security;
alter table public.leads enable row level security;

-- profiles: public read (resolve username), owner writes
create policy "profiles_public_read" on public.profiles for select using (true);
create policy "profiles_owner_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_owner_update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_owner_delete" on public.profiles for delete using (auth.uid() = id);

-- links: public can read active links; owner reads/writes all own
create policy "links_public_read" on public.links for select using (is_active = true or auth.uid() = user_id);
create policy "links_owner_insert" on public.links for insert with check (auth.uid() = user_id);
create policy "links_owner_update" on public.links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "links_owner_delete" on public.links for delete using (auth.uid() = user_id);

-- events: owner read only; writes happen via SECURITY DEFINER rpc
create policy "events_owner_read" on public.events for select using (auth.uid() = user_id);

-- leads: owner read only; writes happen via SECURITY DEFINER rpc
create policy "leads_owner_read" on public.leads for select using (auth.uid() = user_id);

-- ===== SECURITY DEFINER RPCs for public (anonymous) writes =====
-- These let public visitors record analytics and submit their email without a
-- broad INSERT policy. The functions validate input and resolve ownership.
create or replace function public.record_event(
  p_type text,
  p_username text default null,
  p_link_id uuid default null,
  p_referrer text default null,
  p_user_agent text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if p_type not in ('view','click') then
    raise exception 'invalid event type';
  end if;

  if p_link_id is not null then
    select user_id into v_user_id from public.links where id = p_link_id;
  elsif p_username is not null then
    select id into v_user_id from public.profiles where username = p_username;
  end if;

  if v_user_id is null then
    return;
  end if;

  insert into public.events (user_id, link_id, type, referrer, user_agent)
  values (v_user_id, p_link_id, p_type, left(p_referrer, 512), left(p_user_agent, 512));
end;
$$;

create or replace function public.capture_lead(
  p_username text,
  p_email text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;
  select id into v_user_id from public.profiles where username = p_username;
  if v_user_id is null then
    raise exception 'profile not found';
  end if;
  insert into public.leads (user_id, email) values (v_user_id, lower(p_email));
end;
$$;

revoke all on function public.record_event(text, text, uuid, text, text) from public;
revoke all on function public.capture_lead(text, text) from public;
grant execute on function public.record_event(text, text, uuid, text, text) to anon, authenticated;
grant execute on function public.capture_lead(text, text) to anon, authenticated;

-- ===== Storage bucket for avatars + thumbnails =====
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

create policy "media_owner_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_owner_update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
-- Note: a public bucket serves objects via their public URL with no SELECT
-- policy, so none is added here (avoids exposing a file-listing endpoint).
