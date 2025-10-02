-- Additional fields for properties table
-- Run this after the main schema.sql

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS perimetre_batiment_m2 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS perimetre_batiment_pi2 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS nombre_pieces INTEGER,
ADD COLUMN IF NOT EXISTS jours_sur_marche INTEGER;

-- Add floor_areas table for managing multiple floors per property
CREATE TABLE IF NOT EXISTS floor_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  floor TEXT NOT NULL,
  area_m2 DECIMAL(10,2) NOT NULL,
  area_ft2 DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('hors-sol', 'sous-sol')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for floor areas
CREATE INDEX IF NOT EXISTS idx_floor_areas_property ON floor_areas(property_id);

-- Enable RLS for floor_areas
ALTER TABLE floor_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policy for floor_areas
CREATE POLICY "Users see property floor areas" ON floor_areas
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users manage property floor areas" ON floor_areas
  FOR ALL USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );