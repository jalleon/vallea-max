-- Add aire_habitable field to properties table
-- This field stores "Aire d'étages" from Rôle foncier documents
-- Positioned in the municipal evaluation section

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS aire_habitable_m2 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS aire_habitable_pi2 DECIMAL(10,2);

COMMENT ON COLUMN properties.aire_habitable_m2 IS 'Aire d''étages (floor area) from Rôle foncier - in square meters';
COMMENT ON COLUMN properties.aire_habitable_pi2 IS 'Aire d''étages (floor area) from Rôle foncier - in square feet';

-- Add missing municipal evaluation fields
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS eval_municipale_terrain DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS eval_municipale_batiment DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS eval_municipale_total DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS matricule TEXT,
ADD COLUMN IF NOT EXISTS taxes_municipales_montant DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS taxes_municipales_annee INTEGER,
ADD COLUMN IF NOT EXISTS taxes_scolaires_montant DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS taxes_scolaires_annee INTEGER,
ADD COLUMN IF NOT EXISTS frais_condo DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS jours_sur_marche INTEGER,
ADD COLUMN IF NOT EXISTS nombre_pieces INTEGER,
ADD COLUMN IF NOT EXISTS type_batiment TEXT,
ADD COLUMN IF NOT EXISTS extras TEXT;

COMMENT ON COLUMN properties.eval_municipale_terrain IS 'Municipal evaluation - land value';
COMMENT ON COLUMN properties.eval_municipale_batiment IS 'Municipal evaluation - building value';
COMMENT ON COLUMN properties.eval_municipale_total IS 'Municipal evaluation - total value';
COMMENT ON COLUMN properties.matricule IS 'Municipal property cadastral number (matricule)';
COMMENT ON COLUMN properties.taxes_municipales_montant IS 'Municipal tax amount';
COMMENT ON COLUMN properties.taxes_municipales_annee IS 'Municipal tax year';
COMMENT ON COLUMN properties.taxes_scolaires_montant IS 'School tax amount';
COMMENT ON COLUMN properties.taxes_scolaires_annee IS 'School tax year';
COMMENT ON COLUMN properties.frais_condo IS 'Condominium fees';
COMMENT ON COLUMN properties.jours_sur_marche IS 'Days on market';
COMMENT ON COLUMN properties.nombre_pieces IS 'Number of rooms above ground';
COMMENT ON COLUMN properties.type_batiment IS 'Building type (Isolé, Jumelé, En rangée, etc.)';
COMMENT ON COLUMN properties.extras IS 'Extra features and inclusions';
