import { Property, PropertyCreateInput } from '../types/property.types'

const STORAGE_KEY = 'vallea_properties'

// Mock data for initial state
const mockInitialData: Property[] = [
  {
    id: '1',
    organization_id: 'org-1',
    created_by: 'user-1',
    adresse: '123 Rue Principale',
    ville: 'Montréal',
    municipalite: 'Montréal',
    code_postal: 'H1A 1A1',
    province: 'QC',
    prix_vente: 485000,
    prix_demande: 495000,
    date_vente: new Date('2024-03-15'),
    jours_sur_marche: 45,
    status: 'Vendu',
    type_propriete: 'Unifamiliale',
    genre_propriete: 'Résidentiel',
    annee_construction: 2005,
    zonage: 'R-1',
    superficie_terrain_m2: 350,
    superficie_terrain_pi2: 3767,
    superficie_habitable_m2: 150,
    superficie_habitable_pi2: 1615,
    nombre_pieces: 8,
    nombre_chambres: 3,
    salle_bain: 2,
    salle_eau: 1,
    stationnement: 'Garage',
    dimension_garage: '20 x 20',
    type_sous_sol: 'Complet aménagé',
    toiture: 'Bardeaux d\'asphalte',
    ameliorations_hors_sol: 'Rénovations récentes',
    numero_mls: 'MTL-789456',
    floor_areas: [],
    media_references: [],
    source: 'Centris',
    notes: '',
    is_template: false,
    is_shared: true,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-03-15')
  },
  {
    id: '2',
    organization_id: 'org-1',
    created_by: 'user-1',
    adresse: '456 Avenue des Érables',
    ville: 'Laval',
    municipalite: 'Laval',
    code_postal: 'H7A 1B2',
    province: 'QC',
    prix_vente: 620000,
    prix_demande: 635000,
    date_vente: new Date('2024-03-22'),
    jours_sur_marche: 32,
    status: 'Vendu',
    type_propriete: 'Unifamiliale',
    genre_propriete: 'Résidentiel',
    annee_construction: 2010,
    zonage: 'R-1',
    superficie_terrain_m2: 400,
    superficie_terrain_pi2: 4306,
    superficie_habitable_m2: 180,
    superficie_habitable_pi2: 1938,
    nombre_pieces: 9,
    nombre_chambres: 4,
    salle_bain: 2,
    salle_eau: 1,
    stationnement: 'Garage',
    dimension_garage: '24 x 24',
    type_sous_sol: 'Complet aménagé',
    toiture: 'Bardeaux d\'asphalte',
    ameliorations_hors_sol: 'Cuisine rénovée',
    numero_mls: 'LAV-456123',
    floor_areas: [],
    media_references: [],
    source: 'MLS',
    notes: '',
    is_template: false,
    is_shared: true,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-03-22')
  }
]

class MockPropertiesService {
  private getStoredData(): Property[] {
    if (typeof window === 'undefined') return mockInitialData

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInitialData))
      return mockInitialData
    }

    return JSON.parse(stored).map((p: any) => ({
      ...p,
      date_vente: p.date_vente ? new Date(p.date_vente) : undefined,
      date_vente_precedente: p.date_vente_precedente ? new Date(p.date_vente_precedente) : undefined,
      created_at: new Date(p.created_at),
      updated_at: new Date(p.updated_at)
    }))
  }

  private saveData(data: Property[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }

  async getProperties(params: { offset?: number; limit?: number } = {}) {
    const data = this.getStoredData()
    const { offset = 0, limit = 50 } = params

    const sliced = data.slice(offset, offset + limit)

    return {
      items: sliced,
      total: data.length,
      hasMore: offset + limit < data.length
    }
  }

  async getProperty(id: string): Promise<Property> {
    const data = this.getStoredData()
    const property = data.find(p => p.id === id)
    if (!property) throw new Error('Property not found')
    return property
  }

  async create(propertyData: PropertyCreateInput): Promise<Property> {
    const data = this.getStoredData()
    const newProperty: Property = {
      id: Date.now().toString(),
      organization_id: 'org-1',
      created_by: 'user-1',
      ...propertyData,
      media_references: propertyData.media_references || [],
      is_template: propertyData.is_template || false,
      is_shared: propertyData.is_shared !== false,
      created_at: new Date(),
      updated_at: new Date()
    }

    data.push(newProperty)
    this.saveData(data)
    return newProperty
  }

  async update(id: string, updates: Partial<PropertyCreateInput>): Promise<Property> {
    const data = this.getStoredData()
    const index = data.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Property not found')

    const updatedProperty = {
      ...data[index],
      ...updates,
      updated_at: new Date()
    }

    data[index] = updatedProperty
    this.saveData(data)
    return updatedProperty
  }

  async delete(ids: string[]): Promise<void> {
    const data = this.getStoredData()
    const filtered = data.filter(p => !ids.includes(p.id))
    this.saveData(filtered)
  }

  async duplicate(id: string): Promise<Property> {
    const original = await this.getProperty(id)
    const duplicateData: PropertyCreateInput = {
      ...original,
      adresse: `${original.adresse} (Copie)`,
      numero_mls: undefined,
      source: 'duplicate'
    }

    return this.create(duplicateData)
  }
}

export const propertiesService = new MockPropertiesService()