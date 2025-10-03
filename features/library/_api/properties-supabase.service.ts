import { supabase } from '@/lib/supabase/client'
import { Property, PropertyCreateInput } from '../types/property.types'
import { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type FloorAreaRow = Database['public']['Tables']['floor_areas']['Row']

class PropertiesSupabaseService {
  // Transform Supabase data to Property type
  private transformToProperty(data: PropertyRow & { floor_areas: FloorAreaRow[] }): Property {
    return {
      id: data.id,
      organization_id: data.organization_id!,
      created_by: data.created_by!,
      adresse: data.adresse,
      ville: data.ville || undefined,
      municipalite: data.municipalite || undefined,
      code_postal: data.code_postal || undefined,
      province: data.province || undefined,
      prix_vente: data.prix_vente || undefined,
      prix_demande: data.prix_demande || undefined,
      date_vente: data.date_vente ? new Date(data.date_vente) : undefined,
      jours_sur_marche: data.jours_sur_marche || undefined,
      status: data.status as any,
      type_propriete: data.type_propriete as any,
      genre_propriete: data.genre_propriete || undefined,
      annee_construction: data.annee_construction || undefined,
      zonage: data.zonage || undefined,
      superficie_terrain_m2: data.superficie_terrain_m2 || undefined,
      superficie_terrain_pi2: data.superficie_terrain_pi2 || undefined,
      frontage_m2: data.frontage_m2 || undefined,
      profondeur_m2: data.profondeur_m2 || undefined,
      frontage_pi2: data.frontage_pi2 || undefined,
      profondeur_pi2: data.profondeur_pi2 || undefined,
      superficie_habitable_m2: data.superficie_habitable_m2 || undefined,
      superficie_habitable_pi2: data.superficie_habitable_pi2 || undefined,
      perimetre_batiment_m2: data.perimetre_batiment_m2 || undefined,
      perimetre_batiment_pi2: data.perimetre_batiment_pi2 || undefined,
      nombre_pieces: data.nombre_pieces || undefined,
      nombre_chambres: data.nombre_chambres || undefined,
      salle_bain: data.salle_bain || undefined,
      salle_eau: data.salle_eau || undefined,
      stationnement: data.stationnement as any,
      dimension_garage: data.dimension_garage || undefined,
      type_sous_sol: data.type_sous_sol as any,
      toiture: data.toiture || undefined,
      ameliorations_hors_sol: data.ameliorations_hors_sol || undefined,
      numero_mls: data.numero_mls || undefined,
      date_vente_precedente: data.date_vente_precedente ? new Date(data.date_vente_precedente) : undefined,
      prix_vente_precedente: data.prix_vente_precedente || undefined,
      source: data.source || undefined,
      notes: data.notes || undefined,
      is_template: data.is_template || false,
      is_shared: data.is_shared || false,
      created_at: new Date(data.created_at!),
      updated_at: new Date(data.updated_at!),
      media_references: Array.isArray(data.media_references) ? data.media_references as any : [],
      floor_areas: (data.floor_areas || []).map(fa => ({
        id: fa.id,
        floor: fa.floor as any,
        area_m2: fa.area_m2,
        area_ft2: fa.area_ft2,
        type: fa.type as any
      }))
    }
  }

  async getProperties(params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 50 } = params

    const { data, error, count } = await supabase
      .from('properties')
      .select('*, floor_areas(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching properties:', error)
      throw error
    }

    return {
      items: (data || []).map(item => this.transformToProperty(item)),
      total: count || 0,
      hasMore: offset + limit < (count || 0)
    }
  }

  async getProperty(id: string): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, floor_areas(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      throw error
    }

    if (!data) {
      throw new Error('Property not found')
    }

    return this.transformToProperty(data)
  }

  async createProperty(input: PropertyCreateInput): Promise<Property> {
    // Separate floor_areas from main property data
    const { floor_areas, ...propertyData } = input

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    // Get organization_id from user metadata
    const organizationId = user.user_metadata?.organization_id

    if (!organizationId) {
      throw new Error('User must belong to an organization')
    }

    // Clean up empty string values - convert to null for database
    const cleanedData = Object.entries(propertyData).reduce((acc, [key, value]) => {
      // Convert empty strings to null
      if (value === '' || value === undefined) {
        acc[key] = null
      } else {
        acc[key] = value
      }
      return acc
    }, {} as any)

    // Create the property - RLS handles access control
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        ...cleanedData,
        organization_id: organizationId,
        created_by: user.id
      })
      .select()
      .single()

    if (propertyError) {
      console.error('Error creating property:', propertyError)
      throw propertyError
    }

    // Create floor areas if provided
    if (floor_areas && floor_areas.length > 0) {
      const floorAreasWithPropertyId = floor_areas.map(floor => ({
        ...floor,
        property_id: property.id
      }))

      const { error: floorAreasError } = await supabase
        .from('floor_areas')
        .insert(floorAreasWithPropertyId)

      if (floorAreasError) {
        console.error('Error creating floor areas:', floorAreasError)
        // Don't throw - property was created successfully
      }
    }

    // Fetch the complete property with floor_areas
    return this.getProperty(property.id)
  }

  async updateProperty(id: string, input: Partial<PropertyCreateInput>): Promise<Property> {
    // Separate floor_areas from main property data
    const { floor_areas, ...propertyData } = input

    // Update the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single()

    if (propertyError) {
      console.error('Error updating property:', propertyError)
      throw propertyError
    }

    // Update floor areas if provided
    if (floor_areas !== undefined) {
      // Delete existing floor areas
      await supabase
        .from('floor_areas')
        .delete()
        .eq('property_id', id)

      // Insert new floor areas
      if (floor_areas.length > 0) {
        const floorAreasWithPropertyId = floor_areas.map(floor => ({
          ...floor,
          property_id: id
        }))

        const { error: floorAreasError } = await supabase
          .from('floor_areas')
          .insert(floorAreasWithPropertyId)

        if (floorAreasError) {
          console.error('Error updating floor areas:', floorAreasError)
        }
      }
    }

    // Fetch the complete property with floor_areas
    return this.getProperty(id)
  }

  async deleteProperty(id: string): Promise<void> {
    // Floor areas will be automatically deleted due to ON DELETE CASCADE
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting property:', error)
      throw error
    }
  }

  async searchProperties(query: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, floor_areas(*)')
      .or(`adresse.ilike.%${query}%,ville.ilike.%${query}%,municipalite.ilike.%${query}%,numero_mls.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching properties:', error)
      throw error
    }

    return (data || []).map(item => this.transformToProperty(item))
  }

  // Alias methods to match mock service interface
  async create(input: PropertyCreateInput): Promise<Property> {
    return this.createProperty(input)
  }

  async update(id: string, input: Partial<PropertyCreateInput>): Promise<Property> {
    return this.updateProperty(id, input)
  }

  async delete(ids: string | string[]): Promise<void> {
    const idsArray = Array.isArray(ids) ? ids : [ids]

    for (const id of idsArray) {
      await this.deleteProperty(id)
    }
  }

  async duplicate(id: string): Promise<Property> {
    const original = await this.getProperty(id)
    const { id: _, created_at, updated_at, organization_id, created_by, ...duplicateData } = original

    return this.createProperty({
      ...duplicateData,
      adresse: `${duplicateData.adresse} (Copy)`,
      date_vente: duplicateData.date_vente?.toISOString(),
      date_vente_precedente: duplicateData.date_vente_precedente?.toISOString(),
      floor_areas: duplicateData.floor_areas?.map(({ id, ...floor }) => ({
        floor: floor.floor,
        area_m2: floor.area_m2,
        area_ft2: floor.area_ft2,
        type: floor.type
      }))
    } as PropertyCreateInput)
  }
}

export const propertiesSupabaseService = new PropertiesSupabaseService()
