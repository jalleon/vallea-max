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
-- SECURITY: Uses users table lookup instead of auth.jwt()/user_metadata
CREATE POLICY "Users can view floor areas in their organization" ON floor_areas
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create floor areas in their organization" ON floor_areas
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update floor areas in their organization" ON floor_areas
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete floor areas in their organization" ON floor_areas
  FOR DELETE USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );