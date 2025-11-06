-- =====================================================
-- SET ADMIN USER
-- =====================================================
-- This script makes a specific user an admin
-- Replace 'your-email@example.com' with your actual email
-- =====================================================

-- Option 1: Set admin by email (recommended)
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

-- Option 2: Set admin by user ID
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-id-here';

-- Option 3: View all users to find your email/ID
-- SELECT id, email, full_name, is_admin FROM profiles ORDER BY created_at DESC;

-- After setting yourself as admin, verify:
-- SELECT email, is_admin FROM profiles WHERE is_admin = true;

-- INSTRUCTIONS:
-- 1. First, run: SELECT id, email, full_name, is_admin FROM profiles ORDER BY created_at DESC;
-- 2. Find your email in the results
-- 3. Then run: UPDATE profiles SET is_admin = true WHERE email = 'your-actual-email@example.com';
-- 4. Verify: SELECT email, is_admin FROM profiles WHERE is_admin = true;
