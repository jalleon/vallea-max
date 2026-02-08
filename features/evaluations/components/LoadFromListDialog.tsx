'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Checkbox, CircularProgress, Chip, Alert
} from '@mui/material'
import { PlaylistPlay } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { comparableListsService } from '@/features/library/_api/comparable-lists.service'
import { ComparableListType } from '@/features/library/types/comparable-list.types'
import { supabase } from '@/lib/supabase/client'

interface LoadFromListDialogProps {
  open: boolean
  onClose: () => void
  appraisalId: string
  listType: ComparableListType
  existingPropertyIds: string[]
  onLoadProperties: (properties: any[]) => void
}

interface PropertyWithSelection {
  id: string
  adresse: string
  ville?: string
  prix_vente?: number
  date_vente?: string
  type_propriete?: string
  selected: boolean
  alreadyLoaded: boolean
}

export default function LoadFromListDialog({
  open, onClose, appraisalId, listType, existingPropertyIds, onLoadProperties
}: LoadFromListDialogProps) {
  const t = useTranslations('evaluations.comps')
  const [items, setItems] = useState<PropertyWithSelection[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !appraisalId) return
    setLoading(true)
    setError('')

    comparableListsService.getByType(appraisalId, listType)
      .then(async (list) => {
        if (!list || list.items.length === 0) {
          setItems([])
          return
        }
        const ids = list.items.map(i => i.property_id)
        const { data: properties } = await supabase
          .from('properties')
          .select('id, adresse, ville, prix_vente, date_vente, type_propriete')
          .in('id', ids)

        const existingSet = new Set(existingPropertyIds)
        const propsMap = new Map((properties || []).map(p => [p.id, p]))

        setItems(list.items.map(item => {
          const prop = propsMap.get(item.property_id)
          const alreadyLoaded = existingSet.has(item.property_id)
          return {
            id: item.property_id,
            adresse: prop?.adresse || '(Property deleted)',
            ville: prop?.ville || undefined,
            prix_vente: prop?.prix_vente || undefined,
            date_vente: prop?.date_vente || undefined,
            type_propriete: prop?.type_propriete || undefined,
            selected: !alreadyLoaded,
            alreadyLoaded
          }
        }))
      })
      .catch(() => setError('Failed to load comparable list'))
      .finally(() => setLoading(false))
  }, [open, appraisalId, listType, existingPropertyIds])

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id && !item.alreadyLoaded
        ? { ...item, selected: !item.selected }
        : item
    ))
  }

  const handleLoad = async () => {
    const selectedIds = items.filter(i => i.selected && !i.alreadyLoaded).map(i => i.id)
    if (selectedIds.length === 0) return

    setSubmitting(true)
    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .in('id', selectedIds)
      onLoadProperties(properties || [])
      onClose()
    } catch {
      setError('Failed to load properties')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCount = items.filter(i => i.selected && !i.alreadyLoaded).length

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PlaylistPlay /> {t('comparableList')}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{t('noListYet')}</Typography>
            <Button variant="outlined" href="/library" sx={{ borderRadius: 2 }}>
              {t('goToLibrary')}
            </Button>
          </Box>
        ) : (
          <Box>
            {items.map(item => (
              <Box
                key={item.id}
                onClick={() => toggleItem(item.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 0.5,
                  borderRadius: 2, cursor: item.alreadyLoaded ? 'default' : 'pointer',
                  opacity: item.alreadyLoaded ? 0.5 : 1,
                  '&:hover': { bgcolor: item.alreadyLoaded ? 'transparent' : 'action.hover' }
                }}
              >
                <Checkbox checked={item.selected} disabled={item.alreadyLoaded} size="small" />
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
                {item.alreadyLoaded && (
                  <Chip label={t('alreadyLoaded')} size="small" color="default" variant="outlined" />
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {t('selected', { count: selectedCount })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleLoad}
            disabled={selectedCount === 0 || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <PlaylistPlay />}
            sx={{ borderRadius: 2 }}
          >
            {t('loadSelected')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
