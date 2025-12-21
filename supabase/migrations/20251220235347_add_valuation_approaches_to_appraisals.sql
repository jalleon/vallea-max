-- Add valuation_approaches and sur_plan columns to appraisals table
-- valuation_approaches: array of selected valuation methods
-- sur_plan: boolean indicating if this is an off-plan appraisal (building not yet constructed)

ALTER TABLE appraisals
ADD COLUMN IF NOT EXISTS valuation_approaches TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sur_plan BOOLEAN DEFAULT FALSE;

-- Make property_genre nullable (for property types that don't require it)
ALTER TABLE appraisals
ALTER COLUMN property_genre DROP NOT NULL;

-- Drop the old property_type check constraint and add a new one with updated values
ALTER TABLE appraisals DROP CONSTRAINT IF EXISTS appraisals_property_type_check;

ALTER TABLE appraisals ADD CONSTRAINT appraisals_property_type_check
CHECK (property_type IN (
  'condo_residentiel',
  'plex',
  'multifamilial',
  'residentiel_commercial',
  'residentiel_commercial_bureau',
  'residentiel_bureau',
  'commercial',
  'commercial_bureau',
  'bureau',
  'industriel',
  'industriel_bureau',
  'condo_commercial',
  'condo_bureau',
  'condo_industriel',
  'parc_maisons_mobiles',
  'terrain'
));

-- Add comment for documentation
COMMENT ON COLUMN appraisals.valuation_approaches IS 'Array of selected valuation approaches: methode_parite, methode_cout, flux_monetaire, capitalisation_directe, grm, methode_residuelle';
COMMENT ON COLUMN appraisals.sur_plan IS 'Whether this is an off-plan appraisal (building not yet constructed)';
