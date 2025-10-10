import { createClient } from '@/lib/supabase/client'
import { Property, InspectionPieces, InspectionStatus, InspectionCategory } from '@/features/library/types/property.types'

/**
 * Inspection Service
 * Handles inspection data management and progress calculations
 */

// Category weights for overall progress calculation
const CATEGORY_WEIGHTS = {
  pieces: 40,
  batiment: 15,
  garage: 10,
  mecanique: 15,
  divers: 0,
  exterieur: 20
}

class InspectionService {
  /**
   * Update room data in inspection_pieces JSONB field
   */
  async updateRoomData(
    propertyId: string,
    floorId: string,
    roomId: string,
    roomData: Record<string, any>
  ): Promise<void> {
    const supabase = createClient()

    try {
      // First, get the current property data
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('inspection_pieces')
        .eq('id', propertyId)
        .single()

      if (fetchError) throw fetchError

      const currentData: InspectionPieces = (property.inspection_pieces as unknown as InspectionPieces) || {
        floors: {},
        totalRooms: 0,
        completedRooms: 0
      }

      // Update the specific room
      if (!currentData.floors[floorId]) {
        throw new Error(`Floor ${floorId} not found`)
      }

      const wasCompleted = currentData.floors[floorId].rooms[roomId]?.completedAt !== undefined
      const isNowCompleted = roomData.completedAt !== undefined

      // Update the room data
      currentData.floors[floorId].rooms[roomId] = {
        ...currentData.floors[floorId].rooms[roomId],
        ...roomData
      }

      // Update completed rooms count
      if (!wasCompleted && isNowCompleted) {
        currentData.completedRooms = (currentData.completedRooms || 0) + 1
      } else if (wasCompleted && !isNowCompleted) {
        currentData.completedRooms = Math.max(0, (currentData.completedRooms || 0) - 1)
      }

      // Calculate pieces progress
      const piecesProgress = this.calculatePiecesProgress(currentData)

      // Get other category data to calculate overall progress
      const { data: fullProperty, error: fullFetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (fullFetchError) throw fullFetchError

      const overallProgress = this.calculateOverallProgress({
        ...fullProperty,
        inspection_pieces: currentData
      })

      // Update the property with new data
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          inspection_pieces: currentData,
          inspection_completion: overallProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error updating room data:', error)
      throw error
    }
  }

  /**
   * Calculate completion percentage for pieces category
   */
  calculatePiecesProgress(inspectionData: InspectionPieces): number {
    if (!inspectionData || inspectionData.totalRooms === 0) {
      return 0
    }

    const completedRooms = inspectionData.completedRooms || 0
    const totalRooms = inspectionData.totalRooms || 0

    return Math.round((completedRooms / totalRooms) * 100)
  }

  /**
   * Calculate weighted overall inspection progress
   * Pieces: 40%, Bâtiment: 15%, Garage: 10%, Mécanique: 15%, Divers: 0%, Extérieur: 20%
   */
  calculateOverallProgress(property: Partial<Property>): number {
    let totalProgress = 0
    let totalWeight = 0

    // Pieces (40%)
    if (property.inspection_pieces) {
      const piecesProgress = this.calculatePiecesProgress(property.inspection_pieces)
      totalProgress += piecesProgress * CATEGORY_WEIGHTS.pieces
      totalWeight += CATEGORY_WEIGHTS.pieces
    }

    // Bâtiment (15%)
    if (property.inspection_batiment) {
      const batimentProgress = this.calculateCategoryProgress(property.inspection_batiment)
      totalProgress += batimentProgress * CATEGORY_WEIGHTS.batiment
      totalWeight += CATEGORY_WEIGHTS.batiment
    }

    // Garage (10%)
    if (property.inspection_garage) {
      const garageProgress = this.calculateCategoryProgress(property.inspection_garage)
      totalProgress += garageProgress * CATEGORY_WEIGHTS.garage
      totalWeight += CATEGORY_WEIGHTS.garage
    }

    // Mécanique (15%)
    if (property.inspection_mecanique) {
      const mecaniqueProgress = this.calculateCategoryProgress(property.inspection_mecanique)
      totalProgress += mecaniqueProgress * CATEGORY_WEIGHTS.mecanique
      totalWeight += CATEGORY_WEIGHTS.mecanique
    }

    // Divers (0% - no weight)
    // Not included in progress calculation

    // Extérieur (20%)
    if (property.inspection_exterieur) {
      const exterieurProgress = this.calculateCategoryProgress(property.inspection_exterieur)
      totalProgress += exterieurProgress * CATEGORY_WEIGHTS.exterieur
      totalWeight += CATEGORY_WEIGHTS.exterieur
    }

    // Calculate weighted average
    if (totalWeight === 0) return 0

    return Math.round(totalProgress / totalWeight)
  }

  /**
   * Calculate progress for a category (other than pieces)
   * Simple check: if data exists and has fields, it's 100% complete
   */
  private calculateCategoryProgress(categoryData: Record<string, any> | null): number {
    if (!categoryData) return 0

    // Check if category has any meaningful data
    const fields = Object.keys(categoryData).filter(
      key => categoryData[key] !== null && categoryData[key] !== undefined && categoryData[key] !== ''
    )

    // If category has data, consider it complete
    return fields.length > 0 ? 100 : 0
  }

  /**
   * Get active inspections (in_progress or completed in last 7 days)
   */
  async getActiveInspections(organizationId?: string): Promise<Property[]> {
    const supabase = createClient()

    try {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      let query = supabase
        .from('properties')
        .select('*')
        .not('inspection_status', 'is', null)
        .neq('inspection_status', 'not_started')

      // Filter by organization if provided
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { data, error } = await query

      if (error) throw error

      // Filter in-memory for more complex conditions
      const activeInspections = (data || []).filter(property => {
        // Include all in_progress inspections
        if (property.inspection_status === 'in_progress') {
          return true
        }

        // Include completed inspections from last 7 days
        if (property.inspection_status === 'completed' && property.updated_at) {
          const updatedAt = new Date(property.updated_at)
          return updatedAt >= sevenDaysAgo
        }

        return false
      })

      // Sort by most recently updated first
      activeInspections.sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return dateB - dateA
      })

      return activeInspections as Property[]
    } catch (error) {
      console.error('Error fetching active inspections:', error)
      throw error
    }
  }

  /**
   * Update inspection status
   */
  async updateInspectionStatus(
    propertyId: string,
    status: InspectionStatus
  ): Promise<void> {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          inspection_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating inspection status:', error)
      throw error
    }
  }

  /**
   * Mark category as completed
   */
  async markCategoryCompleted(
    propertyId: string,
    category: InspectionCategory
  ): Promise<void> {
    const supabase = createClient()

    try {
      // Get current completed categories
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('inspection_categories_completed')
        .eq('id', propertyId)
        .single()

      if (fetchError) throw fetchError

      const currentCategories = property.inspection_categories_completed || []

      // Add category if not already completed
      if (!currentCategories.includes(category)) {
        currentCategories.push(category)

        const { error: updateError } = await supabase
          .from('properties')
          .update({
            inspection_categories_completed: currentCategories,
            updated_at: new Date().toISOString()
          })
          .eq('id', propertyId)

        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Error marking category completed:', error)
      throw error
    }
  }

  /**
   * Initialize inspection data for a property
   */
  async initializeInspection(propertyId: string): Promise<void> {
    const supabase = createClient()

    try {
      const initialData: InspectionPieces = {
        floors: {},
        totalRooms: 0,
        completedRooms: 0
      }

      const { error } = await supabase
        .from('properties')
        .update({
          inspection_pieces: initialData,
          inspection_status: 'in_progress',
          inspection_date: new Date().toISOString(),
          inspection_completion: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (error) throw error
    } catch (error) {
      console.error('Error initializing inspection:', error)
      throw error
    }
  }

  /**
   * Delete inspection data
   */
  async deleteInspection(propertyId: string): Promise<void> {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          inspection_pieces: null,
          inspection_batiment: null,
          inspection_garage: null,
          inspection_mecanique: null,
          inspection_exterieur: null,
          inspection_divers: null,
          inspection_status: 'not_started',
          inspection_date: null,
          inspection_completion: 0,
          inspection_categories_completed: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting inspection:', error)
      throw error
    }
  }
}

// Export singleton instance
export const inspectionService = new InspectionService()
