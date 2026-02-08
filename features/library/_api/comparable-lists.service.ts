import { supabase } from '@/lib/supabase/client'
import { ComparableList, ComparableListType, ComparableListItem } from '../types/comparable-list.types'

export const comparableListsService = {
  getByAppraisal: async (appraisalId: string): Promise<ComparableList[]> => {
    const { data, error } = await supabase
      .from('comparable_lists')
      .select('*')
      .eq('appraisal_id', appraisalId)
    if (error) throw error
    return (data || []).map(d => ({
      ...d,
      list_type: d.list_type as ComparableListType,
      name: d.name || undefined,
      items: (d.items as unknown as ComparableListItem[]) || []
    }))
  },

  getByType: async (appraisalId: string, listType: ComparableListType): Promise<ComparableList | null> => {
    const { data, error } = await supabase
      .from('comparable_lists')
      .select('*')
      .eq('appraisal_id', appraisalId)
      .eq('list_type', listType)
      .maybeSingle()
    if (error) throw error
    return data ? {
      ...data,
      list_type: data.list_type as ComparableListType,
      name: data.name || undefined,
      items: (data.items as unknown as ComparableListItem[]) || []
    } : null
  },

  addProperties: async (
    appraisalId: string,
    listType: ComparableListType,
    propertyIds: string[]
  ): Promise<{ added: number; skipped: number }> => {
    const existing = await comparableListsService.getByType(appraisalId, listType)
    const existingIds = new Set((existing?.items || []).map(i => i.property_id))

    const newItems: ComparableListItem[] = propertyIds
      .filter(id => !existingIds.has(id))
      .map((id, i) => ({
        property_id: id,
        sort_order: (existing?.items?.length || 0) + i,
        added_at: new Date().toISOString()
      }))

    const merged = [...(existing?.items || []), ...newItems]

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('comparable_lists')
      .upsert({
        appraisal_id: appraisalId,
        list_type: listType,
        items: merged as any,
        organization_id: user.user_metadata?.organization_id,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'appraisal_id,list_type' })
    if (error) throw error

    return { added: newItems.length, skipped: propertyIds.length - newItems.length }
  },

  removeProperty: async (
    appraisalId: string,
    listType: ComparableListType,
    propertyId: string
  ): Promise<void> => {
    const existing = await comparableListsService.getByType(appraisalId, listType)
    if (!existing) return

    const filtered = existing.items
      .filter(i => i.property_id !== propertyId)
      .map((item, i) => ({ ...item, sort_order: i }))

    await supabase
      .from('comparable_lists')
      .update({ items: filtered as any, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('comparable_lists').delete().eq('id', id)
    if (error) throw error
  }
}
