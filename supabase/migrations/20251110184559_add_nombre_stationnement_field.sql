-- Add nombre_stationnement field to properties table
ALTER TABLE properties
ADD COLUMN nombre_stationnement INTEGER;

COMMENT ON COLUMN properties.nombre_stationnement IS 'Number of parking spaces';
