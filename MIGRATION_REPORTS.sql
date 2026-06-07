-- Reports Table
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  period text not null,
  title text not null,
  report_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reports enable row level security;

-- Create RLS Policies
create policy "Users can view own reports" on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.reports for insert with check (auth.uid() = user_id);
create policy "Users can delete own reports" on public.reports for delete using (auth.uid() = user_id);
