-- Backend hardening foundation.
-- This migration keeps legacy text identifiers for compatibility, while binding
-- every new authenticated write to auth.uid().

alter table public.app_profiles
  add column if not exists auth_user_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.app_favorites
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.feed_posts
  add column if not exists author_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.feed_comments
  add column if not exists author_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.feed_reactions
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.moderation_reports
  add column if not exists reporter_id uuid references public.profiles(id) on delete set null default auth.uid();
alter table public.user_blocks
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.invites
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.invite_redemptions
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.push_tokens
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid();
alter table public.notification_queue
  add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.social_follows
  add column if not exists follower_id uuid references public.profiles(id) on delete cascade default auth.uid(),
  add column if not exists target_id uuid references public.profiles(id) on delete cascade;
alter table public.app_notifications
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists actor_id uuid references public.profiles(id) on delete set null default auth.uid();
alter table public.app_reservations
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid(),
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade,
  add column if not exists idempotency_key text;
alter table public.app_waitlist_entries
  add column if not exists user_id uuid references public.profiles(id) on delete cascade default auth.uid(),
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

create unique index if not exists app_profiles_auth_user_idx
  on public.app_profiles(auth_user_id) where auth_user_id is not null;
create unique index if not exists app_reservations_user_idempotency_idx
  on public.app_reservations(user_id, idempotency_key) where idempotency_key is not null;

alter table public.reviews alter column author_id set default auth.uid();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.app_role;
begin
  requested_role := case
    when new.raw_user_meta_data->>'account_type' = 'restaurant_owner'
      then 'restaurant_owner'::public.app_role
    else 'user'::public.app_role
  end;

  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = excluded.email,
    updated_at = now();

  insert into public.app_profiles (
    legacy_id,
    auth_user_id,
    full_name,
    email,
    account_type,
    app_payload
  )
  values (
    new.id::text,
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    requested_role,
    jsonb_build_object(
      'id', new.id::text,
      'name', coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
      'email', new.email,
      'accountType', requested_role::text
    )
  )
  on conflict (legacy_id) do update set
    auth_user_id = excluded.auth_user_id,
    full_name = coalesce(excluded.full_name, public.app_profiles.full_name),
    email = excluded.email,
    account_type = excluded.account_type,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, requested_role)
  on conflict do nothing;

  return new;
end;
$$;

create or replace function public.owns_restaurant_legacy(
  target_legacy_id text,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.restaurants
    where restaurants.legacy_id = target_legacy_id
      and (
        restaurants.owner_id = target_user_id
        or restaurants.owner_legacy_id = target_user_id::text
      )
  );
$$;

-- Remove the compatibility policies that allowed anonymous writes.
drop policy if exists "App can read synced restaurant data" on public.restaurants;
drop policy if exists "App can sync published restaurant data" on public.restaurants;
drop policy if exists "App can update synced restaurant data" on public.restaurants;
drop policy if exists "App can delete synced restaurant seeds" on public.restaurants;
drop policy if exists "App can sync reviews" on public.reviews;
drop policy if exists "App can update synced reviews" on public.reviews;
drop policy if exists "App profiles are readable" on public.app_profiles;
drop policy if exists "App profiles can be synced" on public.app_profiles;
drop policy if exists "App favorites can be synced" on public.app_favorites;
drop policy if exists "Feed posts can be synced" on public.feed_posts;
drop policy if exists "Feed comments can be synced" on public.feed_comments;
drop policy if exists "Feed reactions can be synced" on public.feed_reactions;
drop policy if exists "Moderation reports can be synced" on public.moderation_reports;
drop policy if exists "User blocks can be synced" on public.user_blocks;
drop policy if exists "Invites can be synced" on public.invites;
drop policy if exists "Invite redemptions can be synced" on public.invite_redemptions;
drop policy if exists "Push tokens can be synced" on public.push_tokens;
drop policy if exists "Notification queue can be synced" on public.notification_queue;
drop policy if exists "Social follows are readable" on public.social_follows;
drop policy if exists "Social follows can be synced" on public.social_follows;
drop policy if exists "App notifications are readable" on public.app_notifications;
drop policy if exists "App notifications can be synced" on public.app_notifications;
drop policy if exists "app reservations compatibility select" on public.app_reservations;
drop policy if exists "app reservations compatibility write" on public.app_reservations;
drop policy if exists "app waitlist compatibility select" on public.app_waitlist_entries;
drop policy if exists "app waitlist compatibility write" on public.app_waitlist_entries;
drop policy if exists "App can upload restaurant media" on storage.objects;
drop policy if exists "App can update restaurant media" on storage.objects;

create policy "Owners can read legacy restaurants"
on public.restaurants for select to authenticated
using (public.owns_restaurant_legacy(legacy_id) or public.is_admin());

create policy "Owners can create legacy restaurants"
on public.restaurants for insert to authenticated
with check (
  owner_id = auth.uid()
  or owner_legacy_id = auth.uid()::text
  or public.is_admin()
);

create policy "Owners can update legacy restaurants"
on public.restaurants for update to authenticated
using (public.owns_restaurant_legacy(legacy_id) or public.is_admin())
with check (
  owner_id = auth.uid()
  or owner_legacy_id = auth.uid()::text
  or public.is_admin()
);

create policy "Authenticated authors can create reviews"
on public.reviews for insert to authenticated
with check (author_id = auth.uid() or author_legacy_id = auth.uid()::text);

create policy "App profiles are visible to members"
on public.app_profiles for select to authenticated
using (true);
create policy "Members manage their app profile"
on public.app_profiles for all to authenticated
using (auth_user_id = auth.uid() or legacy_id = auth.uid()::text)
with check (auth_user_id = auth.uid() or legacy_id = auth.uid()::text);

create policy "Members manage their favorites"
on public.app_favorites for all to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text)
with check (user_id = auth.uid() or user_legacy_id = auth.uid()::text);

create policy "Published feed posts are public"
on public.feed_posts for select to anon, authenticated
using (status = 'published');
create policy "Authors manage their feed posts"
on public.feed_posts for all to authenticated
using (author_id = auth.uid() or author_legacy_id = auth.uid()::text)
with check (author_id = auth.uid() or author_legacy_id = auth.uid()::text);

create policy "Published feed comments are public"
on public.feed_comments for select to anon, authenticated
using (status = 'published');
create policy "Authors manage their feed comments"
on public.feed_comments for all to authenticated
using (author_id = auth.uid() or author_legacy_id = auth.uid()::text)
with check (author_id = auth.uid() or author_legacy_id = auth.uid()::text);

create policy "Feed reactions are public"
on public.feed_reactions for select to anon, authenticated
using (active = true);
create policy "Members manage their feed reactions"
on public.feed_reactions for all to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text)
with check (user_id = auth.uid() or user_legacy_id = auth.uid()::text);

create policy "Members create their reports"
on public.moderation_reports for insert to authenticated
with check (reporter_id = auth.uid() or reporter_legacy_id = auth.uid()::text);
create policy "Members read their reports"
on public.moderation_reports for select to authenticated
using (reporter_id = auth.uid() or reporter_legacy_id = auth.uid()::text or public.is_admin());
create policy "Admins manage reports"
on public.moderation_reports for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Members manage their blocks"
on public.user_blocks for all to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text)
with check (user_id = auth.uid() or user_legacy_id = auth.uid()::text);

create policy "Members read follows"
on public.social_follows for select to authenticated
using (true);
create policy "Members manage their follows"
on public.social_follows for all to authenticated
using (follower_id = auth.uid() or follower_legacy_id = auth.uid()::text)
with check (follower_id = auth.uid() or follower_legacy_id = auth.uid()::text);

create policy "Members read their notifications"
on public.app_notifications for select to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text);
create policy "Members create activity notifications"
on public.app_notifications for insert to authenticated
with check (actor_id = auth.uid() or actor_legacy_id = auth.uid()::text);
create policy "Members update their notifications"
on public.app_notifications for update to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text)
with check (user_id = auth.uid() or user_legacy_id = auth.uid()::text);

create policy "Members manage their invites"
on public.invites for all to authenticated
using (owner_id = auth.uid() or owner_legacy_id = auth.uid()::text)
with check (owner_id = auth.uid() or owner_legacy_id = auth.uid()::text);
create policy "Members redeem invites"
on public.invite_redemptions for insert to authenticated
with check (user_id = auth.uid() or invited_user_legacy_id = auth.uid()::text);
create policy "Members read their redemptions"
on public.invite_redemptions for select to authenticated
using (user_id = auth.uid() or invited_user_legacy_id = auth.uid()::text);

create policy "Members manage their push tokens"
on public.push_tokens for all to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text)
with check (user_id = auth.uid() or user_legacy_id = auth.uid()::text);

create policy "Members read their queued notifications"
on public.notification_queue for select to authenticated
using (user_id = auth.uid() or user_legacy_id = auth.uid()::text);

create policy "Members read their reservations"
on public.app_reservations for select to authenticated
using (
  user_id = auth.uid()
  or user_legacy_id = auth.uid()::text
  or public.owns_restaurant_legacy(restaurant_legacy_id)
  or public.is_admin()
);

create policy "Members read their waitlist entries"
on public.app_waitlist_entries for select to authenticated
using (
  user_id = auth.uid()
  or user_legacy_id = auth.uid()::text
  or public.owns_restaurant_legacy(restaurant_legacy_id)
  or public.is_admin()
);
create policy "Members join a waitlist"
on public.app_waitlist_entries for insert to authenticated
with check (user_id = auth.uid() or user_legacy_id = auth.uid()::text);
create policy "Owners manage restaurant waitlists"
on public.app_waitlist_entries for update to authenticated
using (
  public.owns_restaurant_legacy(restaurant_legacy_id)
  or user_id = auth.uid()
  or user_legacy_id = auth.uid()::text
  or public.is_admin()
)
with check (
  public.owns_restaurant_legacy(restaurant_legacy_id)
  or user_id = auth.uid()
  or user_legacy_id = auth.uid()::text
  or public.is_admin()
);

create or replace function public.create_reservation_secure(
  p_restaurant_legacy_id text,
  p_reservation_date date,
  p_reservation_time time,
  p_party_size integer,
  p_payload jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns setof public.app_reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_restaurant public.restaurants%rowtype;
  existing_reservation public.app_reservations%rowtype;
  created_reservation public.app_reservations%rowtype;
  slot_capacity integer := 20;
  max_party_size integer := 12;
  occupied_seats integer := 0;
  auto_confirm boolean := true;
  reservations_enabled boolean := true;
  advance_days integer := 30;
  slot_minutes integer := 60;
  weekday_key text;
  weekday_settings jsonb;
  schedule_enabled boolean;
  schedule_start time;
  schedule_end time;
  default_schedule_enabled boolean;
  default_schedule_start time;
  default_schedule_end time;
  reservation_status text;
  reservation_legacy_id text;
begin
  if auth.uid() is null then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;
  if p_reservation_date < current_date then
    raise exception using errcode = '22023', message = 'INVALID_RESERVATION_DATE';
  end if;

  select *
  into target_restaurant
  from public.restaurants
  where legacy_id = p_restaurant_legacy_id
    and status = 'published'
  limit 1;
  if not found then
    raise exception using errcode = 'P0002', message = 'RESTAURANT_NOT_FOUND';
  end if;

  if p_idempotency_key is not null then
    select *
    into existing_reservation
    from public.app_reservations
    where user_id = auth.uid()
      and idempotency_key = p_idempotency_key;
    if found then
      return next existing_reservation;
      return;
    end if;
  end if;

  begin
    slot_capacity := coalesce(
      nullif(target_restaurant.app_payload #>> '{reservationSettings,capacityPerSlot}', '')::integer,
      20
    );
    max_party_size := coalesce(
      nullif(target_restaurant.app_payload #>> '{reservationSettings,maxPartySize}', '')::integer,
      12
    );
    auto_confirm := coalesce(
      nullif(target_restaurant.app_payload #>> '{reservationSettings,autoConfirm}', '')::boolean,
      true
    );
    reservations_enabled := coalesce(
      nullif(target_restaurant.app_payload #>> '{reservationSettings,enabled}', '')::boolean,
      true
    );
    advance_days := greatest(1, least(coalesce(
      nullif(target_restaurant.app_payload #>> '{reservationSettings,advanceDays}', '')::integer,
      30
    ), 90));
    slot_minutes := case
      when nullif(target_restaurant.app_payload #>> '{reservationSettings,slotMinutes}', '')::integer in (30, 60, 90)
        then (target_restaurant.app_payload #>> '{reservationSettings,slotMinutes}')::integer
      else 60
    end;
  exception when invalid_text_representation then
    slot_capacity := 20;
    max_party_size := 12;
    auto_confirm := true;
    reservations_enabled := true;
    advance_days := 30;
    slot_minutes := 60;
  end;

  if not reservations_enabled then
    raise exception using errcode = 'P0001', message = 'RESERVATIONS_DISABLED';
  end if;
  if p_reservation_date > current_date + advance_days then
    raise exception using errcode = '22023', message = 'RESERVATION_TOO_FAR';
  end if;
  if p_party_size < 1 or p_party_size > greatest(1, least(max_party_size, 50)) then
    raise exception using errcode = '22023', message = 'INVALID_PARTY_SIZE';
  end if;

  weekday_key := (array[
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday'
  ])[extract(dow from p_reservation_date)::integer + 1];
  default_schedule_enabled := extract(dow from p_reservation_date)::integer <> 1;
  default_schedule_start := case extract(dow from p_reservation_date)::integer
    when 0 then '11:30'::time
    when 6 then '11:30'::time
    else '18:00'::time
  end;
  default_schedule_end := case extract(dow from p_reservation_date)::integer
    when 0 then '15:30'::time
    when 6 then '23:00'::time
    when 5 then '23:00'::time
    else '22:00'::time
  end;
  weekday_settings := target_restaurant.app_payload
    #> array['reservationSettings', 'weekly', weekday_key];
  begin
    schedule_enabled := coalesce(
      nullif(weekday_settings->>'enabled', '')::boolean,
      default_schedule_enabled
    );
    schedule_start := coalesce(nullif(weekday_settings->>'start', '')::time, default_schedule_start);
    schedule_end := coalesce(nullif(weekday_settings->>'end', '')::time, default_schedule_end);
  exception when invalid_text_representation then
    raise exception using errcode = '22023', message = 'INVALID_RESTAURANT_SCHEDULE';
  end;
  if not schedule_enabled
    or schedule_end <= schedule_start
    or p_reservation_time < schedule_start
    or p_reservation_time >= schedule_end
    or mod(
      (extract(epoch from (p_reservation_time - schedule_start)) / 60)::integer,
      slot_minutes
    ) <> 0
  then
    raise exception using errcode = '22023', message = 'INVALID_RESERVATION_SLOT';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      p_restaurant_legacy_id || '|' || p_reservation_date::text || '|' || p_reservation_time::text,
      0
    )
  );

  if p_idempotency_key is not null then
    select *
    into existing_reservation
    from public.app_reservations
    where user_id = auth.uid()
      and idempotency_key = p_idempotency_key;
    if found then
      return next existing_reservation;
      return;
    end if;
  end if;

  select coalesce(sum(party_size), 0)::integer
  into occupied_seats
  from public.app_reservations
  where restaurant_legacy_id = p_restaurant_legacy_id
    and reservation_date = p_reservation_date
    and reservation_time = p_reservation_time
    and status not in ('cancelled', 'no_show');

  if occupied_seats + p_party_size > greatest(1, slot_capacity) then
    raise exception using errcode = 'P0001', message = 'SLOT_FULL';
  end if;

  reservation_status := case when auto_confirm then 'confirmed' else 'pending' end;
  reservation_legacy_id := coalesce(nullif(p_idempotency_key, ''), gen_random_uuid()::text);

  insert into public.app_reservations (
    legacy_id,
    restaurant_legacy_id,
    user_legacy_id,
    user_id,
    restaurant_id,
    reservation_date,
    reservation_time,
    party_size,
    status,
    idempotency_key,
    app_payload
  )
  values (
    reservation_legacy_id,
    p_restaurant_legacy_id,
    auth.uid()::text,
    auth.uid(),
    target_restaurant.id,
    p_reservation_date,
    p_reservation_time,
    p_party_size,
    reservation_status,
    p_idempotency_key,
    coalesce(p_payload, '{}'::jsonb) || jsonb_build_object(
      'id', reservation_legacy_id,
      'restaurantId', p_restaurant_legacy_id,
      'userId', auth.uid()::text,
      'status', reservation_status
    )
  )
  returning * into created_reservation;

  return next created_reservation;
end;
$$;

create or replace function public.update_reservation_status_secure(
  p_legacy_id text,
  p_status text
)
returns setof public.app_reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_reservation public.app_reservations%rowtype;
  is_owner boolean;
begin
  if auth.uid() is null then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;
  if p_status not in ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show') then
    raise exception using errcode = '22023', message = 'INVALID_RESERVATION_STATUS';
  end if;

  select * into target_reservation
  from public.app_reservations
  where legacy_id = p_legacy_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'RESERVATION_NOT_FOUND';
  end if;

  is_owner := public.owns_restaurant_legacy(target_reservation.restaurant_legacy_id);
  if not is_owner
    and not public.is_admin()
    and not (
      (target_reservation.user_id = auth.uid() or target_reservation.user_legacy_id = auth.uid()::text)
      and p_status = 'cancelled'
    )
  then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  update public.app_reservations
  set
    status = p_status,
    app_payload = app_payload || jsonb_build_object('status', p_status, 'updatedAt', now()),
    updated_at = now()
  where legacy_id = p_legacy_id
  returning * into target_reservation;

  return next target_reservation;
end;
$$;

revoke all on function public.create_reservation_secure(text, date, time, integer, jsonb, text) from public, anon;
grant execute on function public.create_reservation_secure(text, date, time, integer, jsonb, text) to authenticated;
revoke all on function public.update_reservation_status_secure(text, text) from public, anon;
grant execute on function public.update_reservation_status_secure(text, text) to authenticated;
