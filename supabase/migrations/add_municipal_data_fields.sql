-- Add municipal data fields to properties table

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS lot_number TEXT,
  ADD COLUMN IF NOT EXISTS additional_lots JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS matricule TEXT,
  ADD COLUMN IF NOT EXISTS eval_municipale_annee INTEGER,
  ADD COLUMN IF NOT EXISTS eval_municipale_terrain NUMERIC,
  ADD COLUMN IF NOT EXISTS eval_municipale_batiment NUMERIC,
  ADD COLUMN IF NOT EXISTS eval_municipale_total NUMERIC,
  ADD COLUMN IF NOT EXISTS taxes_municipales_annee INTEGER,
  ADD COLUMN IF NOT EXISTS taxes_municipales_montant NUMERIC,
  ADD COLUMN IF NOT EXISTS taxes_scolaires_annee INTEGER,
  ADD COLUMN IF NOT EXISTS taxes_scolaires_montant NUMERIC,
  ADD COLUMN IF NOT EXISTS zoning_usages_permis TEXT;

-- Add comments for documentation
COMMENT ON COLUMN properties.lot_number IS 'Primary lot number - formatted as # ### ### for Quebec';
COMMENT ON COLUMN properties.additional_lots IS 'Array of additional lots with type (Exclusif/Commun)';
COMMENT ON COLUMN properties.matricule IS 'Municipal matricule number';
COMMENT ON COLUMN properties.eval_municipale_annee IS 'Year of municipal evaluation';
COMMENT ON COLUMN properties.eval_municipale_terrain IS 'Municipal evaluation - land value';
COMMENT ON COLUMN properties.eval_municipale_batiment IS 'Municipal evaluation - building value';
COMMENT ON COLUMN properties.eval_municipale_total IS 'Municipal evaluation - total value (auto-calculated)';
COMMENT ON COLUMN properties.taxes_municipales_annee IS 'Year of municipal taxes';
COMMENT ON COLUMN properties.taxes_municipales_montant IS 'Municipal taxes amount';
COMMENT ON COLUMN properties.taxes_scolaires_annee IS 'Year of school taxes';
COMMENT ON COLUMN properties.taxes_scolaires_montant IS 'School taxes amount';
COMMENT ON COLUMN properties.zoning_usages_permis IS 'Permitted zoning uses description';
