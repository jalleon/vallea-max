-- Add appraisal_settings JSONB column to organizations table
-- This will store company information (address, phone, website, logo URL)
-- that can be reused across all appraisals for that organization

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS appraisal_settings JSONB DEFAULT '{}'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN organizations.appraisal_settings IS 'Organization-level settings for appraisals including company address, phone, website, and logo URL';
