-- Native reservation and waitlist compatibility tables.
-- Ownership will move to auth.uid() policies when Supabase Auth is enabled.

create table if not exists public.app_reservations (
  legacy_id text primary key,
  restaurant_legacy_id text not null,
  user_legacy_id text not null,
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null default 1 check (party_size > 0 and party_size <= 50),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_waitlist_entries (
  legacy_id text primary key,
  restaurant_legacy_id text not null,
  user_legacy_id text not null,
  requested_date date not null,
  preferred_time time,
  party_size integer not null default 1 check (party_size > 0 and party_size <= 50),
  status text not null default 'waiting'
    check (status in ('waiting', 'notified', 'converted', 'cancelled')),
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_reservations_restaurant_schedule_idx
  on public.app_reservations(restaurant_legacy_id, reservation_date, reservation_time);
create index if not exists app_reservations_user_idx
  on public.app_reservations(user_legacy_id, reservation_date);
create index if not exists app_waitlist_restaurant_schedule_idx
  on public.app_waitlist_entries(restaurant_legacy_id, requested_date, preferred_time);
create index if not exists app_waitlist_user_idx
  on public.app_waitlist_entries(user_legacy_id, requested_date);

alter table public.app_reservations enable row level security;
alter table public.app_waitlist_entries enable row level security;

drop policy if exists "app reservations compatibility select" on public.app_reservations;
create policy "app reservations compatibility select"
on public.app_reservations for select
to anon, authenticated
using (true);

drop policy if exists "app reservations compatibility write" on public.app_reservations;
create policy "app reservations compatibility write"
on public.app_reservations for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "app waitlist compatibility select" on public.app_waitlist_entries;
create policy "app waitlist compatibility select"
on public.app_waitlist_entries for select
to anon, authenticated
using (true);

drop policy if exists "app waitlist compatibility write" on public.app_waitlist_entries;
create policy "app waitlist compatibility write"
on public.app_waitlist_entries for all
to anon, authenticated
using (true)
with check (true);
