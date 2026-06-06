-- Run this SQL in your Supabase SQL Editor to fix the 'user_settings' table error

-- 1. Create the user_settings table
create table if_not_exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text,
  preferred_currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_settings enable row level security;

-- 3. Create RLS Policies
-- Users can only see their own settings
create policy "Users can view own settings" 
on public.user_settings for select 
using (auth.uid() = user_id);

-- Users can only insert their own settings
create policy "Users can insert own settings" 
on public.user_settings for insert 
with check (auth.uid() = user_id);

-- Users can only update their own settings
create policy "Users can update own settings" 
on public.user_settings for update 
using (auth.uid() = user_id);

-- 4. Trigger for updated_at (Optional but recommended)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.user_settings
for each row
execute procedure public.handle_updated_at();
