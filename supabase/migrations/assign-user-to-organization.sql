-- =====================================================
-- ASSIGN USER TO ORGANIZATION BY EMAIL
-- =====================================================
-- This script allows you to:
-- 1. Assign a user to an existing organization by ID
-- 2. Create a new organization and assign user to it
-- =====================================================

-- =====================================================
-- STEP 1: VIEW EXISTING ORGANIZATIONS
-- =====================================================
SELECT
  '=== EXISTING ORGANIZATIONS ===' as section,
  id,
  name,
  subscription_tier,
  created_at
FROM organizations
ORDER BY created_at DESC;

-- =====================================================
-- STEP 2: VIEW EXISTING USERS
-- =====================================================
SELECT
  '=== EXISTING USERS ===' as section,
  u.email,
  u.full_name,
  u.organization_id,
  o.name as current_org_name,
  u.role
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
ORDER BY u.email;

-- =====================================================
-- OPTION A: ASSIGN USER TO EXISTING ORGANIZATION
-- =====================================================
-- Instructions:
-- 1. Copy the organization ID from the list above
-- 2. Replace 'user@email.com' with the user's email
-- 3. Replace 'ORGANIZATION_ID_HERE' with the actual UUID
-- 4. Uncomment and run the DO block below

/*
DO $$
DECLARE
  v_user_email TEXT := 'user@email.com';  -- CHANGE THIS
  v_org_id UUID := 'ORGANIZATION_ID_HERE';  -- CHANGE THIS (paste UUID from above)
  v_user_id UUID;
  v_org_name TEXT;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM users
  WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_user_email;
  END IF;

  -- Verify organization exists
  SELECT name INTO v_org_name
  FROM organizations
  WHERE id = v_org_id;

  IF v_org_name IS NULL THEN
    RAISE EXCEPTION 'Organization with ID % not found', v_org_id;
  END IF;

  -- Update user's organization in public.users
  UPDATE users
  SET organization_id = v_org_id
  WHERE id = v_user_id;

  -- Update user's organization in auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('organization_id', v_org_id::text)
  WHERE id = v_user_id;

  RAISE NOTICE 'SUCCESS: User % assigned to organization % (%)', v_user_email, v_org_name, v_org_id;
END $$;
*/

-- =====================================================
-- OPTION B: CREATE NEW ORGANIZATION AND ASSIGN USER
-- =====================================================
-- Instructions:
-- 1. Replace 'user@email.com' with the user's email
-- 2. Replace 'My New Organization' with the organization name
-- 3. Optionally change subscription tier (free/pro/enterprise)
-- 4. Uncomment and run the DO block below

/*
DO $$
DECLARE
  v_user_email TEXT := 'user@email.com';  -- CHANGE THIS
  v_org_name TEXT := 'My New Organization';  -- CHANGE THIS
  v_subscription_tier TEXT := 'free';  -- CHANGE THIS (free/pro/enterprise)
  v_user_id UUID;
  v_new_org_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM users
  WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_user_email;
  END IF;

  -- Create new organization
  INSERT INTO organizations (name, subscription_tier)
  VALUES (v_org_name, v_subscription_tier)
  RETURNING id INTO v_new_org_id;

  RAISE NOTICE 'Created new organization: % (ID: %)', v_org_name, v_new_org_id;

  -- Update user's organization in public.users
  UPDATE users
  SET organization_id = v_new_org_id
  WHERE id = v_user_id;

  -- Update user's organization in auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('organization_id', v_new_org_id::text)
  WHERE id = v_user_id;

  RAISE NOTICE 'SUCCESS: User % assigned to new organization % (%)', v_user_email, v_org_name, v_new_org_id;
END $$;
*/

-- =====================================================
-- VERIFICATION: VIEW UPDATED USER ASSIGNMENTS
-- =====================================================
SELECT
  '=== USER ORGANIZATION ASSIGNMENTS ===' as section,
  u.email,
  u.full_name,
  u.organization_id,
  o.name as organization_name,
  o.subscription_tier,
  u.role,
  CASE
    WHEN u.organization_id IS NOT NULL THEN '✓ Assigned'
    ELSE '✗ Not Assigned'
  END as status
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
ORDER BY u.email;

-- =====================================================
-- QUICK REFERENCE
-- =====================================================
/*
EXAMPLE 1: Assign user@example.com to existing org with ID abc123...

DO $$
DECLARE
  v_user_email TEXT := 'user@example.com';
  v_org_id UUID := 'abc12345-6789-0abc-def0-123456789abc';
  v_user_id UUID;
  v_org_name TEXT;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE email = v_user_email;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User with email % not found', v_user_email; END IF;

  SELECT name INTO v_org_name FROM organizations WHERE id = v_org_id;
  IF v_org_name IS NULL THEN RAISE EXCEPTION 'Organization with ID % not found', v_org_id; END IF;

  UPDATE users SET organization_id = v_org_id WHERE id = v_user_id;
  UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('organization_id', v_org_id::text) WHERE id = v_user_id;

  RAISE NOTICE 'SUCCESS: User % assigned to organization % (%)', v_user_email, v_org_name, v_org_id;
END $$;

EXAMPLE 2: Create "Acme Corp" and assign user@example.com to it

DO $$
DECLARE
  v_user_email TEXT := 'user@example.com';
  v_org_name TEXT := 'Acme Corp';
  v_subscription_tier TEXT := 'free';
  v_user_id UUID;
  v_new_org_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE email = v_user_email;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User with email % not found', v_user_email; END IF;

  INSERT INTO organizations (name, subscription_tier) VALUES (v_org_name, v_subscription_tier) RETURNING id INTO v_new_org_id;
  RAISE NOTICE 'Created new organization: % (ID: %)', v_org_name, v_new_org_id;

  UPDATE users SET organization_id = v_new_org_id WHERE id = v_user_id;
  UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('organization_id', v_new_org_id::text) WHERE id = v_user_id;

  RAISE NOTICE 'SUCCESS: User % assigned to new organization % (%)', v_user_email, v_org_name, v_new_org_id;
END $$;
*/
