import { supabase } from '@/lib/supabase/client'
import { Property, PropertyCreateInput, PropertyUpdateInput } from '../types/property.types'
import { PropertyFilters, PaginatedResponse } from '@/types/common.types'
import { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export class PropertiesService {
  // Transform Supabase data to Property type
  private transformToProperty(data: PropertyRow): Property {
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
      floor_areas: []
    }
  }

  async getProperties(params: {
    offset?: number
    limit?: number
    filters?: PropertyFilters
  }): Promise<PaginatedResponse<Property>> {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })

    // Apply filters
    if (params.filters?.type_propriete) {
      query = query.eq('type_propriete', params.filters.type_propriete)
    }
    if (params.filters?.ville) {
      query = query.eq('ville', params.filters.ville)
    }
    if (params.filters?.prix_min) {
      query = query.gte('prix_vente', params.filters.prix_min)
    }
    if (params.filters?.prix_max) {
      query = query.lte('prix_vente', params.filters.prix_max)
    }
    if (params.filters?.superficie_min) {
      query = query.gte('superficie_habitable_m2', params.filters.superficie_min)
    }
    if (params.filters?.superficie_max) {
      query = query.lte('superficie_habitable_m2', params.filters.superficie_max)
    }
    if (params.filters?.annee_construction_min) {
      query = query.gte('annee_construction', params.filters.annee_construction_min)
    }
    if (params.filters?.annee_construction_max) {
      query = query.lte('annee_construction', params.filters.annee_construction_max)
    }
    if (params.filters?.search) {
      query = query.textSearch('search_vector', params.filters.search)
    }

    // Pagination
    const start = params.offset || 0
    const end = start + (params.limit || 50) - 1
    query = query.range(start, end)

    // Order by updated_at desc
    query = query.order('updated_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    return {
      items: (data || []).map(item => this.transformToProperty(item)),
      total: count || 0,
      hasMore: (count || 0) > end + 1
    }
  }

  async getProperty(id: string): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return this.transformToProperty(data)
  }

  async create(property: PropertyCreateInput): Promise<Property> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.user.id)
      .single()

    if (!userProfile?.organization_id) throw new Error('User organization not found')

    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...property,
        organization_id: userProfile.organization_id,
        created_by: user.user.id,
        media_references: [],
        is_template: property.is_template || false,
        is_shared: property.is_shared !== false, // Default to true
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity('property_created', data.id)

    return this.transformToProperty(data)
  }

  async update(id: string, updates: Partial<PropertyUpdateInput>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity('property_updated', id)

    return this.transformToProperty(data)
  }

  async delete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .in('id', ids)

    if (error) throw error

    // Log activity for each deleted property
    for (const id of ids) {
      await this.logActivity('property_deleted', id)
    }
  }

  async duplicate(id: string): Promise<Property> {
    // First get the original property
    const original = await this.getProperty(id)

    // Create a copy with modified address
    const duplicateData: PropertyCreateInput = {
      ...original,
      adresse: `${original.adresse} (Copie)`,
      numero_mls: undefined, // Clear MLS number for duplicate
      source: 'duplicate'
    }

    // Create the duplicate
    const newProperty = await this.create(duplicateData)

    // Log activity
    await this.logActivity('property_duplicated', newProperty.id, {
      original_id: id
    })

    return newProperty
  }

  async bulkImport(properties: PropertyCreateInput[]): Promise<Property[]> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.user.id)
      .single()

    if (!userProfile?.organization_id) throw new Error('User organization not found')

    const propertiesWithMeta = properties.map(property => ({
      ...property,
      organization_id: userProfile.organization_id,
      created_by: user.user.id,
      media_references: [],
      is_template: property.is_template || false,
      is_shared: property.is_shared !== false,
    }))

    const { data, error } = await supabase
      .from('properties')
      .insert(propertiesWithMeta)
      .select()

    if (error) throw error

    // Log bulk import activity
    await this.logActivity('properties_bulk_imported', null, {
      count: data.length
    })

    return data.map(item => this.transformToProperty(item))
  }

  async searchComparables(criteria: {
    address?: string
    city?: string
    propertyType?: string
    minPrice?: number
    maxPrice?: number
    minArea?: number
    maxArea?: number
    exclude?: string[]
    limit?: number
  }): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select('*')

    if (criteria.city) {
      query = query.eq('ville', criteria.city)
    }
    if (criteria.propertyType) {
      query = query.eq('type_propriete', criteria.propertyType)
    }
    if (criteria.minPrice) {
      query = query.gte('prix_vente', criteria.minPrice)
    }
    if (criteria.maxPrice) {
      query = query.lte('prix_vente', criteria.maxPrice)
    }
    if (criteria.minArea) {
      query = query.gte('superficie_habitable_m2', criteria.minArea)
    }
    if (criteria.maxArea) {
      query = query.lte('superficie_habitable_m2', criteria.maxArea)
    }
    if (criteria.exclude && criteria.exclude.length > 0) {
      query = query.not('id', 'in', `(${criteria.exclude.join(',')})`)
    }

    // Only get sold properties for comparables
    query = query.eq('status', 'Vendu')
    query = query.not('prix_vente', 'is', null)

    // Order by most recent sales
    query = query.order('date_vente', { ascending: false })

    if (criteria.limit) {
      query = query.limit(criteria.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(item => this.transformToProperty(item))
  }

  async findByMLSNumber(mlsNumber: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('numero_mls', mlsNumber)
      .maybeSingle()

    if (error) throw error
    return data ? this.transformToProperty(data) : null
  }

  async getCities(): Promise<string[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('ville')
      .not('ville', 'is', null)
      .group('ville')

    if (error) throw error
    return (data || []).map(row => row.ville).filter(Boolean)
  }

  async getPropertyTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('type_propriete')
      .not('type_propriete', 'is', null)
      .group('type_propriete')

    if (error) throw error
    return (data || []).map(row => row.type_propriete).filter(Boolean)
  }

  private async logActivity(action: string, entityId: string | null, metadata?: any) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.user.id)
        .single()

      if (!userProfile?.organization_id) return

      await supabase
        .from('activity_log')
        .insert({
          organization_id: userProfile.organization_id,
          user_id: user.user.id,
          action,
          entity_type: 'property',
          entity_id: entityId,
          metadata: metadata || {}
        })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }
}

export const propertiesService = new PropertiesService()