-- Run this SQL in your Supabase SQL Editor to add CD-specific fields to the investments table

alter table public.investments 
add column if not exists tenor text,
add column if not exists rate numeric,
add column if not exists value_date date,
add column if not exists maturity_date date;
