export type ComparableListType =
  | 'direct_comparison'
  | 'direct_capitalization'
  | 'land'
  | 'commercial_lease'
  | 'residential_lease'

export interface ComparableListItem {
  property_id: string
  sort_order: number
  notes?: string
  added_at: string
}

export interface ComparableList {
  id: string
  organization_id: string
  created_by: string
  appraisal_id: string
  list_type: ComparableListType
  name?: string
  items: ComparableListItem[]
  created_at: string
  updated_at: string
}
