-- Add geocoding columns for Mapbox map view
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_properties_coordinates
  ON properties (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
