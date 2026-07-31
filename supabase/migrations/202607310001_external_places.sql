-- Map-only restaurant coverage sourced from open datasets.
-- External places stay separate from Dine partners until an owner claim is approved.

create table if not exists public.external_places (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  name text not null,
  basic_category text,
  category text,
  address text,
  district text,
  city text,
  state text,
  postcode text,
  country_code text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  confidence double precision check (confidence between 0 and 1),
  operating_status text,
  source_license text,
  source_updated_at timestamptz,
  last_synced_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'hidden', 'claimed')),
  claimed_restaurant_id uuid references public.restaurants(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists external_places_geo_idx
  on public.external_places(latitude, longitude)
  where status = 'active';
create index if not exists external_places_city_idx
  on public.external_places(city, state)
  where status = 'active';
create index if not exists external_places_name_idx
  on public.external_places(lower(name));

create table if not exists public.external_place_claims (
  id uuid primary key default gen_random_uuid(),
  external_place_id uuid not null references public.external_places(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  claimant_name text not null,
  claimant_email citext,
  claimant_phone text not null,
  claimant_cnpj text not null check (claimant_cnpj ~ '^[0-9]{14}$'),
  restaurant_name text not null,
  restaurant_address text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  notes text,
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists external_place_claims_pending_idx
  on public.external_place_claims(external_place_id, claimant_id)
  where status = 'pending';
create index if not exists external_place_claims_status_idx
  on public.external_place_claims(status, created_at desc);

alter table public.external_places enable row level security;
alter table public.external_place_claims enable row level security;

create policy "Active external places are public"
on public.external_places for select
to anon, authenticated
using (status = 'active');

create policy "Admins manage external places"
on public.external_places for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Restaurant owners create external claims"
on public.external_place_claims for insert
to authenticated
with check (
  claimant_id = auth.uid()
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role in ('restaurant_owner', 'admin')
  )
);

create policy "Owners read their external claims"
on public.external_place_claims for select
to authenticated
using (claimant_id = auth.uid() or public.is_admin());

create policy "Admins review external claims"
on public.external_place_claims for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

comment on table public.external_places is
  'Map-only places imported from licensed external datasets; not Dine partner profiles.';
comment on table public.external_place_claims is
  'Owner requests to convert an external map place into a verified Dine restaurant.';

create or replace function public.review_external_place_claim(
  target_claim_id uuid,
  decision text,
  reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  claim_record record;
  created_restaurant_id uuid;
  generated_legacy_id text;
  generated_slug text;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if decision not in ('approved', 'rejected') then
    raise exception 'INVALID_DECISION';
  end if;

  select
    claims.*,
    places.name as place_name,
    places.basic_category,
    places.category,
    places.address as place_address,
    places.district as place_district,
    places.city as place_city,
    places.state as place_state,
    places.latitude as place_latitude,
    places.longitude as place_longitude
  into claim_record
  from public.external_place_claims as claims
  join public.external_places as places on places.id = claims.external_place_id
  where claims.id = target_claim_id
  for update;

  if not found then
    raise exception 'CLAIM_NOT_FOUND';
  end if;
  if claim_record.status <> 'pending' then
    raise exception 'CLAIM_ALREADY_REVIEWED';
  end if;

  if decision = 'approved' then
    generated_legacy_id := 'claimed-' || target_claim_id::text;
    generated_slug := trim(both '-' from regexp_replace(lower(claim_record.restaurant_name), '[^a-z0-9]+', '-', 'g'))
      || '-' || substr(target_claim_id::text, 1, 8);

    insert into public.restaurants (
      owner_id,
      legacy_id,
      owner_legacy_id,
      name,
      slug,
      cuisine_type,
      district,
      status,
      description,
      address,
      city,
      state,
      latitude,
      longitude,
      submitted_at,
      app_payload
    ) values (
      claim_record.claimant_id,
      generated_legacy_id,
      claim_record.claimant_id::text,
      claim_record.restaurant_name,
      generated_slug,
      coalesce(nullif(claim_record.category, ''), nullif(claim_record.basic_category, ''), 'Restaurante'),
      coalesce(nullif(claim_record.place_district, ''), 'A confirmar'),
      'draft'::public.restaurant_status,
      'Perfil criado a partir de uma reivindicação aprovada. Complete os dados antes de publicar.',
      coalesce(claim_record.restaurant_address, claim_record.place_address),
      coalesce(claim_record.place_city, 'Sao Jose do Rio Preto'),
      coalesce(claim_record.place_state, 'SP'),
      claim_record.place_latitude,
      claim_record.place_longitude,
      now(),
      jsonb_build_object(
        'id', generated_legacy_id,
        'ownerId', claim_record.claimant_id::text,
        'name', claim_record.restaurant_name,
        'type', coalesce(nullif(claim_record.category, ''), 'Restaurante'),
        'district', coalesce(nullif(claim_record.place_district, ''), 'A confirmar'),
        'status', 'draft',
        'address', coalesce(claim_record.restaurant_address, claim_record.place_address),
        'latitude', claim_record.place_latitude,
        'longitude', claim_record.place_longitude,
        'claimId', target_claim_id::text
      )
    )
    returning id into created_restaurant_id;

    update public.external_places
    set
      status = 'claimed',
      claimed_restaurant_id = created_restaurant_id,
      updated_at = now()
    where id = claim_record.external_place_id;
  end if;

  update public.external_place_claims
  set
    status = decision,
    rejection_reason = case when decision = 'rejected' then nullif(trim(reason), '') else null end,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = target_claim_id;

  return created_restaurant_id;
end;
$$;

revoke all on function public.review_external_place_claim(uuid, text, text) from public;
grant execute on function public.review_external_place_claim(uuid, text, text) to authenticated;
