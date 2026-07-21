-- App compatibility layer for the Expo client.
-- The app currently uses local/demo auth ids, so these tables keep legacy text ids
-- while the canonical Supabase Auth migration remains available for a later hardening pass.

alter type public.restaurant_status add value if not exists 'paused';

alter table public.restaurants
  add column if not exists legacy_id text unique,
  add column if not exists owner_legacy_id text,
  add column if not exists reviewed_by_legacy_id text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists submitted_at timestamptz,
  add column if not exists app_payload jsonb not null default '{}'::jsonb;

create index if not exists restaurants_legacy_id_idx on public.restaurants(legacy_id);
create index if not exists restaurants_owner_legacy_idx on public.restaurants(owner_legacy_id);

alter table public.reviews
  add column if not exists legacy_id text unique,
  add column if not exists restaurant_legacy_id text,
  add column if not exists author_legacy_id text,
  add column if not exists app_payload jsonb not null default '{}'::jsonb;

create index if not exists reviews_legacy_id_idx on public.reviews(legacy_id);
create index if not exists reviews_restaurant_legacy_idx on public.reviews(restaurant_legacy_id);

create table if not exists public.app_profiles (
  legacy_id text primary key,
  full_name text,
  email citext,
  instagram text,
  photo_url text,
  bio text,
  location text,
  preferences text[] not null default '{}',
  gamification jsonb,
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_favorites (
  legacy_id text primary key,
  user_legacy_id text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_posts (
  legacy_id text primary key,
  author_legacy_id text not null,
  author_email text,
  status text not null default 'published',
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_comments (
  legacy_id text primary key,
  post_legacy_id text not null,
  author_legacy_id text not null,
  author_name text,
  status text not null default 'published',
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_reactions (
  legacy_id text primary key,
  post_legacy_id text not null,
  user_legacy_id text not null,
  reaction text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moderation_reports (
  legacy_id text primary key,
  target_type text not null,
  target_legacy_id text not null,
  reporter_legacy_id text not null,
  reporter_email text,
  reviewed_by_legacy_id text,
  reviewed_at timestamptz,
  status text not null default 'open',
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_blocks (
  legacy_id text primary key,
  user_legacy_id text not null,
  blocked_user_legacy_id text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.invites (
  legacy_id text primary key,
  code text not null unique,
  link text not null,
  owner_legacy_id text not null,
  owner_email text,
  uses integer not null default 0 check (uses >= 0),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invite_redemptions (
  id uuid primary key default gen_random_uuid(),
  invite_legacy_id text not null,
  code text not null,
  invited_user_legacy_id text not null,
  invited_user_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.push_tokens (
  legacy_id text primary key,
  user_legacy_id text not null,
  token text not null,
  platform text,
  device_name text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_queue (
  legacy_id text primary key,
  user_legacy_id text not null,
  status text not null default 'queued',
  app_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_favorites_user_legacy_idx on public.app_favorites(user_legacy_id);
create index if not exists feed_comments_post_legacy_idx on public.feed_comments(post_legacy_id);
create index if not exists feed_reactions_post_legacy_idx on public.feed_reactions(post_legacy_id);
create index if not exists moderation_reports_target_idx on public.moderation_reports(target_type, target_legacy_id);
create index if not exists invites_code_idx on public.invites(code);

alter table public.app_profiles enable row level security;
alter table public.app_favorites enable row level security;
alter table public.feed_posts enable row level security;
alter table public.feed_comments enable row level security;
alter table public.feed_reactions enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.user_blocks enable row level security;
alter table public.invites enable row level security;
alter table public.invite_redemptions enable row level security;
alter table public.push_tokens enable row level security;
alter table public.notification_queue enable row level security;

create policy "App can read synced restaurant data"
on public.restaurants for select
to anon, authenticated
using (true);

create policy "App can sync published restaurant data"
on public.restaurants for insert
to anon, authenticated
with check (true);

create policy "App can update synced restaurant data"
on public.restaurants for update
to anon, authenticated
using (true)
with check (true);

create policy "App can delete synced restaurant seeds"
on public.restaurants for delete
to anon, authenticated
using (true);

create policy "App can sync reviews"
on public.reviews for insert
to anon, authenticated
with check (true);

create policy "App can update synced reviews"
on public.reviews for update
to anon, authenticated
using (true)
with check (true);

create policy "App profiles are readable"
on public.app_profiles for select
to anon, authenticated
using (true);

create policy "App profiles can be synced"
on public.app_profiles for all
to anon, authenticated
using (true)
with check (true);

create policy "App favorites can be synced"
on public.app_favorites for all
to anon, authenticated
using (true)
with check (true);

create policy "Feed posts can be synced"
on public.feed_posts for all
to anon, authenticated
using (true)
with check (true);

create policy "Feed comments can be synced"
on public.feed_comments for all
to anon, authenticated
using (true)
with check (true);

create policy "Feed reactions can be synced"
on public.feed_reactions for all
to anon, authenticated
using (true)
with check (true);

create policy "Moderation reports can be synced"
on public.moderation_reports for all
to anon, authenticated
using (true)
with check (true);

create policy "User blocks can be synced"
on public.user_blocks for all
to anon, authenticated
using (true)
with check (true);

create policy "Invites can be synced"
on public.invites for all
to anon, authenticated
using (true)
with check (true);

create policy "Invite redemptions can be synced"
on public.invite_redemptions for all
to anon, authenticated
using (true)
with check (true);

create policy "Push tokens can be synced"
on public.push_tokens for all
to anon, authenticated
using (true)
with check (true);

create policy "Notification queue can be synced"
on public.notification_queue for all
to anon, authenticated
using (true)
with check (true);

create policy "App can upload restaurant media"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'restaurant-media');

create policy "App can update restaurant media"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'restaurant-media')
with check (bucket_id = 'restaurant-media');
