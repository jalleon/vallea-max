-- =====================================================
-- COMPLETE FIX FOR USER ORGANIZATION SETUP
-- =====================================================
-- This script:
-- 1. Creates an organization if none exists
-- 2. Updates the users table (public.users) with organization_id
-- 3. Updates auth.users metadata
-- 4. Verifies the setup
-- =====================================================

-- Step 1: Check current state
SELECT 'Current Organizations:' as step;
SELECT id, name, subscription_tier FROM organizations;

SELECT 'Current Users (public.users):' as step;
SELECT id, email, organization_id, role FROM users;

SELECT 'Current Auth Users metadata:' as step;
SELECT id, email, raw_user_meta_data->'organization_id' as org_in_metadata FROM auth.users;

-- Step 2: Ensure an organization exists
DO $$
DECLARE
  v_org_id uuid;
  v_org_exists boolean;
BEGIN
  -- Check if any organization exists
  SELECT EXISTS(SELECT 1 FROM organizations LIMIT 1) INTO v_org_exists;

  IF NOT v_org_exists THEN
    -- Create Valea Immobilier organization
    INSERT INTO organizations (name)
    VALUES ('Valea Immobilier')
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created new organization: %', v_org_id;
  ELSE
    -- Get first organization
    SELECT id INTO v_org_id FROM organizations ORDER BY created_at LIMIT 1;
    RAISE NOTICE 'Using existing organization: %', v_org_id;
  END IF;

  -- Store org_id for next step
  PERFORM set_config('app.org_id', v_org_id::text, true);
END $$;

-- Step 3: Update public.users table with organization_id
DO $$
DECLARE
  v_org_id uuid;
  v_user_record record;
  v_updated_count integer := 0;
BEGIN
  -- Get the org_id from previous step
  v_org_id := current_setting('app.org_id')::uuid;

  -- Update all users in public.users table
  FOR v_user_record IN SELECT id FROM users
  LOOP
    UPDATE users
    SET organization_id = v_org_id
    WHERE id = v_user_record.id AND (organization_id IS NULL OR organization_id != v_org_id);

    IF FOUND THEN
      v_updated_count := v_updated_count + 1;
      RAISE NOTICE 'Updated user % in public.users with organization %', v_user_record.id, v_org_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Updated % users in public.users table', v_updated_count;
END $$;

-- Step 4: Update auth.users metadata
DO $$
DECLARE
  v_org_id uuid;
  v_user_record record;
  v_updated_count integer := 0;
BEGIN
  -- Get the org_id
  v_org_id := current_setting('app.org_id')::uuid;

  -- Update all users in auth.users
  FOR v_user_record IN SELECT id FROM auth.users
  LOOP
    UPDATE auth.users
    SET raw_user_meta_data =
      COALESCE(raw_user_meta_data, '{}'::jsonb) ||
      jsonb_build_object('organization_id', v_org_id::text)
    WHERE id = v_user_record.id;

    v_updated_count := v_updated_count + 1;
    RAISE NOTICE 'Updated user % in auth.users with organization %', v_user_record.id, v_org_id;
  END LOOP;

  RAISE NOTICE 'Updated % users in auth.users metadata', v_updated_count;
END $$;

-- Step 5: Verify the fix
SELECT 'Verification - Organizations:' as step;
SELECT id, name, subscription_tier FROM organizations;

SELECT 'Verification - Public Users:' as step;
SELECT
  u.id,
  u.email,
  u.organization_id,
  u.role,
  o.name as org_name
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id;

SELECT 'Verification - Auth Users Metadata:' as step;
SELECT
  id,
  email,
  raw_user_meta_data->'organization_id' as org_in_metadata
FROM auth.users;

-- Step 6: Test RLS policy
SELECT 'Testing RLS Policy:' as step;
DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_policy_check text;
BEGIN
  -- Get first user
  SELECT id INTO v_user_id FROM users LIMIT 1;

  -- Get organization_id from users table
  SELECT organization_id INTO v_org_id FROM users WHERE id = v_user_id;

  IF v_org_id IS NOT NULL THEN
    v_policy_check := 'PASS - User ' || v_user_id || ' has organization ' || v_org_id;
  ELSE
    v_policy_check := 'FAIL - User ' || v_user_id || ' has NULL organization_id';
  END IF;

  RAISE NOTICE '%', v_policy_check;
END $$;
