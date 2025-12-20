-- =====================================================
-- SEED DATA: Toronto Properties (English Demo)
-- =====================================================
-- Use this to populate the library with sample Toronto properties
-- for English screenshots and demos
-- =====================================================

-- Sample Toronto Properties
INSERT INTO properties (
  adresse, ville, municipalite, code_postal, province,
  prix_vente, prix_demande, date_vente, status,
  type_propriete, genre_propriete, annee_construction, zonage,
  superficie_terrain_m2, superficie_terrain_pi2,
  frontage_m2, profondeur_m2, frontage_pi2, profondeur_pi2,
  superficie_habitable_m2, superficie_habitable_pi2,
  nombre_chambres, salle_bain, salle_eau,
  stationnement, dimension_garage,
  type_sous_sol, toiture,
  ameliorations_hors_sol,
  numero_mls,
  source, notes
) VALUES

-- Property 1: Luxury Detached in Rosedale
('45 Crescent Road', 'Toronto', 'Toronto', 'M4W 1T6', 'ON',
 3250000.00, 3495000.00, '2024-09-15', 'Sold',
 'Detached', 'Single Family', 1928, 'Residential',
 557.42, 6000.00,
 15.24, 36.58, 50.00, 120.00,
 372.02, 4004.00,
 5, 4, 2,
 'Private Driveway', '6.10m x 6.10m (20ft x 20ft)',
 'Fully Finished', 'Asphalt Shingle',
 'Renovated Kitchen (2022), New HVAC (2023)',
 'C8765432',
 'manual', 'Heritage property in prestigious Rosedale neighborhood'),

-- Property 2: Modern Condo in King West
('125 Peter Street, Unit 3405', 'Toronto', 'Toronto', 'M5V 2H1', 'ON',
 875000.00, 899000.00, '2024-10-22', 'Sold',
 'Condo Apartment', 'High-Rise', 2018, 'Commercial Residential',
 NULL, NULL,
 NULL, NULL, NULL, NULL,
 92.90, 1000.00,
 2, 2, 0,
 '1 Parking Space', NULL,
 'N/A', 'N/A',
 'Floor-to-ceiling windows, Built-in appliances',
 'C9876543',
 'manual', 'Luxury condo with CN Tower views'),

-- Property 3: Family Home in North York
('128 Finch Avenue West', 'Toronto', 'North York', 'M2N 2H8', 'ON',
 1450000.00, 1499000.00, '2024-08-30', 'Sold',
 'Detached', 'Single Family', 1985, 'Residential',
 464.52, 5000.00,
 13.72, 33.83, 45.00, 111.00,
 232.26, 2500.00,
 4, 3, 1,
 'Double Garage', '5.49m x 5.49m (18ft x 18ft)',
 'Partially Finished', 'Asphalt Shingle',
 'Finished Basement, Updated Bathrooms',
 'C1234567',
 'manual', 'Well-maintained family home near schools'),

-- Property 4: Victorian Semi in Leslieville
('876 Queen Street East', 'Toronto', 'Toronto', 'M4M 1J4', 'ON',
 1125000.00, 1199000.00, '2024-11-01', 'Sold',
 'Semi-Detached', 'Single Family', 1905, 'Residential',
 232.26, 2500.00,
 7.62, 30.48, 25.00, 100.00,
 167.23, 1800.00,
 3, 2, 1,
 'Shared Driveway', NULL,
 'Unfinished', 'Asphalt Shingle',
 'Original Hardwood Floors, New Windows (2021)',
 'C2468135',
 'manual', 'Character home in trendy Leslieville'),

-- Property 5: Townhouse in Etobicoke
('2550 Bloor Street West, Unit 12', 'Toronto', 'Etobicoke', 'M8X 1B1', 'ON',
 925000.00, 949000.00, '2024-10-10', 'Sold',
 'Townhouse', 'Freehold', 2015, 'Residential',
 185.81, 2000.00,
 6.10, 30.48, 20.00, 100.00,
 176.52, 1900.00,
 3, 3, 0,
 'Single Garage', '3.05m x 6.10m (10ft x 20ft)',
 'Finished', 'Asphalt Shingle',
 'Open Concept Main Floor, Rooftop Terrace',
 'C3691470',
 'manual', 'Modern townhouse near Bloor West Village'),

-- Property 6: Luxury Estate in Forest Hill
('88 Old Forest Hill Road', 'Toronto', 'Toronto', 'M5P 2P5', 'ON',
 5750000.00, 6200000.00, '2024-09-20', 'Sold',
 'Detached', 'Single Family', 1935, 'Residential',
 929.03, 10000.00,
 21.34, 43.59, 70.00, 143.00,
 557.42, 6000.00,
 6, 5, 2,
 'Circular Driveway', '7.32m x 7.32m (24ft x 24ft)',
 'Fully Finished', 'Slate Tile',
 'Wine Cellar, Home Theatre, Pool',
 'C4567890',
 'manual', 'Exceptional estate property with pool'),

-- Property 7: Condo in Liberty Village
('33 Mill Street, Unit 1208', 'Toronto', 'Toronto', 'M5A 4N8', 'ON',
 625000.00, 649000.00, '2024-11-05', 'Sold',
 'Condo Apartment', 'Mid-Rise', 2012, 'Commercial Residential',
 NULL, NULL,
 NULL, NULL, NULL, NULL,
 65.03, 700.00,
 1, 1, 0,
 '1 Parking Space', NULL,
 'N/A', 'N/A',
 'Granite Counters, Engineered Hardwood',
 'C5678901',
 'manual', 'Urban living in Liberty Village'),

-- Property 8: Bungalow in Scarborough
('245 Birchmount Road', 'Toronto', 'Scarborough', 'M1N 3L7', 'ON',
 1050000.00, 1099000.00, '2024-10-15', 'Sold',
 'Detached', 'Bungalow', 1970, 'Residential',
 557.42, 6000.00,
 15.24, 36.58, 50.00, 120.00,
 139.35, 1500.00,
 3, 2, 0,
 'Double Driveway', 'Carport',
 'Partially Finished', 'Asphalt Shingle',
 'Updated Kitchen, New Furnace (2022)',
 'C6789012',
 'manual', 'Great potential for expansion');

