-- Create organization_adjustment_presets table for property-type-specific default rates
CREATE TABLE IF NOT EXISTS organization_adjustment_presets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_type TEXT NOT NULL CHECK (property_type IN (
        'condo',
        'single_family',
        'duplex',
        'triplex',
        'quadruplex_plus',
        'apartment',
        'semi_commercial',
        'commercial',
        'land',
        'other'
    )),

    -- Default adjustment rates for this property type
    rates JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    -- Ensure one preset per organization per property type
    UNIQUE(organization_id, property_type)
);

-- Create indexes
CREATE INDEX idx_org_adjustment_presets_org_id ON organization_adjustment_presets(organization_id);
CREATE INDEX idx_org_adjustment_presets_property_type ON organization_adjustment_presets(property_type);

-- Enable RLS
ALTER TABLE organization_adjustment_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view presets in their organization"
    ON organization_adjustment_presets FOR SELECT
    USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can create presets in their organization"
    ON organization_adjustment_presets FOR INSERT
    WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update presets in their organization"
    ON organization_adjustment_presets FOR UPDATE
    USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
    WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete presets in their organization"
    ON organization_adjustment_presets FOR DELETE
    USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_org_adjustment_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_org_adjustment_presets_updated_at
    BEFORE UPDATE ON organization_adjustment_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_org_adjustment_presets_updated_at();

-- Comments
COMMENT ON TABLE organization_adjustment_presets IS 'Organization-level default adjustment rates per property type';
COMMENT ON COLUMN organization_adjustment_presets.rates IS 'JSONB containing DefaultRates structure for this property type';
