-- Change eval_municipale_annee from INTEGER to DATE

-- First, add a temporary column with DATE type
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS eval_municipale_annee_temp DATE;

-- Copy existing year values to the temporary column (if any exist)
-- Convert year integers to dates (e.g., 2023 becomes 2023-01-01)
UPDATE properties
SET eval_municipale_annee_temp = make_date(eval_municipale_annee, 1, 1)
WHERE eval_municipale_annee IS NOT NULL;

-- Drop the old INTEGER column
ALTER TABLE properties
  DROP COLUMN IF EXISTS eval_municipale_annee;

-- Rename the temporary column to the original name
ALTER TABLE properties
  RENAME COLUMN eval_municipale_annee_temp TO eval_municipale_annee;

-- Update the comment
COMMENT ON COLUMN properties.eval_municipale_annee IS 'Date of municipal evaluation (changed from year INTEGER to DATE)';
