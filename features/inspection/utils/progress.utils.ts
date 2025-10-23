import { Property } from '@/features/library/types/property.types'

export const INSPECTION_CATEGORIES = [
  { id: 'pieces', weight: 0.25 },
  { id: 'batiment', weight: 0.25 },
  { id: 'garage', weight: 0.15 },
  { id: 'mecanique', weight: 0.15 },
  { id: 'exterieur', weight: 0.20 },
  { id: 'divers', weight: 0.00 } // Optional category
]

/**
 * Check if a category is completed based on property data
 */
const isCategoryCompleted = (categoryId: string, property: Property): boolean => {
  switch (categoryId) {
    case 'pieces':
      return !!property.inspection_pieces
    case 'batiment':
      return !!property.inspection_batiment
    case 'garage':
      return !!property.inspection_garage
    case 'mecanique':
      return !!property.inspection_mecanique
    case 'divers':
      return !!property.inspection_divers
    case 'exterieur':
      return !!property.inspection_exterieur
    default:
      return false
  }
}

/**
 * Calculate overall inspection progress percentage
 */
export const calculateInspectionProgress = (property: Property): number => {
  let total = 0

  INSPECTION_CATEGORIES.forEach(cat => {
    if (isCategoryCompleted(cat.id, property)) {
      total += cat.weight * 100
    }
  })

  return Math.round(total)
}

/**
 * Get list of completed category IDs
 */
export const getCompletedCategories = (property: Property): string[] => {
  return INSPECTION_CATEGORIES
    .filter(cat => isCategoryCompleted(cat.id, property))
    .map(cat => cat.id)
}

/**
 * Get category name translation key
 */
export const getCategoryTranslationKey = (categoryId: string): string => {
  return `inspection.categories.${categoryId}`
}
