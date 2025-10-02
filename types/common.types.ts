export interface User {
  id: string
  email: string
  full_name: string | null
  organization_id: string | null
  role: 'admin' | 'appraiser' | 'viewer'
  preferences: {
    language: 'fr' | 'en'
    currency: 'CAD' | 'USD'
    theme: 'light' | 'dark'
  }
  created_at: string
}

export interface Organization {
  id: string
  name: string
  subscription_tier: string
  settings: {
    language: 'fr' | 'en'
    currency: 'CAD' | 'USD'
  }
  created_at: string
  updated_at: string
}

export interface MediaReference {
  id: string
  source: 'local' | 'google_drive' | 'dropbox' | 'url'
  reference: string
  thumbnail?: string
  metadata: {
    fileName: string
    fileSize: number
    mimeType: string
    uploadedAt: Date
  }
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  hasMore: boolean
  nextCursor?: string
}

export interface PropertyFilters {
  type_propriete?: string
  ville?: string
  prix_min?: number
  prix_max?: number
  superficie_min?: number
  superficie_max?: number
  annee_construction_min?: number
  annee_construction_max?: number
  search?: string
}

export interface SearchCriteria {
  address?: string
  city?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  radius?: number
  exclude?: string[]
  limit?: number
}