-- Fix property organization assignments
-- This ensures all properties have the same organization_id as their creator

-- Update properties where organization_id doesn't match the creator's organization
UPDATE properties p
SET organization_id = profiles.organization_id
FROM profiles
WHERE p.created_by = profiles.id
  AND p.organization_id IS DISTINCT FROM profiles.organization_id
  AND profiles.organization_id IS NOT NULL;

-- Log the number of properties updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count > 0 THEN
    RAISE NOTICE 'Updated % properties to match their creator organization', updated_count;
  END IF;
END $$;

-- Create a trigger to automatically set the correct organization_id for new properties
CREATE OR REPLACE FUNCTION set_property_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- If organization_id is not set, use the creator's organization
  IF NEW.organization_id IS NULL AND NEW.created_by IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM profiles
    WHERE id = NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_property_organization ON properties;

-- Create the trigger
CREATE TRIGGER ensure_property_organization
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_organization();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER ensure_property_organization ON properties IS
'Automatically sets property organization_id to match the creator organization if not explicitly set';