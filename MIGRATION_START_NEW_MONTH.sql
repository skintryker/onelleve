-- Start New Month Feature Migration

-- 1. Monthly Archives Table
create table if not exists public.monthly_archives (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  year text not null,
  snapshot_data jsonb not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.monthly_archives enable row level security;

-- RLS Policies
create policy "Users can view own archives" on public.monthly_archives for select using (auth.uid() = user_id);
create policy "Users can insert own archives" on public.monthly_archives for insert with check (auth.uid() = user_id);

-- 2. Add last_reset_date to user_settings
alter table public.user_settings add column if not exists last_reset_date timestamptz;
