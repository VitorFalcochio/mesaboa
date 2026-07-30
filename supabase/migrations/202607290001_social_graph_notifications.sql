create table if not exists public.social_follows (
  legacy_id text primary key,
  follower_legacy_id text not null,
  target_legacy_id text not null,
  active boolean not null default true,
  target_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (follower_legacy_id, target_legacy_id)
);

create table if not exists public.app_notifications (
  legacy_id text primary key,
  user_legacy_id text not null,
  actor_legacy_id text,
  type text not null,
  status text not null default 'unread',
  target_legacy_id text,
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_follows_follower_idx
on public.social_follows(follower_legacy_id, active);

create index if not exists social_follows_target_idx
on public.social_follows(target_legacy_id, active);

create index if not exists app_notifications_user_idx
on public.app_notifications(user_legacy_id, created_at desc);

alter table public.social_follows enable row level security;
alter table public.app_notifications enable row level security;

create policy "Social follows are readable"
on public.social_follows for select
to anon, authenticated
using (true);

create policy "Social follows can be synced"
on public.social_follows for all
to anon, authenticated
using (true)
with check (true);

create policy "App notifications are readable"
on public.app_notifications for select
to anon, authenticated
using (true);

create policy "App notifications can be synced"
on public.app_notifications for all
to anon, authenticated
using (true)
with check (true);
