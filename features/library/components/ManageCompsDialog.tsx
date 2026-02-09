'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, IconButton, CircularProgress, Alert
} from '@mui/material'
import { Settings, ArrowUpward, ArrowDownward, Delete, OpenInNew } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { comparableListsService } from '../_api/comparable-lists.service'
import { ComparableListType, ComparableListItem } from '../types/comparable-list.types'
import { supabase } from '@/lib/supabase/client'

interface ManageCompsDialogProps {
  open: boolean
  onClose: () => void
  appraisalId: string
  listType: ComparableListType
  onListChanged?: () => void
}

interface ItemWithProperty {
  property_id: string
  sort_order: number
  adresse: string
  ville?: string
  prix_vente?: number
  date_vente?: string
}

export default function ManageCompsDialog({
  open, onClose, appraisalId, listType, onListChanged
}: ManageCompsDialogProps) {
  const t = useTranslations('library.comps')
  const [items, setItems] = useState<ItemWithProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await comparableListsService.getByType(appraisalId, listType)
      if (!list || list.items.length === 0) { setItems([]); return }

      const ids = list.items.map(i => i.property_id)
      const { data: properties } = await supabase
        .from('properties')
        .select('id, adresse, ville, prix_vente, date_vente')
        .in('id', ids)

      const propsMap = new Map((properties || []).map(p => [p.id, p]))
      setItems(list.items
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(item => {
          const prop = propsMap.get(item.property_id)
          return {
            property_id: item.property_id,
            sort_order: item.sort_order,
            adresse: prop?.adresse || '(Deleted)',
            ville: prop?.ville || undefined,
            prix_vente: prop?.prix_vente || undefined,
            date_vente: prop?.date_vente || undefined,
          }
        }))
    } catch {
      setError('Failed to load list')
    } finally {
      setLoading(false)
    }
  }, [appraisalId, listType])

  useEffect(() => {
    if (open && appraisalId) fetchList()
  }, [open, appraisalId, listType, fetchList])

  const handleMove = async (index: number, direction: -1 | 1) => {
    const newItems = [...items]
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= newItems.length) return
    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
    const reindexed = newItems.map((item, i) => ({ ...item, sort_order: i }))
    setItems(reindexed)

    const serviceItems: ComparableListItem[] = reindexed.map(i => ({
      property_id: i.property_id,
      sort_order: i.sort_order,
      added_at: new Date().toISOString()
    }))
    await comparableListsService.updateItems(appraisalId, listType, serviceItems)
    onListChanged?.()
  }

  const handleRemove = async (propertyId: string) => {
    setItems(prev => prev.filter(i => i.property_id !== propertyId))
    await comparableListsService.removeProperty(appraisalId, listType, propertyId)
    onListChanged?.()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings /> {t('manageCompsList')} - {t(listType)}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{t('emptyList')}</Typography>
            <Button variant="outlined" href="/library" sx={{ borderRadius: 2 }} startIcon={<OpenInNew />}>
              {t('goToLibrary')}
            </Button>
          </Box>
        ) : (
          <Box>
            {items.map((item, index) => (
              <Box
                key={item.property_id}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, p: 1.5, mb: 0.5,
                  borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 20, textAlign: 'center' }}>
                  {index + 1}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>{item.adresse}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {item.ville && <Typography variant="caption" color="text.secondary">{item.ville}</Typography>}
                    {item.prix_vente && (
                      <Typography variant="caption" fontWeight={600} color="primary">
                        ${item.prix_vente.toLocaleString('fr-CA')}
                      </Typography>
                    )}
                    {item.date_vente && <Typography variant="caption" color="text.secondary">{item.date_vente}</Typography>}
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => handleMove(index, -1)} disabled={index === 0}>
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleMove(index, 1)} disabled={index === items.length - 1}>
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleRemove(item.property_id)} color="error">
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {t('itemsCount', { count: items.length })}
        </Typography>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  )
}
