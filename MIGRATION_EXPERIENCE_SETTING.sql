-- Run this SQL in your Supabase SQL Editor to add the 'preferred_experience' column to the 'user_settings' table

-- 1. Add the column with a default value of NULL
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS preferred_experience TEXT DEFAULT NULL;

-- 2. Verify the column exists
-- SELECT preferred_experience FROM public.user_settings LIMIT 1;
