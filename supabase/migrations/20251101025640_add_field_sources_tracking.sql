-- Add field_sources column to track which document type provided each field
-- This allows protecting municipal data (role_foncier, role_taxe) from being overwritten by MLS data

ALTER TABLE properties
ADD COLUMN field_sources JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN properties.field_sources IS 'Tracks the document type source for each field (e.g., {"eval_municipale_total": "role_foncier", "prix_vente": "mls_listing"}). Used to protect official municipal data from being overwritten by MLS imports.';
