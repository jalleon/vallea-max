import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY // Using service role to bypass RLS
)

const torontoProperties = [
  {
    adresse: '45 Crescent Road',
    ville: 'Toronto',
    municipalite: 'Toronto',
    code_postal: 'M4W 1T6',
    province: 'ON',
    prix_vente: 3250000.00,
    prix_demande: 3495000.00,
    date_vente: '2024-09-15',
    status: 'Sold',
    type_propriete: 'Detached',
    genre_propriete: 'Single Family',
    annee_construction: 1928,
    zonage: 'Residential',
    superficie_terrain_m2: 557.42,
    superficie_terrain_pi2: 6000.00,
    frontage_m2: 15.24,
    profondeur_m2: 36.58,
    frontage_pi2: 50.00,
    profondeur_pi2: 120.00,
    superficie_habitable_m2: 372.02,
    superficie_habitable_pi2: 4004.00,
    nombre_chambres: 5,
    salle_bain: 4,
    salle_eau: 2,
    stationnement: 'Private Driveway',
    dimension_garage: '6.10m x 6.10m (20ft x 20ft)',
    type_sous_sol: 'Fully Finished',
    toiture: 'Asphalt Shingle',
    ameliorations_hors_sol: 'Renovated Kitchen (2022), New HVAC (2023)',
    numero_mls: 'C8765432',
    source: 'manual',
    notes: 'Heritage property in prestigious Rosedale neighborhood'
  },
  {
    adresse: '125 Peter Street, Unit 3405',
    ville: 'Toronto',
    municipalite: 'Toronto',
    code_postal: 'M5V 2H1',
    province: 'ON',
    prix_vente: 875000.00,
    prix_demande: 899000.00,
    date_vente: '2024-10-22',
    status: 'Sold',
    type_propriete: 'Condo Apartment',
    genre_propriete: 'High-Rise',
    annee_construction: 2018,
    zonage: 'Commercial Residential',
    superficie_terrain_m2: null,
    superficie_terrain_pi2: null,
    frontage_m2: null,
    profondeur_m2: null,
    frontage_pi2: null,
    profondeur_pi2: null,
    superficie_habitable_m2: 92.90,
    superficie_habitable_pi2: 1000.00,
    nombre_chambres: 2,
    salle_bain: 2,
    salle_eau: 0,
    stationnement: '1 Parking Space',
    dimension_garage: null,
    type_sous_sol: 'N/A',
    toiture: 'N/A',
    ameliorations_hors_sol: 'Floor-to-ceiling windows, Built-in appliances',
    numero_mls: 'C9876543',
    source: 'manual',
    notes: 'Luxury condo with CN Tower views'
  },
  {
    adresse: '88 Finch Avenue West',
    ville: 'Toronto',
    municipalite: 'North York',
    code_postal: 'M2N 2G8',
    province: 'ON',
    prix_vente: 1450000.00,
    prix_demande: 1499000.00,
    date_vente: '2024-08-30',
    status: 'Sold',
    type_propriete: 'Detached',
    genre_propriete: 'Two-Storey',
    annee_construction: 1995,
    zonage: 'Residential',
    superficie_terrain_m2: 464.52,
    superficie_terrain_pi2: 5000.00,
    frontage_m2: 15.24,
    profondeur_m2: 30.48,
    frontage_pi2: 50.00,
    profondeur_pi2: 100.00,
    superficie_habitable_m2: 232.26,
    superficie_habitable_pi2: 2500.00,
    nombre_chambres: 4,
    salle_bain: 3,
    salle_eau: 1,
    stationnement: 'Driveway',
    dimension_garage: '6.10m x 6.10m (20ft x 20ft)',
    type_sous_sol: 'Partially Finished',
    toiture: 'Asphalt Shingle',
    ameliorations_hors_sol: 'New windows (2020), Updated bathrooms',
    numero_mls: 'C1234567',
    source: 'manual',
    notes: 'Family-friendly neighborhood near good schools'
  },
  {
    adresse: '342 Jones Avenue',
    ville: 'Toronto',
    municipalite: 'Toronto',
    code_postal: 'M4J 3G4',
    province: 'ON',
    prix_vente: 1125000.00,
    prix_demande: 1149000.00,
    date_vente: '2024-09-08',
    status: 'Sold',
    type_propriete: 'Semi-Detached',
    genre_propriete: 'Victorian',
    annee_construction: 1910,
    zonage: 'Residential',
    superficie_terrain_m2: 278.71,
    superficie_terrain_pi2: 3000.00,
    frontage_m2: 9.14,
    profondeur_m2: 30.48,
    frontage_pi2: 30.00,
    profondeur_pi2: 100.00,
    superficie_habitable_m2: 167.23,
    superficie_habitable_pi2: 1800.00,
    nombre_chambres: 3,
    salle_bain: 2,
    salle_eau: 1,
    stationnement: 'Mutual Drive',
    dimension_garage: null,
    type_sous_sol: 'Unfinished',
    toiture: 'Asphalt Shingle',
    ameliorations_hors_sol: 'Original hardwood floors, Modern kitchen',
    numero_mls: 'C2345678',
    source: 'manual',
    notes: 'Charming Victorian in trendy Leslieville'
  },
  {
    adresse: '1555 The Collegeway, Unit 812',
    ville: 'Toronto',
    municipalite: 'Etobicoke',
    code_postal: 'M9V 4B4',
    province: 'ON',
    prix_vente: 925000.00,
    prix_demande: 949000.00,
    date_vente: '2024-10-01',
    status: 'Sold',
    type_propriete: 'Condo Townhouse',
    genre_propriete: 'Stacked Townhouse',
    annee_construction: 2020,
    zonage: 'Residential',
    superficie_terrain_m2: null,
    superficie_terrain_pi2: null,
    frontage_m2: null,
    profondeur_m2: null,
    frontage_pi2: null,
    profondeur_pi2: null,
    superficie_habitable_m2: 139.35,
    superficie_habitable_pi2: 1500.00,
    nombre_chambres: 3,
    salle_bain: 2,
    salle_eau: 1,
    stationnement: '2 Parking Spaces',
    dimension_garage: null,
    type_sous_sol: 'N/A',
    toiture: 'N/A',
    ameliorations_hors_sol: 'Rooftop terrace, Smart home features',
    numero_mls: 'C3456789',
    source: 'manual',
    notes: 'Modern townhouse near Highway 427'
  },
  {
    adresse: '18 Forest Hill Road',
    ville: 'Toronto',
    municipalite: 'Toronto',
    code_postal: 'M5P 2N7',
    province: 'ON',
    prix_vente: 5750000.00,
    prix_demande: 5995000.00,
    date_vente: '2024-07-20',
    status: 'Sold',
    type_propriete: 'Detached',
    genre_propriete: 'Estate',
    annee_construction: 1935,
    zonage: 'Residential',
    superficie_terrain_m2: 1393.55,
    superficie_terrain_pi2: 15000.00,
    frontage_m2: 30.48,
    profondeur_m2: 45.72,
    frontage_pi2: 100.00,
    profondeur_pi2: 150.00,
    superficie_habitable_m2: 558.39,
    superficie_habitable_pi2: 6010.00,
    nombre_chambres: 6,
    salle_bain: 5,
    salle_eau: 3,
    stationnement: 'Circular Driveway',
    dimension_garage: '12.19m x 6.10m (40ft x 20ft)',
    type_sous_sol: 'Fully Finished',
    toiture: 'Slate',
    ameliorations_hors_sol: 'Pool, Tennis court, Wine cellar, Home theater',
    numero_mls: 'C4567890',
    source: 'manual',
    notes: 'Prestigious Forest Hill estate with private grounds'
  },
  {
    adresse: '75 East Liberty Street, Unit 2108',
    ville: 'Toronto',
    municipalite: 'Toronto',
    code_postal: 'M6K 3P9',
    province: 'ON',
    prix_vente: 625000.00,
    prix_demande: 649000.00,
    date_vente: '2024-10-15',
    status: 'Sold',
    type_propriete: 'Condo Apartment',
    genre_propriete: 'High-Rise',
    annee_construction: 2016,
    zonage: 'Commercial Residential',
    superficie_terrain_m2: null,
    superficie_terrain_pi2: null,
    frontage_m2: null,
    profondeur_m2: null,
    frontage_pi2: null,
    profondeur_pi2: null,
    superficie_habitable_m2: 65.03,
    superficie_habitable_pi2: 700.00,
    nombre_chambres: 1,
    salle_bain: 1,
    salle_eau: 0,
    stationnement: 'None',
    dimension_garage: null,
    type_sous_sol: 'N/A',
    toiture: 'N/A',
    ameliorations_hors_sol: 'Open concept, Built-in murphy bed',
    numero_mls: 'C5678901',
    source: 'manual',
    notes: 'Perfect starter condo in Liberty Village'
  },
  {
    adresse: '255 Birchmount Road',
    ville: 'Toronto',
    municipalite: 'Scarborough',
    code_postal: 'M1N 3M2',
    province: 'ON',
    prix_vente: 1050000.00,
    prix_demande: 1099000.00,
    date_vente: '2024-09-25',
    status: 'Sold',
    type_propriete: 'Detached',
    genre_propriete: 'Bungalow',
    annee_construction: 1965,
    zonage: 'Residential',
    superficie_terrain_m2: 557.42,
    superficie_terrain_pi2: 6000.00,
    frontage_m2: 15.24,
    profondeur_m2: 36.58,
    frontage_pi2: 50.00,
    profondeur_pi2: 120.00,
    superficie_habitable_m2: 139.35,
    superficie_habitable_pi2: 1500.00,
    nombre_chambres: 3,
    salle_bain: 2,
    salle_eau: 0,
    stationnement: 'Driveway',
    dimension_garage: '6.10m x 6.10m (20ft x 20ft)',
    type_sous_sol: 'Fully Finished',
    toiture: 'Asphalt Shingle',
    ameliorations_hors_sol: 'Fully renovated (2019), New roof (2021)',
    numero_mls: 'C6789012',
    source: 'manual',
    notes: 'Renovated bungalow with large lot in Scarborough'
  }
]

async function seedTorontoProperties() {
  console.log('🌱 Seeding Toronto Properties...\n')

  for (const property of torontoProperties) {
    console.log(`📍 Inserting: ${property.adresse}`)

    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()

    if (error) {
      console.error(`   ❌ Error: ${error.message}`)
    } else {
      console.log(`   ✅ Success! ID: ${data[0].id}`)
    }
  }

  console.log('\n✨ Toronto properties seeded successfully!')
}

seedTorontoProperties().catch(console.error)
