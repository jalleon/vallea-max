-- Add inspection-related columns to properties table
-- Migration: Add inspection fields for property evaluation workflow

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS inspection_status TEXT CHECK (inspection_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS inspection_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS inspection_completion INTEGER DEFAULT 0 CHECK (inspection_completion >= 0 AND inspection_completion <= 100),
ADD COLUMN IF NOT EXISTS inspection_pieces JSONB,
ADD COLUMN IF NOT EXISTS inspection_batiment JSONB,
ADD COLUMN IF NOT EXISTS inspection_garage JSONB,
ADD COLUMN IF NOT EXISTS inspection_mecanique JSONB,
ADD COLUMN IF NOT EXISTS inspection_exterieur JSONB,
ADD COLUMN IF NOT EXISTS inspection_divers JSONB,
ADD COLUMN IF NOT EXISTS inspection_categories_completed TEXT[] DEFAULT '{}';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_inspection_status ON properties(inspection_status);
CREATE INDEX IF NOT EXISTS idx_properties_inspection_date ON properties(inspection_date);
CREATE INDEX IF NOT EXISTS idx_properties_inspection_completion ON properties(inspection_completion);

-- Add comment for documentation
COMMENT ON COLUMN properties.inspection_status IS 'Current status of property inspection: not_started, in_progress, or completed';
COMMENT ON COLUMN properties.inspection_date IS 'Date when the inspection was conducted or scheduled';
COMMENT ON COLUMN properties.inspection_completion IS 'Overall inspection completion percentage (0-100)';
COMMENT ON COLUMN properties.inspection_pieces IS 'JSONB structure containing room-by-room inspection details with floors and room types';
COMMENT ON COLUMN properties.inspection_batiment IS 'JSONB structure for building inspection details';
COMMENT ON COLUMN properties.inspection_garage IS 'JSONB structure for garage inspection details';
COMMENT ON COLUMN properties.inspection_mecanique IS 'JSONB structure for mechanical systems inspection details';
COMMENT ON COLUMN properties.inspection_exterieur IS 'JSONB structure for exterior inspection details';
COMMENT ON COLUMN properties.inspection_divers IS 'JSONB structure for miscellaneous inspection details';
COMMENT ON COLUMN properties.inspection_categories_completed IS 'Array of completed inspection category IDs (pieces, batiment, garage, mecanique, divers, exterieur)';
