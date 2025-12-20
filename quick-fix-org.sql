-- =====================================================
-- QUICK FIX: Assign users to organization
-- =====================================================
-- Simple script to fix RLS policy issues
-- =====================================================

-- Create organization if needed, get its ID
DO $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get or create organization
  SELECT id INTO v_org_id FROM organizations LIMIT 1;

  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name) VALUES ('Valea Immobilier') RETURNING id INTO v_org_id;
    RAISE NOTICE 'Created organization: %', v_org_id;
  ELSE
    RAISE NOTICE 'Using existing organization: %', v_org_id;
  END IF;

  -- Update all users with this organization
  UPDATE users SET organization_id = v_org_id WHERE organization_id IS NULL;

  RAISE NOTICE 'Updated users with organization_id';
END $$;

-- Verify the fix
SELECT
  u.email,
  u.organization_id,
  o.name as org_name,
  CASE
    WHEN u.organization_id IS NOT NULL THEN '✓ Ready'
    ELSE '✗ Missing org'
  END as status
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id;
