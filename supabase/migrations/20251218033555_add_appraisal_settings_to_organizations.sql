-- Add appraisal_settings column to organizations table
-- Used for storing organization-wide default settings for appraisals

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS appraisal_settings JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN organizations.appraisal_settings IS 'Organization-wide default settings for appraisals (company info, default rates, etc.)';
