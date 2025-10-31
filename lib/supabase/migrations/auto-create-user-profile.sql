-- Automatic user profile creation trigger
-- This creates a user profile automatically when someone signs up via Supabase Auth

-- 1. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get the first organization (or create a default one)
  SELECT id INTO default_org_id FROM organizations ORDER BY created_at ASC LIMIT 1;

  -- If no organization exists, create a default one
  IF default_org_id IS NULL THEN
    INSERT INTO organizations (name) VALUES ('Default Organization') RETURNING id INTO default_org_id;
  END IF;

  -- Create user profile with default preferences including AI API keys
  INSERT INTO public.users (id, email, full_name, organization_id, role, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    default_org_id,
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
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
