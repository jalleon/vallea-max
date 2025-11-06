-- =====================================================
-- FIX INFINITE RECURSION IN ADMIN POLICIES
-- =====================================================
-- Replace inline SELECT with is_admin_user() function to avoid recursion

-- Fix profiles policy
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON profiles;

CREATE POLICY "Users can view own profile or admins can view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    is_admin_user()
  );

-- Fix waitlist policy
DROP POLICY IF EXISTS "Admins can view waitlist" ON waitlist;

CREATE POLICY "Admins can view waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (is_admin_user());

-- Fix demo_requests policy
DROP POLICY IF EXISTS "Admins can view demo requests" ON demo_requests;

CREATE POLICY "Admins can view demo requests"
  ON demo_requests
  FOR SELECT
  TO authenticated
  USING (is_admin_user());

-- Fix user_subscriptions policy
DROP POLICY IF EXISTS "Users can view own subscription or admins can view all" ON user_subscriptions;

CREATE POLICY "Users can view own subscription or admins can view all"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin_user()
  );
