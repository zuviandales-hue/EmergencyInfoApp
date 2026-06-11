alter table public.profiles enable row level security;
alter table public.scan_events enable row level security;
alter table public.profiles force row level security;
alter table public.scan_events force row level security;

alter table public.scan_events
  add column if not exists scanner_ip_hash text,
  add column if not exists alert_sent boolean not null default false;

create index if not exists scan_events_rate_limit_idx
on public.scan_events(profile_id, scanner_ip_hash, created_at desc);

alter table public.profiles
  drop constraint if exists profiles_public_slug_check;

alter table public.profiles
  add constraint profiles_public_slug_check check (char_length(public_slug) >= 16);

drop policy if exists "Public can read active profiles" on public.profiles;
drop policy if exists "Public can create scan events for active profiles" on public.scan_events;

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
