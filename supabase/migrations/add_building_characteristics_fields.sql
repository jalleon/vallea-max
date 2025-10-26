-- Add building characteristics and additional property fields
-- Migration: add_building_characteristics_fields.sql

-- Add building characteristic fields
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS type_batiment TEXT,
  ADD COLUMN IF NOT EXISTS chrono_age INTEGER,
  ADD COLUMN IF NOT EXISTS eff_age INTEGER,
  ADD COLUMN IF NOT EXISTS type_garage TEXT,
  ADD COLUMN IF NOT EXISTS extras TEXT;

-- Add condo-specific fields
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS localisation TEXT,
  ADD COLUMN IF NOT EXISTS type_copropriete TEXT DEFAULT 'Divise';

-- Add comments for documentation
COMMENT ON COLUMN properties.type_batiment IS 'Type of building (Isolé, Semi-détaché, En rangée, En rangée sur coin)';
COMMENT ON COLUMN properties.chrono_age IS 'Chronological age of the building (Current Year - Construction Year)';
COMMENT ON COLUMN properties.eff_age IS 'Effective age of the building';
COMMENT ON COLUMN properties.type_garage IS 'Type of garage (Attaché, Détaché, Intégré, Au sous-sol, Abri d''auto)';
COMMENT ON COLUMN properties.extras IS 'Additional features and extras';
COMMENT ON COLUMN properties.localisation IS 'Condo location (Coin, Centre) - for Condo properties only';
COMMENT ON COLUMN properties.type_copropriete IS 'Type of co-ownership (Divise, Indivise) - for Condo properties only';
