-- Create appraisals table
CREATE TABLE IF NOT EXISTS appraisals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Template type
    template_type TEXT NOT NULL CHECK (template_type IN ('RPS', 'NAS', 'CUSTOM')),

    -- Basic information (Page 2 of wizard)
    client_name TEXT NOT NULL,
    appraisal_number TEXT UNIQUE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

    -- Property details (Page 1 of wizard)
    property_type TEXT CHECK (property_type IN (
        'condo',
        'single_family',
        'duplex',
        'triplex',
        'quadriplex_plus',
        'apartment',
        'semi_commercial',
        'commercial',
        'land',
        'other'
    )),
    property_genre TEXT CHECK (property_genre IN (
        'plain_pied',
        'a_etages',
        '1_etage',
        'un_etage_et_demi',
        'deux_etages',
        'deux_etages_et_demi',
        'trois_etages',
        'paliers_multiples',
        'mobile',
        'maison_de_ville',
        'tour_appartement',
        'terrain_vacant'
    )),

    -- Value type and objective
    value_type TEXT CHECK (value_type IN ('valeur_actuelle', 'valeur_retrospective')),
    evaluation_objective TEXT,
    effective_date DATE,

    -- Property address (if creating new or manual entry)
    address TEXT,
    city TEXT,
    postal_code TEXT,

    -- Report sections data (JSONB for flexibility)
    sections_data JSONB DEFAULT '{}'::JSONB,

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'completed', 'archived')),
    completion_percentage INTEGER DEFAULT 0,

    -- Multi-tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_appraisals_organization_id ON appraisals(organization_id);
CREATE INDEX idx_appraisals_property_id ON appraisals(property_id);
CREATE INDEX idx_appraisals_status ON appraisals(status);
CREATE INDEX idx_appraisals_template_type ON appraisals(template_type);
CREATE INDEX idx_appraisals_created_by ON appraisals(created_by);
CREATE INDEX idx_appraisals_appraisal_number ON appraisals(appraisal_number);

-- Enable RLS
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view appraisals in their organization"
    ON appraisals FOR SELECT
    USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can create appraisals in their organization"
    ON appraisals FOR INSERT
    WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update appraisals in their organization"
    ON appraisals FOR UPDATE
    USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
    WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete appraisals in their organization"
    ON appraisals FOR DELETE
    USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Function to auto-generate appraisal number
CREATE OR REPLACE FUNCTION generate_appraisal_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    max_number INTEGER;
    new_number TEXT;
BEGIN
    -- Get current year (YY format)
    current_year := TO_CHAR(CURRENT_DATE, 'YY');

    -- Find the highest number for this year and organization
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(appraisal_number FROM '\d+$') AS INTEGER)),
        0
    ) INTO max_number
    FROM appraisals
    WHERE organization_id = NEW.organization_id
    AND appraisal_number LIKE current_year || '-%';

    -- Generate new number with format YY-####
    new_number := current_year || '-' || LPAD((max_number + 1)::TEXT, 4, '0');

    NEW.appraisal_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate appraisal number on insert
CREATE TRIGGER trigger_generate_appraisal_number
    BEFORE INSERT ON appraisals
    FOR EACH ROW
    WHEN (NEW.appraisal_number IS NULL)
    EXECUTE FUNCTION generate_appraisal_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appraisals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_appraisals_updated_at
    BEFORE UPDATE ON appraisals
    FOR EACH ROW
    EXECUTE FUNCTION update_appraisals_updated_at();

-- Comments
COMMENT ON TABLE appraisals IS 'Professional appraisal reports (RPS, NAS, Custom templates)';
COMMENT ON COLUMN appraisals.appraisal_number IS 'Auto-generated in format YY-#### (e.g., 25-0001)';
COMMENT ON COLUMN appraisals.sections_data IS 'Dynamic JSONB data for all report sections based on template type';