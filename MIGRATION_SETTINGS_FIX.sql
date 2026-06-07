-- Comprehensive Settings Fix Migration
-- Run this in Supabase SQL Editor

alter table public.user_settings 
add column if not exists language text default 'en',
add column if not exists date_format text default 'MM/DD/YYYY',
add column if not exists email_notifications boolean default false,
add column if not exists payment_reminders boolean default false,
add column if not exists due_day_reminders boolean default false,
add column if not exists monthly_summary boolean default false,
add column if not exists investment_reminders boolean default false;

-- Force schema cache refresh by adding and dropping a dummy column (standard trick for Supabase/PostgREST cache issues)
alter table public.user_settings add column if not exists _cache_refresh boolean;
alter table public.user_settings drop column if exists _cache_refresh;
