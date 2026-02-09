'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Typography, Box, Chip, Alert, CircularProgress
} from '@mui/material'
import { PlaylistAdd, Settings } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { appraisalsService } from '@/features/evaluations/_api/appraisals.service'
import { comparableListsService } from '../_api/comparable-lists.service'
import { ComparableListType, ComparableList } from '../types/comparable-list.types'
import { Property } from '../types/property.types'

const LIST_TYPES: ComparableListType[] = [
  'direct_comparison',
  'direct_capitalization',
  'land',
  'commercial_lease',
  'residential_lease'
]

interface AddToCompsDialogProps {
  open: boolean
  onClose: () => void
  selectedProperties: Property[]
  onSuccess: (message: string) => void
  onManageList?: (appraisalId: string, listType: ComparableListType) => void
}

export default function AddToCompsDialog({ open, onClose, selectedProperties, onSuccess, onManageList }: AddToCompsDialogProps) {
  const t = useTranslations('library.comps')
  const [appraisals, setAppraisals] = useState<any[]>([])
  const [selectedAppraisal, setSelectedAppraisal] = useState('')
  const [listType, setListType] = useState<ComparableListType>('direct_comparison')
  const [loading, setLoading] = useState(false)
  const [loadingAppraisals, setLoadingAppraisals] = useState(false)
  const [error, setError] = useState('')
  const [existingLists, setExistingLists] = useState<ComparableList[]>([])

  useEffect(() => {
    if (!open) return
    setLoadingAppraisals(true)
    setError('')
    setSelectedAppraisal('')
    setExistingLists([])
    appraisalsService.getAll()
      .then(data => setAppraisals(data))
      .catch(() => setError('Failed to load appraisals'))
      .finally(() => setLoadingAppraisals(false))
  }, [open])

  useEffect(() => {
    if (!selectedAppraisal) { setExistingLists([]); return }
    comparableListsService.getByAppraisal(selectedAppraisal)
      .then(lists => setExistingLists(lists))
      .catch(() => setExistingLists([]))
  }, [selectedAppraisal])

  const handleSubmit = async () => {
    if (!selectedAppraisal) return
    setLoading(true)
    setError('')
    try {
      const propertyIds = selectedProperties.map(p => p.id)
      const result = await comparableListsService.addProperties(selectedAppraisal, listType, propertyIds)
      const appraisal = appraisals.find(a => a.id === selectedAppraisal)
      const label = appraisal?.appraisal_number || appraisal?.client_name || ''
      onSuccess(t('addedSuccess', { count: result.added, listType: t(listType), appraisal: label }))
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add properties')
    } finally {
      setLoading(false)
    }
  }

  const getAppraisalLabel = (a: any) => {
    const parts = [a.appraisal_number, a.client_name, a.address].filter(Boolean)
    return parts.join(' - ') || a.id.slice(0, 8)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PlaylistAdd /> {t('addToCompsList')}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          select
          fullWidth
          label={t('selectAppraisal')}
          value={selectedAppraisal}
          onChange={e => setSelectedAppraisal(e.target.value)}
          size="small"
          sx={{ mt: 1, mb: 2 }}
          disabled={loadingAppraisals}
          InputProps={{ endAdornment: loadingAppraisals ? <CircularProgress size={20} /> : undefined }}
        >
          {appraisals.map(a => (
            <MenuItem key={a.id} value={a.id}>{getAppraisalLabel(a)}</MenuItem>
          ))}
        </TextField>

        {existingLists.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {t('existingLists')}
              </Typography>
              {onManageList && selectedAppraisal && (
                <Button
                  size="small"
                  startIcon={<Settings sx={{ fontSize: 14 }} />}
                  onClick={() => onManageList(selectedAppraisal, listType)}
                  sx={{ fontSize: '0.7rem', textTransform: 'none', minHeight: 0, py: 0 }}
                >
                  {t('manageLists')}
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {existingLists.map(list => (
                <Chip
                  key={list.id}
                  label={`${t(list.list_type)} (${list.items.length})`}
                  variant={listType === list.list_type ? 'filled' : 'outlined'}
                  color={listType === list.list_type ? 'primary' : 'default'}
                  onClick={() => setListType(list.list_type)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        <TextField
          select
          fullWidth
          label={t('selectListType')}
          value={listType}
          onChange={e => setListType(e.target.value as ComparableListType)}
          size="small"
          sx={{ mb: 2 }}
        >
          {LIST_TYPES.map(lt => (
            <MenuItem key={lt} value={lt}>{t(lt)}</MenuItem>
          ))}
        </TextField>

        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('adding', { count: selectedProperties.length })}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedProperties.slice(0, 8).map(p => (
              <Chip
                key={p.id}
                label={`${p.adresse}${p.ville ? `, ${p.ville}` : ''}`}
                size="small"
                variant="outlined"
              />
            ))}
            {selectedProperties.length > 8 && (
              <Chip label={`+${selectedProperties.length - 8}`} size="small" />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedAppraisal || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <PlaylistAdd />}
          sx={{ borderRadius: 2 }}
        >
          {t('addToList')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
