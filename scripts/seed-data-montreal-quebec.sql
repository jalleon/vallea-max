-- =====================================================
-- SEED DATA: Montreal/Quebec City Properties (French Demo)
-- =====================================================
-- Use this to populate the library with sample Montreal
-- and Quebec City properties for French screenshots and demos
-- =====================================================

-- Sample Montreal and Quebec City Properties
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

-- Propriété 1: Condo de luxe à Montréal (Griffintown)
('1188 Rue Ottawa, App 505', 'Montréal', 'Montréal', 'H3C 1R5', 'QC',
 725000.00, 749000.00, '2024-09-28', 'Vendu',
 'Copropriété', 'Tour', 2019, 'Résidentiel',
 NULL, NULL,
 NULL, NULL, NULL, NULL,
 92.90, 1000.00,
 2, 2, 0,
 '1 Stationnement Intérieur', NULL,
 'N/A', 'N/A',
 'Comptoirs granite, planchers bois franc',
 'M24567890',
 'manual', 'Condo moderne avec vue sur le Canal Lachine'),

-- Propriété 2: Maison unifamiliale à Outremont
('645 Avenue Bloomfield', 'Montréal', 'Outremont', 'H2V 3S2', 'QC',
 2450000.00, 2595000.00, '2024-10-12', 'Vendu',
 'Unifamiliale', 'Détachée', 1925, 'Résidentiel',
 465.24, 5008.00,
 13.72, 33.91, 45.00, 111.25,
 279.05, 3004.00,
 4, 3, 1,
 'Garage Double', '6.10m x 6.10m (20pi x 20pi)',
 'Aménagé', 'Bardeau asphalte',
 'Cuisine rénovée (2023), Salle de bain principale refaite',
 'M12345678',
 'manual', 'Propriété patrimoniale dans Outremont'),

-- Propriété 3: Duplex à Rosemont
('4567 Rue Beaubien Est', 'Montréal', 'Rosemont', 'H1T 1V3', 'QC',
 875000.00, 899000.00, '2024-11-02', 'Vendu',
 'Duplex', 'Jumelée', 1950, 'Résidentiel',
 232.26, 2500.00,
 9.14, 25.40, 30.00, 83.33,
 185.81, 2000.00,
 6, 2, 1,
 'Allée double', NULL,
 'Non aménagé', 'Bardeau asphalte',
 'Toiture refaite (2022), Fenêtres récentes',
 'M23456789',
 'manual', 'Excellent revenu locatif, secteur prisé'),

-- Propriété 4: Condo au Vieux-Québec
('85 Rue Sainte-Anne, App 301', 'Québec', 'Québec', 'G1R 3X4', 'QC',
 485000.00, 499000.00, '2024-09-15', 'Vendu',
 'Copropriété', 'Bas de duplex', 1880, 'Résidentiel Patrimonial',
 NULL, NULL,
 NULL, NULL, NULL, NULL,
 111.48, 1200.00,
 2, 1, 1,
 'Stationnement rue', NULL,
 'Cave', 'Tôle',
 'Murs de pierre, poutres anciennes',
 'Q12345678',
 'manual', 'Charme historique au coeur du Vieux-Québec'),

-- Propriété 5: Maison à Westmount
('75 Avenue Forden', 'Montréal', 'Westmount', 'H3Y 2Z3', 'QC',
 4250000.00, 4495000.00, '2024-10-20', 'Vendu',
 'Unifamiliale', 'Détachée', 1912, 'Résidentiel',
 836.13, 9000.00,
 18.29, 45.72, 60.00, 150.00,
 418.06, 4500.00,
 5, 4, 2,
 'Garage triple', '9.14m x 7.32m (30pi x 24pi)',
 'Complètement aménagé', 'Ardoise',
 'Cave à vin, Salle cinéma, Piscine creusée',
 'M34567890',
 'manual', 'Propriété de prestige à Westmount'),

-- Propriété 6: Condo à Sainte-Foy
('2600 Boulevard Laurier, App 1205', 'Québec', 'Sainte-Foy', 'G1V 4T3', 'QC',
 395000.00, 419000.00, '2024-10-30', 'Vendu',
 'Copropriété', 'Tour', 2016, 'Résidentiel',
 NULL, NULL,
 NULL, NULL, NULL, NULL,
 83.61, 900.00,
 2, 2, 0,
 '1 Stationnement Intérieur', NULL,
 'N/A', 'N/A',
 'Comptoirs quartz, céramique',
 'Q23456789',
 'manual', 'Condo moderne près des Galeries de la Capitale'),

-- Propriété 7: Cottage à Sillery (Québec)
('1234 Chemin Saint-Louis', 'Québec', 'Sillery', 'G1S 1E5', 'QC',
 1850000.00, 1950000.00, '2024-09-22', 'Vendu',
 'Unifamiliale', 'Cottage', 1960, 'Résidentiel',
 1021.93, 11000.00,
 24.38, 41.91, 80.00, 137.50,
 325.16, 3500.00,
 4, 3, 1,
 'Garage double attaché', '6.10m x 6.10m (20pi x 20pi)',
 'Aménagé', 'Bardeau asphalte',
 'Vue fleuve, Cuisine rénovée, Deck',
 'Q34567890',
 'manual', 'Belle propriété avec vue sur le fleuve'),

-- Propriété 8: Triplex Plateau Mont-Royal
('3456 Avenue du Parc', 'Montréal', 'Le Plateau-Mont-Royal', 'H2X 2H7', 'QC',
 1575000.00, 1649000.00, '2024-11-08', 'Vendu',
 'Triplex', 'Jumelée', 1910, 'Résidentiel',
 279.05, 3004.00,
 9.14, 30.48, 30.00, 100.00,
 325.16, 3500.00,
 9, 3, 0,
 'Allée simple', NULL,
 'Non aménagé', 'Bardeau asphalte',
 'Balcons refaits, Escaliers extérieurs typiques',
 'M45678901',
 'manual', 'Immeuble à revenus sur le Plateau');

