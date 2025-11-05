-- =====================================================
-- DIAGNOSE USER SETUP ISSUES
-- =====================================================
-- Run this to see what's missing
-- =====================================================

-- Check 1: Organizations exist?
SELECT
  '1. Organizations' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN 'FAIL - No organizations exist'
    ELSE 'PASS - ' || COUNT(*) || ' organization(s) found'
  END as status
FROM organizations;

SELECT * FROM organizations;

-- Check 2: Users table has records?
SELECT
  '2. Public Users Table' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN 'FAIL - No users in public.users table'
    ELSE 'PASS - ' || COUNT(*) || ' user(s) found'
  END as status
FROM users;

-- Check 3: Users have organization_id?
SELECT
  '3. Users Organization Assignment' as check_name,
  COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as users_with_org,
  COUNT(*) FILTER (WHERE organization_id IS NULL) as users_without_org,
  CASE
    WHEN COUNT(*) FILTER (WHERE organization_id IS NULL) > 0 THEN 'FAIL - Some users missing organization_id'
    WHEN COUNT(*) = 0 THEN 'FAIL - No users exist'
    ELSE 'PASS - All users have organization_id'
  END as status
FROM users;

-- Check 4: Detailed user information
SELECT
  '4. User Details' as check_name,
  u.id,
  u.email,
  u.organization_id,
  CASE WHEN u.organization_id IS NULL THEN 'MISSING ❌' ELSE 'OK ✓' END as org_status,
  u.role,
  o.name as org_name
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id;

-- Check 5: Auth users metadata
SELECT
  '5. Auth Users Metadata' as check_name,
  au.id,
  au.email,
  au.raw_user_meta_data->'organization_id' as org_in_metadata,
  CASE
    WHEN au.raw_user_meta_data->'organization_id' IS NULL THEN 'MISSING ❌'
    ELSE 'OK ✓'
  END as metadata_status
FROM auth.users au;

-- Check 6: RLS Policy Test
SELECT
  '6. RLS Policy Check' as check_name,
  u.id as user_id,
  u.organization_id as org_in_users_table,
  (SELECT organization_id FROM users WHERE id = u.id) as org_from_subquery,
  CASE
    WHEN u.organization_id IS NOT NULL AND (SELECT organization_id FROM users WHERE id = u.id) IS NOT NULL
    THEN 'PASS - RLS will work ✓'
    ELSE 'FAIL - RLS will block inserts ❌'
  END as rls_status
FROM users u;

-- Summary
SELECT
  '=== SUMMARY ===' as summary,
  (SELECT COUNT(*) FROM organizations) as total_organizations,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE organization_id IS NOT NULL) as users_with_org,
  (SELECT COUNT(*) FROM users WHERE organization_id IS NULL) as users_without_org,
  CASE
    WHEN (SELECT COUNT(*) FROM organizations) = 0 THEN 'Create organization first'
    WHEN (SELECT COUNT(*) FROM users WHERE organization_id IS NULL) > 0 THEN 'Run fix-user-organization-complete.sql'
    ELSE 'Setup looks good!'
  END as action_needed;
