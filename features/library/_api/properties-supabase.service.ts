import { supabase } from '@/lib/supabase/client'
import { Property, PropertyCreateInput } from '../types/property.types'
import { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type FloorAreaRow = Database['public']['Tables']['floor_areas']['Row']

class PropertiesSupabaseService {
  // Transform Supabase data to Property type
  private transformToProperty(data: PropertyRow & { floor_areas: FloorAreaRow[] }): Property {
    // Extract property ID from media_references if available
    let propertyIdNo: string | undefined
    let mediaFiles: any[] = []

    if (data.media_references) {
      const mediaRefs = data.media_references as any
      if (typeof mediaRefs === 'object' && !Array.isArray(mediaRefs)) {
        propertyIdNo = mediaRefs.metadata?.property_id_no
        mediaFiles = mediaRefs.files || []
      } else if (Array.isArray(mediaRefs)) {
        mediaFiles = mediaRefs
      }
    }

    return {
      id: data.id,
      organization_id: data.organization_id!,
      created_by: data.created_by!,
      property_id_no: propertyIdNo,
      adresse: data.adresse,
      ville: data.ville || undefined,
      municipalite: data.municipalite || undefined,
      code_postal: data.code_postal || undefined,
      province: data.province || undefined,
      prix_vente: data.prix_vente || undefined,
      prix_demande: data.prix_demande || undefined,
      date_vente: data.date_vente || undefined,
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
      nombre_stationnement: data.nombre_stationnement || undefined,
      type_garage: data.type_garage as any,
      dimension_garage: data.dimension_garage || undefined,
      type_sous_sol: data.type_sous_sol as any,
      toiture: data.toiture || undefined,
      ameliorations_hors_sol: data.ameliorations_hors_sol || undefined,
      numero_mls: data.numero_mls || undefined,
      date_vente_precedente: data.date_vente_precedente || undefined,
      prix_vente_precedente: data.prix_vente_precedente || undefined,
      source: data.source || undefined,
      notes: data.notes || undefined,
      is_template: data.is_template || false,
      is_shared: data.is_shared || false,
      // Rental/evaluation fields
      frais_condo: data.frais_condo || undefined,
      floor_number: data.floor_number || undefined,
      loyer_en_place: data.loyer_en_place || undefined,
      unit_rents: data.unit_rents as any,
      type_evaluation: data.type_evaluation as any,
      occupancy: data.occupancy as any,
      localisation: data.localisation as any,
      type_copropriete: data.type_copropriete as any,
      type_batiment: data.type_batiment as any,
      chrono_age: data.chrono_age || undefined,
      eff_age: data.eff_age || undefined,
      extras: data.extras || undefined,

      // Municipal data
      lot_number: data.lot_number || undefined,
      additional_lots: data.additional_lots as any,
      matricule: data.matricule || undefined,
      eval_municipale_annee: data.eval_municipale_annee || undefined,
      eval_municipale_terrain: data.eval_municipale_terrain || undefined,
      eval_municipale_batiment: data.eval_municipale_batiment || undefined,
      eval_municipale_total: data.eval_municipale_total || undefined,
      taxes_municipales_annee: data.taxes_municipales_annee || undefined,
      taxes_municipales_montant: data.taxes_municipales_montant || undefined,
      taxes_scolaires_annee: data.taxes_scolaires_annee || undefined,
      taxes_scolaires_montant: data.taxes_scolaires_montant || undefined,
      zoning_usages_permis: data.zoning_usages_permis || undefined,
      aire_habitable_m2: data.aire_habitable_m2 || undefined,
      aire_habitable_pi2: data.aire_habitable_pi2 || undefined,

      // Inspection fields
      inspection_status: data.inspection_status as any,
      inspection_date: data.inspection_date || undefined,
      inspection_completion: data.inspection_completion || undefined,
      inspection_pieces: data.inspection_pieces as any,
      inspection_batiment: data.inspection_batiment as any,
      inspection_garage: data.inspection_garage as any,
      inspection_mecanique: data.inspection_mecanique as any,
      inspection_exterieur: data.inspection_exterieur as any,
      inspection_divers: data.inspection_divers as any,
      inspection_categories_completed: data.inspection_categories_completed as any,

      // Field source tracking
      field_sources: data.field_sources as any,

      created_at: new Date(data.created_at!),
      updated_at: new Date(data.updated_at!),
      media_references: mediaFiles,
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

  // Get all properties (no pagination) - useful for dropdowns/selectors
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, floor_areas(*)')
      .order('adresse', { ascending: true })

    if (error) {
      console.error('Error fetching all properties:', error)
      throw error
    }

    return (data || []).map(item => this.transformToProperty(item))
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

  // Alias for getProperty - for consistency with other services
  async getById(id: string): Promise<Property> {
    return this.getProperty(id)
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

    // Generate unique property ID
    const year = new Date().getFullYear().toString().slice(-2)

    // Get all existing property IDs for this year to find the highest sequence number
    const { data: existingProperties } = await supabase
      .from('properties')
      .select('media_references')
      .eq('organization_id', organizationId)
      .gte('created_at', `${new Date().getFullYear()}-01-01`)

    // Extract existing ID numbers to find the highest sequence
    let maxSequence = 0
    if (existingProperties && existingProperties.length > 0) {
      existingProperties.forEach(prop => {
        const mediaRefs = prop.media_references as any
        if (mediaRefs && typeof mediaRefs === 'object' && !Array.isArray(mediaRefs)) {
          const idNo = mediaRefs.metadata?.property_id_no
          if (idNo && typeof idNo === 'string') {
            // Extract sequence number from format "YY-XXXX"
            const match = idNo.match(/^\d{2}-(\d{4})$/)
            if (match) {
              const seq = parseInt(match[1], 10)
              if (seq > maxSequence) {
                maxSequence = seq
              }
            }
          }
        }
      })
    }

    // Generate the next sequence number
    const seqNumber = (maxSequence + 1).toString().padStart(4, '0')
    const propertyIdNo = `${year}-${seqNumber}`

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

    // Prepare media_references with property ID
    const mediaReferences = Array.isArray(cleanedData.media_references)
      ? cleanedData.media_references
      : []

    // Add property ID to media_references metadata
    const updatedMediaReferences = {
      files: mediaReferences,
      metadata: {
        property_id_no: propertyIdNo
      }
    }

    // Create the property - RLS handles access control
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        ...cleanedData,
        media_references: updatedMediaReferences,
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
    // Separate floor_areas and inspection fields from main property data
    const {
      floor_areas,
      inspection_pieces,
      inspection_batiment,
      inspection_garage,
      inspection_mecanique,
      inspection_exterieur,
      inspection_divers,
      ...propertyData
    } = input

    // Prepare update data with properly typed JSONB fields
    const updateData: any = {
      ...propertyData,
      ...(inspection_pieces !== undefined && { inspection_pieces: inspection_pieces as any }),
      ...(inspection_batiment !== undefined && { inspection_batiment: inspection_batiment as any }),
      ...(inspection_garage !== undefined && { inspection_garage: inspection_garage as any }),
      ...(inspection_mecanique !== undefined && { inspection_mecanique: inspection_mecanique as any }),
      ...(inspection_exterieur !== undefined && { inspection_exterieur: inspection_exterieur as any }),
      ...(inspection_divers !== undefined && { inspection_divers: inspection_divers as any }),
    }

    // Update the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .update(updateData)
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

  async findByAddress(address: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, floor_areas(*)')
      .ilike('adresse', address)
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error finding property by address:', error)
      throw error
    }

    return data ? this.transformToProperty(data) : null
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
      date_vente: duplicateData.date_vente,
      date_vente_precedente: duplicateData.date_vente_precedente,
      floor_areas: duplicateData.floor_areas?.map(({ id, ...floor }) => ({
        floor: floor.floor,
        area_m2: floor.area_m2,
        area_ft2: floor.area_ft2,
        type: floor.type
      }))
    } as PropertyCreateInput)
  }

  // Utility method to fix duplicate IDs
  async fixDuplicateIds(organizationId?: string): Promise<void> {
    // Get current user if no org ID provided
    if (!organizationId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User must be authenticated')
      organizationId = user.user_metadata?.organization_id
      if (!organizationId) throw new Error('User must belong to an organization')
    }

    const year = new Date().getFullYear().toString().slice(-2)

    // Get all properties for this organization this year
    const { data: properties } = await supabase
      .from('properties')
      .select('id, media_references, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', `${new Date().getFullYear()}-01-01`)
      .order('created_at', { ascending: true })

    if (!properties || properties.length === 0) return

    // Track used IDs and find duplicates
    const usedIds = new Set<string>()
    const toUpdate: { id: string, newIdNo: string }[] = []
    let nextSequence = 1

    for (const prop of properties) {
      const mediaRefs = prop.media_references as any
      let currentIdNo: string | undefined

      if (mediaRefs && typeof mediaRefs === 'object' && !Array.isArray(mediaRefs)) {
        currentIdNo = mediaRefs.metadata?.property_id_no
      }

      // If no ID or duplicate ID, assign a new one
      if (!currentIdNo || usedIds.has(currentIdNo)) {
        // Find next available sequence number
        while (usedIds.has(`${year}-${nextSequence.toString().padStart(4, '0')}`)) {
          nextSequence++
        }
        const newIdNo = `${year}-${nextSequence.toString().padStart(4, '0')}`
        toUpdate.push({ id: prop.id, newIdNo })
        usedIds.add(newIdNo)
        nextSequence++
      } else {
        usedIds.add(currentIdNo)
        // Update nextSequence if this ID uses a higher number
        const match = currentIdNo.match(/^\d{2}-(\d{4})$/)
        if (match) {
          const seq = parseInt(match[1], 10)
          if (seq >= nextSequence) {
            nextSequence = seq + 1
          }
        }
      }
    }

    // Update properties with new IDs
    for (const { id, newIdNo } of toUpdate) {
      const { data: prop } = await supabase
        .from('properties')
        .select('media_references')
        .eq('id', id)
        .single()

      const mediaRefs = prop?.media_references as any || {}
      const updatedMediaRefs = {
        files: Array.isArray(mediaRefs) ? mediaRefs : (mediaRefs.files || []),
        metadata: {
          ...(typeof mediaRefs === 'object' && !Array.isArray(mediaRefs) ? mediaRefs.metadata : {}),
          property_id_no: newIdNo
        }
      }

      await supabase
        .from('properties')
        .update({ media_references: updatedMediaRefs })
        .eq('id', id)
    }

    console.log(`Fixed ${toUpdate.length} duplicate IDs`)
  }
}

export const propertiesSupabaseService = new PropertiesSupabaseService()
