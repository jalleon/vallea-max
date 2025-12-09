-- =====================================================
-- CREATE PUBLIC.USERS TABLE
-- =====================================================
-- This table extends auth.users with additional user profile data
-- It's separate from the profiles table which is for organization membership

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,

  -- API Key Settings
  can_use_own_api_keys BOOLEAN DEFAULT false,
  api_key_secret_enabled BOOLEAN DEFAULT false,

  -- Scan Credits System
  scan_credits_quota INTEGER DEFAULT 20,
  scan_credits_used INTEGER DEFAULT 0,
  scan_credits_reset_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month'),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_credits ON public.users(scan_credits_used, scan_credits_quota);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- RLS POLICIES FOR PUBLIC.USERS
-- =====================================================

-- Users can read their own record
CREATE POLICY "Users can view own record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything
CREATE POLICY "Service role has full access"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TRIGGER TO UPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- =====================================================
-- UPDATE EXISTING TRIGGER TO CREATE USER RECORD
-- =====================================================
-- This ensures when someone signs up, a record is created in public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile in public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    scan_credits_quota,
    scan_credits_used,
    scan_credits_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    20, -- Default quota
    0,  -- No credits used yet
    now() + INTERVAL '1 month'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BACKFILL EXISTING USERS
-- =====================================================
-- Create records for any existing auth.users that don't have a public.users record
INSERT INTO public.users (
  id,
  email,
  full_name,
  scan_credits_quota,
  scan_credits_used,
  scan_credits_reset_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  20, -- Default quota
  0,  -- No credits used yet
  now() + INTERVAL '1 month'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
