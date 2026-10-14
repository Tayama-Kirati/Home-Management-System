 

create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  invite_code text unique not null
                default upper(left(replace(gen_random_uuid()::text, '-', ''), 8)),
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  name         text not null default '',
  avatar       text not null default 'U',
  role         text not null default 'Parent',
  household_id uuid references public.households on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists public.household_data (
  household_id uuid references public.households on delete cascade primary key,
  data         jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);

-- ── Row-Level Security ───────────────────────────────────────────────────────

alter table public.households    enable row level security;
alter table public.profiles      enable row level security;
alter table public.household_data enable row level security;

-- profiles: each user manages their own row
create policy "profiles_own_all" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- households: anyone can insert (signup creates a household); members can read theirs
create policy "households_insert" on public.households
  for insert with check (true);

create policy "households_member_select" on public.households
  for select using (
    id in (select household_id from public.profiles where id = auth.uid())
  );

-- household_data: household members can read and write
create policy "hdata_member_select" on public.household_data
  for select using (
    household_id in (select household_id from public.profiles where id = auth.uid())
  );

create policy "hdata_member_insert" on public.household_data
  for insert with check (
    household_id in (select household_id from public.profiles where id = auth.uid())
  );

create policy "hdata_member_update" on public.household_data
  for update using (
    household_id in (select household_id from public.profiles where id = auth.uid())
  );

-- ── Trigger: auto-create profile on signup ──────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
