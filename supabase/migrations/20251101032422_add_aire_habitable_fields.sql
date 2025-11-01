-- Add aire habitable (livable area) fields to properties table
-- These fields store "Aire d'étages" data from Rôle foncier documents

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS aire_habitable_m2 NUMERIC,
  ADD COLUMN IF NOT EXISTS aire_habitable_pi2 NUMERIC;

-- Add comments for documentation
COMMENT ON COLUMN properties.aire_habitable_m2 IS 'Livable area in square meters (Aire d''étages from Rôle foncier)';
COMMENT ON COLUMN properties.aire_habitable_pi2 IS 'Livable area in square feet (Aire d''étages from Rôle foncier)';
