import { useState, useEffect } from 'react'
import { Property, PropertyCreateInput, PropertyUpdateInput } from '../types/property.types'
import { PropertyFilters, PaginatedResponse } from '@/types/common.types'

// Mock data for demo
const mockProperties: Property[] = [
  {
    id: '1',
    organization_id: '1',
    created_by: '1',
    adresse: '123 Rue Principale',
    ville: 'Montréal',
    municipalite: 'Ville-Marie',
    code_postal: 'H1A 1A1',
    province: 'QC',
    prix_vente: 450000,
    prix_demande: 475000,
    date_vente: '2024-08-15',
    status: 'Vendu',
    type_propriete: 'Unifamiliale',
    genre_propriete: 'Détachée',
    annee_construction: 2010,
    zonage: 'Résidentiel',
    superficie_terrain_m2: 650,
    superficie_terrain_pi2: 7000,
    superficie_habitable_m2: 185,
    superficie_habitable_pi2: 2000,
    nombre_chambres: 3,
    salle_bain: 2,
    salle_eau: 1,
    stationnement: 'Garage',
    type_sous_sol: 'Complet',
    numero_mls: 'MLS12345',
    media_references: [],
    source: 'Manuel',
    is_template: false,
    is_shared: true,
    created_at: new Date('2024-08-01'),
    updated_at: new Date('2024-08-15')
  },
  {
    id: '2',
    organization_id: '1',
    created_by: '1',
    adresse: '456 Avenue du Parc',
    ville: 'Laval',
    code_postal: 'H7G 2R4',
    province: 'QC',
    prix_vente: 320000,
    prix_demande: 335000,
    date_vente: '2024-09-10',
    status: 'Vendu',
    type_propriete: 'Condo',
    annee_construction: 2018,
    superficie_habitable_m2: 95,
    superficie_habitable_pi2: 1025,
    nombre_chambres: 2,
    salle_bain: 1,
    numero_mls: 'MLS67890',
    media_references: [],
    is_template: false,
    is_shared: true,
    created_at: new Date('2024-09-01'),
    updated_at: new Date('2024-09-10')
  }
]

export function useProperties(filters?: PropertyFilters) {
  const [data, setData] = useState<PaginatedResponse<Property>>({
    items: mockProperties,
    total: mockProperties.length,
    hasMore: false
  })
  const [isLoading, setIsLoading] = useState(false)

  return { data, isLoading, error: null }
}

export function useCreateProperty() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (property: PropertyCreateInput): Promise<Property> => {
    setIsPending(true)
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newProperty: Property = {
      id: Math.random().toString(),
      organization_id: '1',
      created_by: '1',
      ...property,
      media_references: [],
      is_template: property.is_template || false,
      is_shared: property.is_shared !== false,
      created_at: new Date(),
      updated_at: new Date()
    }

    setIsPending(false)
    return newProperty
  }

  return { mutateAsync, isPending }
}

export function useUpdateProperty() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ id, updates }: { id: string; updates: Partial<PropertyUpdateInput> }): Promise<Property> => {
    setIsPending(true)
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const existingProperty = mockProperties.find(p => p.id === id)
    if (!existingProperty) throw new Error('Property not found')

    const updatedProperty: Property = {
      ...existingProperty,
      ...updates,
      updated_at: new Date()
    }

    setIsPending(false)
    return updatedProperty
  }

  return { mutateAsync, isPending }
}

export function useDeleteProperties() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (ids: string[]): Promise<void> => {
    setIsPending(true)
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsPending(false)
  }

  return { mutateAsync, isPending }
}