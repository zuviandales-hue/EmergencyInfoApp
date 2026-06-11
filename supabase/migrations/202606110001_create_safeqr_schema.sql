create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  photo_url text,
  emergency_contacts jsonb not null default '[]'::jsonb,
  allergies text,
  medications text,
  emergency_instructions text,
  lost_mode_enabled boolean not null default false,
  lost_mode_message text,
  public_slug text not null unique check (char_length(public_slug) >= 16),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scanner_lat double precision,
  scanner_lng double precision,
  scanner_accuracy double precision,
  scanner_ip_hash text,
  scanner_user_agent text,
  alert_sent boolean not null default false,
  created_at timestamptz not null default now(),
  constraint scan_events_lat_range check (scanner_lat is null or scanner_lat between -90 and 90),
  constraint scan_events_lng_range check (scanner_lng is null or scanner_lng between -180 and 180)
);

create index if not exists profiles_owner_id_idx on public.profiles(owner_id);
create index if not exists profiles_public_slug_active_idx on public.profiles(public_slug) where is_active = true;
create index if not exists scan_events_profile_id_created_at_idx on public.scan_events(profile_id, created_at desc);
create index if not exists scan_events_rate_limit_idx on public.scan_events(profile_id, scanner_ip_hash, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.scan_events enable row level security;
alter table public.profiles force row level security;
alter table public.scan_events force row level security;

drop policy if exists "Owners can read profiles" on public.profiles;
create policy "Owners can read profiles"
on public.profiles
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Owners can insert profiles" on public.profiles;
create policy "Owners can insert profiles"
on public.profiles
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Owners can update profiles" on public.profiles;
create policy "Owners can update profiles"
on public.profiles
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete profiles" on public.profiles;
create policy "Owners can delete profiles"
on public.profiles
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Public can read active profiles" on public.profiles;

drop policy if exists "Public can create scan events for active profiles" on public.scan_events;

drop policy if exists "Owners can read profile scan events" on public.scan_events;
create policy "Owners can read profile scan events"
on public.scan_events
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = scan_events.profile_id
      and profiles.owner_id = auth.uid()
  )
);
