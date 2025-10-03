import { supabase } from '@/lib/supabase/client'
import { Property, PropertyCreateInput } from '../types/property.types'

class PropertiesSupabaseService {
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
      items: (data || []) as Property[],
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

    return data as Property
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
      .insert([{
        ...cleanedData,
        organization_id: organizationId,
        created_by: user.id
      } as any])
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

    return (data || []) as Property[]
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
    const { id: _, created_at, updated_at, ...duplicateData } = original

    return this.createProperty({
      ...duplicateData,
      adresse: `${duplicateData.adresse} (Copy)`,
      floor_areas: duplicateData.floor_areas?.map(({ id, property_id, created_at, ...floor }) => floor)
    } as PropertyCreateInput)
  }
}

export const propertiesSupabaseService = new PropertiesSupabaseService()
