-- Distinguish the two onboarding experiences used by the current Expo client.
-- Existing profiles remain consumer accounts for backwards compatibility.

alter table public.app_profiles
  add column if not exists account_type public.app_role not null default 'user';

update public.app_profiles
set account_type = case
  when app_payload ->> 'accountType' = 'restaurant_owner' then 'restaurant_owner'::public.app_role
  else 'user'::public.app_role
end;

create index if not exists app_profiles_account_type_idx
  on public.app_profiles(account_type);
