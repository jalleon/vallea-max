-- =====================================================
-- FIX USER SIGNUP - AUTO-CREATE USER PROFILE
-- =====================================================
-- This migration ensures that when users sign up via Supabase Auth,
-- their profile is automatically created in the public.users table.
-- This fixes the "Database error saving new user" issue.
-- =====================================================

-- Step 1: Ensure we have an organization for new users
DO $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Check if "Default Organization" exists
  SELECT id INTO v_org_id
  FROM organizations
  WHERE name = 'Default Organization'
  LIMIT 1;

  -- If not, create it
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, subscription_tier)
    VALUES ('Default Organization', 'free')
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created Default Organization: %', v_org_id;
  ELSE
    RAISE NOTICE 'Default Organization already exists: %', v_org_id;
  END IF;
END $$;

-- Step 2: Create or replace the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_org_id UUID;
  user_org_id UUID;
BEGIN
  -- Get organization ID from metadata if provided, otherwise use default
  user_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;

  IF user_org_id IS NULL THEN
    -- Get default organization
    SELECT id INTO default_org_id
    FROM organizations
    WHERE name = 'Default Organization'
    LIMIT 1;

    -- If still no organization, create one
    IF default_org_id IS NULL THEN
      INSERT INTO organizations (name, subscription_tier)
      VALUES ('Default Organization', 'free')
      RETURNING id INTO default_org_id;
    END IF;

    user_org_id := default_org_id;
  END IF;

  -- Create user profile in public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    organization_id,
    role,
    preferences
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_org_id,
    'appraiser',  -- Default role for new users
    jsonb_build_object(
      'language', 'fr',
      'currency', 'CAD',
      'theme', 'light',
      'aiApiKeys', jsonb_build_object(
        'deepseek', null,
        'openai', null,
        'anthropic', null
      ),
      'aiModels', jsonb_build_object(
        'deepseek', 'deepseek-chat',
        'openai', 'gpt-4o-mini',
        'anthropic', 'claude-3-5-haiku-20241022'
      )
    )
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors if user already exists

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 6: Verify setup
DO $$
DECLARE
  v_trigger_count integer;
  v_org_count integer;
BEGIN
  -- Check trigger exists
  SELECT COUNT(*) INTO v_trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
    AND event_object_schema = 'auth'
    AND event_object_table = 'users';

  -- Check default organization exists
  SELECT COUNT(*) INTO v_org_count
  FROM organizations
  WHERE name = 'Default Organization';

  IF v_trigger_count > 0 AND v_org_count > 0 THEN
    RAISE NOTICE '✓ User signup trigger successfully configured';
    RAISE NOTICE '✓ Default organization exists';
    RAISE NOTICE '✓ New user signups will now automatically create user profiles';
  ELSE
    RAISE WARNING 'Setup incomplete - trigger count: %, org count: %', v_trigger_count, v_org_count;
  END IF;
END $$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile in public.users when a new user signs up via Supabase Auth';
