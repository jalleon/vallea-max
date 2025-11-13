-- Create table for organization-level adjustment rate presets
CREATE TABLE IF NOT EXISTS organization_adjustment_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL,
  rates JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Ensure one preset per property type per organization
  CONSTRAINT unique_org_property_type UNIQUE (organization_id, property_type)
);

-- Add RLS policies
ALTER TABLE organization_adjustment_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view presets for their organization
CREATE POLICY "Users can view their organization's adjustment presets"
  ON organization_adjustment_presets
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert presets for their organization
CREATE POLICY "Users can create adjustment presets for their organization"
  ON organization_adjustment_presets
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can update presets for their organization
CREATE POLICY "Users can update their organization's adjustment presets"
  ON organization_adjustment_presets
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete presets for their organization
CREATE POLICY "Users can delete their organization's adjustment presets"
  ON organization_adjustment_presets
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER set_organization_adjustment_presets_updated_at
  BEFORE UPDATE ON organization_adjustment_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE organization_adjustment_presets IS 'Stores organization-level default adjustment rates for different property types';
