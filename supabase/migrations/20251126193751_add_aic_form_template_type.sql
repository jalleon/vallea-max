-- Add AIC_FORM to the template_type check constraint
-- First, drop the existing constraint
ALTER TABLE appraisals DROP CONSTRAINT IF EXISTS appraisals_template_type_check;

-- Add the new constraint with AIC_FORM included
ALTER TABLE appraisals ADD CONSTRAINT appraisals_template_type_check
CHECK (template_type IN ('RPS', 'NAS', 'CUSTOM', 'AIC_FORM'));
