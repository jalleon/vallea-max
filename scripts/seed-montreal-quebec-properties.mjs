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

const quebecProperties = [
  {
    adresse: '1188 Rue Ottawa, App 505',
    ville: 'Montréal',
    municipalite: 'Montréal',
    code_postal: 'H3C 1R5',
    province: 'QC',
    prix_vente: 725000.00,
    prix_demande: 749000.00,
    date_vente: '2024-09-28',
    status: 'Vendu',
    type_propriete: 'Copropriété',
    genre_propriete: 'Tour',
    annee_construction: 2019,
    zonage: 'Résidentiel',
    superficie_terrain_m2: null,
    superficie_terrain_pi2: null,
    frontage_m2: null,
    profondeur_m2: null,
    frontage_pi2: null,
    profondeur_pi2: null,
    superficie_habitable_m2: 111.48,
    superficie_habitable_pi2: 1200.00,
    nombre_chambres: 2,
    salle_bain: 2,
    salle_eau: 0,
    stationnement: '1 Stationnement intérieur',
    dimension_garage: null,
    type_sous_sol: 'S.O.',
    toiture: 'S.O.',
    ameliorations_hors_sol: 'Planchers chauffants, Électroménagers haut de gamme',
    numero_mls: 'M24567890',
    source: 'manual',
    notes: 'Condo moderne à Griffintown avec vue sur le canal Lachine'
  },
  {
    adresse: '525 Avenue Wiseman',
    ville: 'Montréal',
    municipalite: 'Outremont',
    code_postal: 'H2V 3B2',
    province: 'QC',
    prix_vente: 2450000.00,
    prix_demande: 2595000.00,
    date_vente: '2024-08-12',
    status: 'Vendu',
    type_propriete: 'Unifamiliale',
    genre_propriete: 'Cottage',
    annee_construction: 1925,
    zonage: 'Résidentiel',
    superficie_terrain_m2: 650.32,
    superficie_terrain_pi2: 7000.00,
    frontage_m2: 18.29,
    profondeur_m2: 35.56,
    frontage_pi2: 60.00,
    profondeur_pi2: 116.67,
    superficie_habitable_m2: 325.16,
    superficie_habitable_pi2: 3500.00,
    nombre_chambres: 5,
    salle_bain: 3,
    salle_eau: 2,
    stationnement: 'Garage détaché',
    dimension_garage: '6.10m x 6.10m (20pi x 20pi)',
    type_sous_sol: 'Aménagé',
    toiture: 'Bardeau d\'asphalte',
    ameliorations_hors_sol: 'Cuisine rénovée (2021), Piscine creusée',
    numero_mls: 'M25678901',
    source: 'manual',
    notes: 'Propriété de prestige à Outremont, quartier recherché'
  },
  {
    adresse: '4567 Rue Beaubien Est',
    ville: 'Montréal',
    municipalite: 'Rosemont',
    code_postal: 'H1T 1V4',
    province: 'QC',
    prix_vente: 875000.00,
    prix_demande: 899000.00,
    date_vente: '2024-10-05',
    status: 'Vendu',
    type_propriete: 'Duplex',
    genre_propriete: 'Jumelé',
    annee_construction: 1950,
    zonage: 'Résidentiel',
    superficie_terrain_m2: 372.02,
    superficie_terrain_pi2: 4004.00,
    frontage_m2: 12.19,
    profondeur_m2: 30.48,
    frontage_pi2: 40.00,
    profondeur_pi2: 100.00,
    superficie_habitable_m2: 204.39,
    superficie_habitable_pi2: 2200.00,
    nombre_chambres: 6,
    salle_bain: 2,
    salle_eau: 2,
    stationnement: 'Stationnement extérieur',
    dimension_garage: null,
    type_sous_sol: 'Non aménagé',
    toiture: 'Bardeau d\'asphalte',
    ameliorations_hors_sol: 'Rénové en 2018, Nouveaux balcons',
    numero_mls: 'M26789012',
    source: 'manual',
    notes: 'Duplex bien entretenu dans Rosemont, bon revenu locatif'
  },
  {
    adresse: '88 Rue Sainte-Anne, App 301',
    ville: 'Québec',
    municipalite: 'Québec',
    code_postal: 'G1R 3X2',
    province: 'QC',
    prix_vente: 485000.00,
    prix_demande: 499000.00,
    date_vente: '2024-09-18',
    status: 'Vendu',
    type_propriete: 'Copropriété',
    genre_propriete: 'Historique',
    annee_construction: 1875,
    zonage: 'Résidentiel patrimonial',
    superficie_terrain_m2: null,
    superficie_terrain_pi2: null,
    frontage_m2: null,
    profondeur_m2: null,
    frontage_pi2: null,
    profondeur_pi2: null,
    superficie_habitable_m2: 74.32,
    superficie_habitable_pi2: 800.00,
    nombre_chambres: 1,
    salle_bain: 1,
    salle_eau: 0,
    stationnement: 'Aucun',
    dimension_garage: null,
    type_sous_sol: 'S.O.',
    toiture: 'S.O.',
    ameliorations_hors_sol: 'Poutres apparentes, Planchers d\'origine',
    numero_mls: 'Q27890123',
    source: 'manual',
    notes: 'Charmant condo dans le Vieux-Québec, bâtiment patrimonial'
  },
  {
    adresse: '1275 Avenue Greene',
    ville: 'Montréal',
    municipalite: 'Westmount',
    code_postal: 'H3Z 2A4',
    province: 'QC',
    prix_vente: 4250000.00,
    prix_demande: 4495000.00,
    date_vente: '2024-07-30',
    status: 'Vendu',
    type_propriete: 'Unifamiliale',
    genre_propriete: 'Manoir',
    annee_construction: 1912,
    zonage: 'Résidentiel',
    superficie_terrain_m2: 1858.06,
    superficie_terrain_pi2: 20000.00,
    frontage_m2: 36.58,
    profondeur_m2: 50.81,
    frontage_pi2: 120.00,
    profondeur_pi2: 166.67,
    superficie_habitable_m2: 650.32,
    superficie_habitable_pi2: 7000.00,
    nombre_chambres: 7,
    salle_bain: 5,
    salle_eau: 3,
    stationnement: 'Garage triple',
    dimension_garage: '18.29m x 6.10m (60pi x 20pi)',
    type_sous_sol: 'Entièrement aménagé',
    toiture: 'Ardoise',
    ameliorations_hors_sol: 'Cave à vin, Cinéma maison, Piscine intérieure',
    numero_mls: 'M28901234',
    source: 'manual',
    notes: 'Manoir historique à Westmount, architecture exceptionnelle'
  },
  {
    adresse: '2845 Boulevard Hochelaga, App 1202',
    ville: 'Québec',
    municipalite: 'Sainte-Foy',
    code_postal: 'G1V 2P6',
    province: 'QC',
    prix_vente: 395000.00,
    prix_demande: 419000.00,
    date_vente: '2024-10-12',
    status: 'Vendu',
    type_propriete: 'Copropriété',
    genre_propriete: 'Tour',
    annee_construction: 2015,
    zonage: 'Résidentiel',
    superficie_terrain_m2: null,
    superficie_terrain_pi2: null,
    frontage_m2: null,
    profondeur_m2: null,
    frontage_pi2: null,
    profondeur_pi2: null,
    superficie_habitable_m2: 83.61,
    superficie_habitable_pi2: 900.00,
    nombre_chambres: 2,
    salle_bain: 1,
    salle_eau: 0,
    stationnement: '1 Stationnement intérieur',
    dimension_garage: null,
    type_sous_sol: 'S.O.',
    toiture: 'S.O.',
    ameliorations_hors_sol: 'Balcon, Rangement',
    numero_mls: 'Q29012345',
    source: 'manual',
    notes: 'Condo moderne à Sainte-Foy, près des universités'
  },
  {
    adresse: '1355 Chemin Sillery',
    ville: 'Québec',
    municipalite: 'Sillery',
    code_postal: 'G1S 1N2',
    province: 'QC',
    prix_vente: 1850000.00,
    prix_demande: 1949000.00,
    date_vente: '2024-08-25',
    status: 'Vendu',
    type_propriete: 'Unifamiliale',
    genre_propriete: 'Cottage',
    annee_construction: 1965,
    zonage: 'Résidentiel',
    superficie_terrain_m2: 2787.09,
    superficie_terrain_pi2: 30000.00,
    frontage_m2: 45.72,
    profondeur_m2: 60.96,
    frontage_pi2: 150.00,
    profondeur_pi2: 200.00,
    superficie_habitable_m2: 418.06,
    superficie_habitable_pi2: 4500.00,
    nombre_chambres: 5,
    salle_bain: 4,
    salle_eau: 2,
    stationnement: 'Garage double',
    dimension_garage: '12.19m x 6.10m (40pi x 20pi)',
    type_sous_sol: 'Aménagé',
    toiture: 'Bardeau d\'asphalte',
    ameliorations_hors_sol: 'Vue sur le fleuve, Terrain boisé privé',
    numero_mls: 'Q30123456',
    source: 'manual',
    notes: 'Propriété de luxe à Sillery avec vue imprenable sur le fleuve'
  },
  {
    adresse: '4123 Rue Saint-Denis',
    ville: 'Montréal',
    municipalite: 'Le Plateau-Mont-Royal',
    code_postal: 'H2W 2M7',
    province: 'QC',
    prix_vente: 1575000.00,
    prix_demande: 1649000.00,
    date_vente: '2024-09-03',
    status: 'Vendu',
    type_propriete: 'Triplex',
    genre_propriete: 'Traditionnel',
    annee_construction: 1920,
    zonage: 'Résidentiel',
    superficie_terrain_m2: 278.71,
    superficie_terrain_pi2: 3000.00,
    frontage_m2: 9.14,
    profondeur_m2: 30.48,
    frontage_pi2: 30.00,
    profondeur_pi2: 100.00,
    superficie_habitable_m2: 288.29,
    superficie_habitable_pi2: 3103.00,
    nombre_chambres: 9,
    salle_bain: 3,
    salle_eau: 3,
    stationnement: 'Cour arrière',
    dimension_garage: null,
    type_sous_sol: 'Partiellement aménagé',
    toiture: 'Membrane élastomère',
    ameliorations_hors_sol: 'Escalier extérieur rénové, Nouvelles fenêtres',
    numero_mls: 'M31234567',
    source: 'manual',
    notes: 'Triplex sur le Plateau, excellent investissement locatif'
  }
]

async function seedQuebecProperties() {
  console.log('🌱 Seeding Montreal/Quebec City Properties...\n')

  for (const property of quebecProperties) {
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

  console.log('\n✨ Montreal/Quebec City properties seeded successfully!')
}

seedQuebecProperties().catch(console.error)
