-- Add adjustments_data JSONB field to appraisals table
ALTER TABLE appraisals
ADD COLUMN IF NOT EXISTS adjustments_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN appraisals.adjustments_data IS 'Stores adjustment calculations and rates for direct comparison approach';

-- Update existing appraisals to have empty adjustments_data
UPDATE appraisals
SET adjustments_data = '{}'::jsonb
WHERE adjustments_data IS NULL;
