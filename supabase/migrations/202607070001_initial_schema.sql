-- Yummi initial database schema

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.app_role as enum ('user', 'restaurant_owner', 'admin');
create type public.restaurant_status as enum ('draft', 'pending', 'published', 'rejected', 'archived');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email citext unique,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  cuisine_type text not null,
  district text not null,
  price_tier text not null default '$$' check (price_tier in ('$', '$$', '$$$', '$$$$')),
  status public.restaurant_status not null default 'pending',
  description text,
  address text,
  city text not null default 'Sao Jose do Rio Preto',
  state text not null default 'SP',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  whatsapp text,
  phone text,
  instagram text,
  reservation_url text,
  website_url text,
  cover_image_url text,
  logo_url text,
  tags text[] not null default '{}',
  opening_hours jsonb not null default '{}'::jsonb,
  is_open boolean not null default true,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 10),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  views_count integer not null default 0 check (views_count >= 0),
  whatsapp_clicks_count integer not null default 0 check (whatsapp_clicks_count >= 0),
  maps_clicks_count integer not null default 0 check (maps_clicks_count >= 0),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  status public.request_status not null default 'pending',
  name text not null,
  cuisine_type text not null,
  district text not null,
  price_tier text not null default '$$' check (price_tier in ('$', '$$', '$$$', '$$$$')),
  description text,
  address text,
  whatsapp text,
  instagram text,
  image_url text,
  notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_photos (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  image_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  visit_date date,
  food_score numeric(3, 1) not null check (food_score >= 0 and food_score <= 10),
  service_score numeric(3, 1) not null check (service_score >= 0 and service_score <= 10),
  ambience_score numeric(3, 1) not null check (ambience_score >= 0 and ambience_score <= 10),
  price_score numeric(3, 1) not null check (price_score >= 0 and price_score <= 10),
  experience_score numeric(3, 1) not null check (experience_score >= 0 and experience_score <= 10),
  average_score numeric(3, 1) generated always as (
    round(((food_score + service_score + ambience_score + price_score + experience_score) / 5.0)::numeric, 1)
  ) stored,
  comment text,
  status public.review_status not null default 'pending',
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);

create table public.restaurant_metrics_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'whatsapp_click', 'maps_click', 'reservation_click', 'instagram_click')),
  user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index restaurants_status_idx on public.restaurants(status);
create index restaurants_district_idx on public.restaurants(district);
create index restaurants_cuisine_type_idx on public.restaurants(cuisine_type);
create index restaurants_rating_idx on public.restaurants(rating desc);
create index restaurants_tags_idx on public.restaurants using gin(tags);
create index restaurant_requests_status_idx on public.restaurant_requests(status);
create index reviews_restaurant_status_idx on public.reviews(restaurant_id, status);
create index dishes_restaurant_idx on public.dishes(restaurant_id);
create index restaurant_photos_restaurant_idx on public.restaurant_photos(restaurant_id);
create index metrics_restaurant_event_idx on public.restaurant_metrics_events(restaurant_id, event_type, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

create trigger restaurant_requests_set_updated_at
before update on public.restaurant_requests
for each row execute function public.set_updated_at();

create trigger dishes_set_updated_at
before update on public.dishes
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_roles.user_id = $1
      and role = 'admin'
  );
$$;

create or replace function public.owns_restaurant(restaurant_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.restaurants
    where restaurants.id = $1
      and restaurants.owner_id = $2
  );
$$;

create or replace function public.refresh_restaurant_rating(target_restaurant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.restaurants
  set
    rating = coalesce((
      select round(avg(average_score)::numeric, 2)
      from public.reviews
      where restaurant_id = target_restaurant_id
        and status = 'approved'
    ), 0),
    reviews_count = (
      select count(*)::integer
      from public.reviews
      where restaurant_id = target_restaurant_id
        and status = 'approved'
    )
  where id = target_restaurant_id;
end;
$$;

create or replace function public.refresh_restaurant_rating_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_restaurant_rating(old.restaurant_id);
    return old;
  end if;

  perform public.refresh_restaurant_rating(new.restaurant_id);
  return new;
end;
$$;

create trigger reviews_refresh_restaurant_rating
after insert or update or delete on public.reviews
for each row execute function public.refresh_restaurant_rating_trigger();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_requests enable row level security;
alter table public.restaurant_photos enable row level security;
alter table public.dishes enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.restaurant_metrics_events enable row level security;
alter table public.admin_logs enable row level security;

create policy "Profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can read roles"
on public.user_roles for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Published restaurants are public"
on public.restaurants for select
to anon, authenticated
using (status = 'published' or public.is_admin() or owner_id = auth.uid());

create policy "Owners can create restaurants"
on public.restaurants for insert
to authenticated
with check (owner_id = auth.uid() or public.is_admin());

create policy "Owners can update their restaurants"
on public.restaurants for update
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

create policy "Admins can delete restaurants"
on public.restaurants for delete
to authenticated
using (public.is_admin());

create policy "Users can create restaurant requests"
on public.restaurant_requests for insert
to authenticated
with check (requester_id = auth.uid());

create policy "Users can read their own restaurant requests"
on public.restaurant_requests for select
to authenticated
using (requester_id = auth.uid() or public.is_admin());

create policy "Admins can update restaurant requests"
on public.restaurant_requests for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Published restaurant photos are public"
on public.restaurant_photos for select
to anon, authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = restaurant_photos.restaurant_id
      and (restaurants.status = 'published' or restaurants.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners can manage restaurant photos"
on public.restaurant_photos for all
to authenticated
using (public.owns_restaurant(restaurant_id) or public.is_admin())
with check (public.owns_restaurant(restaurant_id) or public.is_admin());

create policy "Published restaurant dishes are public"
on public.dishes for select
to anon, authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = dishes.restaurant_id
      and (restaurants.status = 'published' or restaurants.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners can manage dishes"
on public.dishes for all
to authenticated
using (public.owns_restaurant(restaurant_id) or public.is_admin())
with check (public.owns_restaurant(restaurant_id) or public.is_admin());

create policy "Approved reviews are public"
on public.reviews for select
to anon, authenticated
using (status = 'approved' or author_id = auth.uid() or public.is_admin());

create policy "Authenticated users can create reviews"
on public.reviews for insert
to authenticated
with check (author_id = auth.uid());

create policy "Authors can update pending reviews"
on public.reviews for update
to authenticated
using (author_id = auth.uid() and status = 'pending')
with check (author_id = auth.uid() and status = 'pending');

create policy "Admins can moderate reviews"
on public.reviews for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read their favorites"
on public.favorites for select
to authenticated
using (user_id = auth.uid());

create policy "Users can manage their favorites"
on public.favorites for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Anyone can create metrics events"
on public.restaurant_metrics_events for insert
to anon, authenticated
with check (true);

create policy "Owners can read restaurant metrics"
on public.restaurant_metrics_events for select
to authenticated
using (public.owns_restaurant(restaurant_id) or public.is_admin());

create policy "Admins can read logs"
on public.admin_logs for select
to authenticated
using (public.is_admin());

create policy "Admins can create logs"
on public.admin_logs for insert
to authenticated
with check (public.is_admin());
