-- Run this SQL in your Supabase SQL Editor to add the 'already_included_in_bank_balance' column to the 'income_log' table

-- 1. Add the column with a default value of false
ALTER TABLE public.income_log 
ADD COLUMN IF NOT EXISTS already_included_in_bank_balance BOOLEAN DEFAULT false;

-- 2. Update the RLS policies if necessary (not usually needed for just adding a column)
-- The existing policies for income_log will cover this new column.
