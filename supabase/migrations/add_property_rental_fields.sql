-- Add missing fields to properties table for rental and evaluation properties
-- Migration: add_property_rental_fields.sql

-- Add rental-related fields
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS frais_condo NUMERIC,
  ADD COLUMN IF NOT EXISTS loyer_en_place NUMERIC,
  ADD COLUMN IF NOT EXISTS unit_rents JSONB DEFAULT '[]'::jsonb;

-- Add evaluation-related fields
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS type_evaluation TEXT,
  ADD COLUMN IF NOT EXISTS occupancy TEXT;

-- Add comments for documentation
COMMENT ON COLUMN properties.frais_condo IS 'Condo fees (monthly)';
COMMENT ON COLUMN properties.loyer_en_place IS 'Current total rent for the property';
COMMENT ON COLUMN properties.unit_rents IS 'Array of rent details for multi-unit properties (Duplex, Triplex, Quadriplex+)';
COMMENT ON COLUMN properties.type_evaluation IS 'Type of evaluation when status is Sujet';
COMMENT ON COLUMN properties.occupancy IS 'Occupancy status (e.g., Owner-occupied, Tenant-occupied)';
