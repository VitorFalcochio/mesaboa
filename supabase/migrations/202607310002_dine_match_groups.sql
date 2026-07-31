-- Collaborative Dine Match groups, participants and restaurant votes.

create extension if not exists pgcrypto;

create table if not exists public.dine_match_groups (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
  host_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nosso Dine Match',
  status text not null default 'active' check (status in ('active', 'finished', 'cancelled')),
  preferences jsonb not null default '{}'::jsonb,
  restaurant_legacy_ids text[] not null default '{}',
  winner_restaurant_legacy_id text,
  max_participants integer not null default 8 check (max_participants between 2 and 20),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dine_match_participants (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.dine_match_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  preferences jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.dine_match_votes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.dine_match_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_legacy_id text not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, user_id, restaurant_legacy_id)
);

create index if not exists dine_match_groups_host_idx on public.dine_match_groups(host_id, created_at desc);
create index if not exists dine_match_participants_group_idx on public.dine_match_participants(group_id, joined_at);
create index if not exists dine_match_votes_group_idx on public.dine_match_votes(group_id, restaurant_legacy_id);

alter table public.dine_match_groups enable row level security;
alter table public.dine_match_participants enable row level security;
alter table public.dine_match_votes enable row level security;

create or replace function public.is_dine_match_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.dine_match_participants
    where group_id = target_group_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.dine_match_groups
    where id = target_group_id and host_id = auth.uid()
  );
$$;

revoke all on function public.is_dine_match_member(uuid) from public, anon;
grant execute on function public.is_dine_match_member(uuid) to authenticated;

create or replace function public.create_dine_match_group(
  group_preferences jsonb default '{}'::jsonb,
  candidate_restaurant_ids text[] default '{}',
  participant_name text default 'Anfitrião',
  participant_limit integer default 8
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  created_group_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  insert into public.dine_match_groups (
    host_id,
    preferences,
    restaurant_legacy_ids,
    max_participants
  ) values (
    auth.uid(),
    coalesce(group_preferences, '{}'::jsonb),
    coalesce(candidate_restaurant_ids, '{}'),
    greatest(2, least(20, coalesce(participant_limit, 8)))
  ) returning id into created_group_id;

  insert into public.dine_match_participants (
    group_id,
    user_id,
    display_name,
    preferences
  ) values (
    created_group_id,
    auth.uid(),
    left(coalesce(nullif(trim(participant_name), ''), 'Anfitrião'), 80),
    coalesce(group_preferences, '{}'::jsonb)
  );

  return created_group_id;
end;
$$;

revoke all on function public.create_dine_match_group(jsonb, text[], text, integer) from public, anon;
grant execute on function public.create_dine_match_group(jsonb, text[], text, integer) to authenticated;

drop policy if exists "Members read Dine Match groups" on public.dine_match_groups;
create policy "Members read Dine Match groups"
on public.dine_match_groups for select to authenticated
using (host_id = auth.uid() or public.is_dine_match_member(id));

drop policy if exists "Users create Dine Match groups" on public.dine_match_groups;
create policy "Users create Dine Match groups"
on public.dine_match_groups for insert to authenticated
with check (host_id = auth.uid());

drop policy if exists "Hosts update Dine Match groups" on public.dine_match_groups;
create policy "Hosts update Dine Match groups"
on public.dine_match_groups for update to authenticated
using (host_id = auth.uid()) with check (host_id = auth.uid());

drop policy if exists "Members read Dine Match participants" on public.dine_match_participants;
create policy "Members read Dine Match participants"
on public.dine_match_participants for select to authenticated
using (public.is_dine_match_member(group_id));

drop policy if exists "Users join active Dine Match groups" on public.dine_match_participants;
create policy "Users join active Dine Match groups"
on public.dine_match_participants for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.dine_match_groups
    where id = group_id and status = 'active' and expires_at > now()
  )
);

drop policy if exists "Members update themselves" on public.dine_match_participants;
create policy "Members update themselves"
on public.dine_match_participants for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Members read Dine Match votes" on public.dine_match_votes;
create policy "Members read Dine Match votes"
on public.dine_match_votes for select to authenticated
using (public.is_dine_match_member(group_id));

drop policy if exists "Members cast Dine Match votes" on public.dine_match_votes;
create policy "Members cast Dine Match votes"
on public.dine_match_votes for insert to authenticated
with check (user_id = auth.uid() and public.is_dine_match_member(group_id));

drop policy if exists "Members update their Dine Match votes" on public.dine_match_votes;
create policy "Members update their Dine Match votes"
on public.dine_match_votes for update to authenticated
using (user_id = auth.uid() and public.is_dine_match_member(group_id))
with check (user_id = auth.uid() and public.is_dine_match_member(group_id));

drop policy if exists "Members remove their Dine Match votes" on public.dine_match_votes;
create policy "Members remove their Dine Match votes"
on public.dine_match_votes for delete to authenticated
using (user_id = auth.uid() and public.is_dine_match_member(group_id));

create or replace function public.join_dine_match_group(
  target_invite_code text,
  participant_name text,
  participant_preferences jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group public.dine_match_groups%rowtype;
  participant_count integer;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into target_group
  from public.dine_match_groups
  where invite_code = upper(trim(target_invite_code))
    and status = 'active'
    and expires_at > now()
  for update;

  if target_group.id is null then raise exception 'DINE_MATCH_NOT_FOUND'; end if;

  select count(*) into participant_count
  from public.dine_match_participants
  where group_id = target_group.id;

  if participant_count >= target_group.max_participants
    and not exists (
      select 1 from public.dine_match_participants
      where group_id = target_group.id and user_id = auth.uid()
    ) then
    raise exception 'DINE_MATCH_FULL';
  end if;

  insert into public.dine_match_participants (group_id, user_id, display_name, preferences)
  values (
    target_group.id,
    auth.uid(),
    left(coalesce(nullif(trim(participant_name), ''), 'Participante'), 80),
    coalesce(participant_preferences, '{}'::jsonb)
  )
  on conflict (group_id, user_id) do update set
    display_name = excluded.display_name,
    preferences = excluded.preferences;

  return target_group.id;
end;
$$;

revoke all on function public.join_dine_match_group(text, text, jsonb) from public, anon;
grant execute on function public.join_dine_match_group(text, text, jsonb) to authenticated;

grant select, insert, update on public.dine_match_groups to authenticated;
grant select, insert, update on public.dine_match_participants to authenticated;
grant select, insert, update, delete on public.dine_match_votes to authenticated;
