-- =====================================================
-- SECURE ADMIN SYSTEM WITH PROPER AUTHENTICATION
-- =====================================================

-- Step 1: Add admin role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Step 3: Update RLS policies to allow admin users to view all data

-- Profiles: Admins can view all profiles, users can view their own
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile or admins can view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Waitlist: Only admins can view
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Service role can view waitlist" ON waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON waitlist;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Demo requests: Only admins can view
DROP POLICY IF EXISTS "Anyone can add demo requests" ON demo_requests;
DROP POLICY IF EXISTS "Service role can view demo requests" ON demo_requests;
DROP POLICY IF EXISTS "Authenticated users can view demo requests" ON demo_requests;

CREATE POLICY "Anyone can add demo requests"
  ON demo_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view demo requests"
  ON demo_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- User subscriptions: Admins can view all, users can view their own
DROP POLICY IF EXISTS "Authenticated users can view all subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view own subscription or admins can view all"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Step 4: Enable RLS on all tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 5: Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_admin IS 'TRUE if user has admin privileges to access admin dashboard';
COMMENT ON FUNCTION is_admin_user() IS 'Returns TRUE if current authenticated user is an admin';

-- Step 6: Manual step - Set your email as admin
-- Run this command separately, replacing with your actual email:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

COMMENT ON TABLE profiles IS 'User profiles with admin role support. Use is_admin column to grant admin access.';
