-- Add form_data JSONB column to appraisals table
ALTER TABLE appraisals
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN appraisals.form_data IS 'Stores all section data for the appraisal form (client, evaluator, property, Direct Comparison, etc.)';
