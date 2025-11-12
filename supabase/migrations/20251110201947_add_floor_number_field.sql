-- Add floor_number field for condo properties
ALTER TABLE properties
ADD COLUMN floor_number INTEGER;

COMMENT ON COLUMN properties.floor_number IS 'Floor number for condo units';
