-- Add effective_age_data column to appraisals table
-- This field stores the effective age calculator data (components, renovations, calculations)
ALTER TABLE appraisals
ADD COLUMN IF NOT EXISTS effective_age_data JSONB;

-- Add comment to document the column
COMMENT ON COLUMN appraisals.effective_age_data IS 'Stores effective age calculator data: components (18 building components), renovation years, chronological age, apparent age, remaining economic life, and physical depreciation calculations';
