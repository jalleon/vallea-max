-- =====================================================
-- FIX: Remove the updated_at trigger that's causing errors
-- =====================================================
-- The users table doesn't need an updated_at auto-update trigger
-- because Supabase doesn't automatically track this field

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS update_users_timestamp ON public.users;

-- Drop the function
DROP FUNCTION IF EXISTS update_users_updated_at();

-- Remove updated_at column if it exists (it's not being used anyway)
ALTER TABLE public.users DROP COLUMN IF EXISTS updated_at;
