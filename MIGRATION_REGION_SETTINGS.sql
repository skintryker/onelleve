-- Add language and date_format columns to user_settings
alter table public.user_settings 
add column if not exists language text default 'en',
add column if not exists date_format text default 'MM/DD/YYYY';
