-- =====================================================
-- FIX PROPERTIES ACCESS AFTER ORGANIZATION CHANGE
-- =====================================================
-- This script helps you regain access to your properties
-- Choose one of the two options below
-- =====================================================

-- =====================================================
-- STEP 1: DIAGNOSE THE ISSUE
-- =====================================================

-- Show all organizations
SELECT
  '=== ALL ORGANIZATIONS ===' as section,
  id,
  name,
  subscription_tier,
  created_at
FROM organizations
ORDER BY created_at;

-- Show current user and their organization
SELECT
  '=== YOUR CURRENT ASSIGNMENT ===' as section,
  u.email,
  u.organization_id as current_org_id,
  o.name as current_org_name
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
LIMIT 1;

-- Show all properties and which organization they belong to
SELECT
  '=== ALL PROPERTIES BY ORGANIZATION ===' as section,
  o.name as organization_name,
  o.id as organization_id,
  COUNT(*) as property_count
FROM properties p
JOIN organizations o ON p.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY property_count DESC;

-- Show detailed property list
SELECT
  '=== DETAILED PROPERTY LIST ===' as section,
  p.id,
  p.adresse,
  p.ville,
  p.organization_id,
  o.name as organization_name,
  p.created_at
FROM properties p
LEFT JOIN organizations o ON p.organization_id = o.id
ORDER BY p.created_at DESC
LIMIT 20;

-- =====================================================
-- OPTION A: MOVE PROPERTIES TO YOUR NEW ORGANIZATION
-- =====================================================
-- Use this if you want to keep your current organization
-- and bring all the old properties to it
--
-- Instructions:
-- 1. Look at the organization ID from "YOUR CURRENT ASSIGNMENT" above
-- 2. Look at which organization has your properties
-- 3. Uncomment the DO block below
-- 4. Update the v_old_org_id with the organization that has your properties
-- 5. Update the v_new_org_id with your current organization ID
-- 6. Run the script

/*
DO $$
DECLARE
  v_old_org_id UUID := 'OLD_ORGANIZATION_ID_HERE';  -- CHANGE: Org that has your properties
  v_new_org_id UUID := 'NEW_ORGANIZATION_ID_HERE';  -- CHANGE: Your current org
  v_properties_moved INTEGER;
BEGIN
  -- Move all properties from old org to new org
  UPDATE properties
  SET organization_id = v_new_org_id
  WHERE organization_id = v_old_org_id;

  GET DIAGNOSTICS v_properties_moved = ROW_COUNT;

  RAISE NOTICE 'SUCCESS: Moved % properties from org % to org %',
    v_properties_moved, v_old_org_id, v_new_org_id;
END $$;
*/

-- =====================================================
-- OPTION B: MOVE USER BACK TO ORIGINAL ORGANIZATION
-- =====================================================
-- Use this if you want to go back to the organization
-- that has all your properties
--
-- Instructions:
-- 1. Look at which organization has your properties (from diagnosis above)
-- 2. Copy that organization's ID
-- 3. Uncomment the DO block below
-- 4. Update v_user_email with your email
-- 5. Update v_target_org_id with the organization that has your properties
-- 6. Run the script

/*
DO $$
DECLARE
  v_user_email TEXT := 'your@email.com';  -- CHANGE THIS
  v_target_org_id UUID := 'ORGANIZATION_ID_WITH_PROPERTIES';  -- CHANGE THIS
  v_user_id UUID;
  v_org_name TEXT;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_user_email;
  END IF;

  -- Get org name
  SELECT name INTO v_org_name
  FROM organizations
  WHERE id = v_target_org_id;

  IF v_org_name IS NULL THEN
    RAISE EXCEPTION 'Organization with ID % not found', v_target_org_id;
  END IF;

  -- Update user in public.users
  UPDATE users
  SET organization_id = v_target_org_id
  WHERE id = v_user_id;

  -- Update user in auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('organization_id', v_target_org_id::text)
  WHERE id = v_user_id;

  RAISE NOTICE 'SUCCESS: User % moved back to organization % (%)',
    v_user_email, v_org_name, v_target_org_id;
END $$;
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this after using either option to verify access is restored

SELECT
  '=== VERIFICATION: YOUR ACCESS ===' as section,
  u.email,
  u.organization_id as your_org_id,
  o.name as your_org_name,
  COUNT(p.id) as properties_you_can_see
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
LEFT JOIN properties p ON p.organization_id = u.organization_id
GROUP BY u.email, u.organization_id, o.name;

-- =====================================================
-- QUICK FIX: AUTOMATED (if only 2 orgs exist)
-- =====================================================
-- This automatically moves you back if you only have 2 organizations
-- Uncomment to run

/*
DO $$
DECLARE
  v_user_id UUID;
  v_current_org_id UUID;
  v_org_with_properties UUID;
  v_property_count INTEGER;
BEGIN
  -- Get first user
  SELECT id, organization_id INTO v_user_id, v_current_org_id
  FROM users
  LIMIT 1;

  -- Find which organization has properties
  SELECT organization_id, COUNT(*) INTO v_org_with_properties, v_property_count
  FROM properties
  GROUP BY organization_id
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- If user is in wrong org, move them
  IF v_current_org_id != v_org_with_properties THEN
    RAISE NOTICE 'Moving user to organization with % properties', v_property_count;

    UPDATE users
    SET organization_id = v_org_with_properties
    WHERE id = v_user_id;

    UPDATE auth.users
    SET raw_user_meta_data =
      COALESCE(raw_user_meta_data, '{}'::jsonb) ||
      jsonb_build_object('organization_id', v_org_with_properties::text)
    WHERE id = v_user_id;

    RAISE NOTICE 'SUCCESS: User moved to organization with properties';
  ELSE
    RAISE NOTICE 'User is already in the correct organization';
  END IF;
END $$;
*/
