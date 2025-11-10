-- Add subject_property_id column to appraisals table
-- This references the specific property being appraised (subject property) in the Direct Comparison form
ALTER TABLE appraisals
ADD COLUMN subject_property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_appraisals_subject_property_id ON appraisals(subject_property_id);

-- Add comment
COMMENT ON COLUMN appraisals.subject_property_id IS 'Reference to the subject property being appraised (used in Direct Comparison method)';
