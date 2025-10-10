'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  ArrowBack,
  Save,
  NavigateNext
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property, InspectionPieces } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { getRoomConfig, RoomFieldConfig } from '@/features/inspection/constants/room.constants'

export default function RoomInspectionPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const propertyId = params.id as string
  const floorId = params.floorId as string
  const roomId = params.roomId as string

  const [property, setProperty] = useState<Property | null>(null)
  const [roomData, setRoomData] = useState<Record<string, any>>({})
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [currentField, setCurrentField] = useState<string | null>(null)
  const [tempCustomValue, setTempCustomValue] = useState('')

  useEffect(() => {
    loadProperty()
  }, [propertyId, floorId, roomId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const prop = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(prop)

      // Load existing room data
      const existingRoomData = prop.inspection_pieces?.floors?.[floorId]?.rooms?.[roomId]
      if (existingRoomData) {
        setRoomData(existingRoomData)
      }
    } catch (err) {
      console.error('Error loading property:', err)
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const getRoomType = () => {
    return property?.inspection_pieces?.floors?.[floorId]?.rooms?.[roomId]?.type || ''
  }

  const getRoomName = () => {
    const roomType = getRoomType()
    const roomConfig = getRoomConfig(roomType)
    return roomConfig ? t(roomConfig.translationKey) : roomType
  }

  const getFloorName = () => {
    return property?.inspection_pieces?.floors?.[floorId]?.name || floorId
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setRoomData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleMultiSelectChange = (fieldName: string, newValue: string[]) => {
    // Check if 'autre' was added
    if (newValue.includes('other') && !roomData[fieldName]?.includes('other')) {
      setCurrentField(fieldName)
      setTempCustomValue(customValues[fieldName] || '')
      setCustomDialogOpen(true)
    } else if (!newValue.includes('other')) {
      // Remove custom value if 'autre' was removed
      const newCustomValues = { ...customValues }
      delete newCustomValues[fieldName]
      setCustomValues(newCustomValues)
    }
    handleFieldChange(fieldName, newValue)
  }

  const handleCustomValueSave = () => {
    if (currentField && tempCustomValue.trim()) {
      setCustomValues(prev => ({
        ...prev,
        [currentField]: tempCustomValue
      }))
    }
    setCustomDialogOpen(false)
    setCurrentField(null)
    setTempCustomValue('')
  }

  const calculateCompletionPercentage = (updatedPieces: InspectionPieces) => {
    const totalRooms = updatedPieces.totalRooms
    const completedRooms = updatedPieces.completedRooms

    if (totalRooms === 0) return 0

    // Pièces category is 40% of overall completion
    const piecesWeight = 40
    const piecesCompletion = (completedRooms / totalRooms) * 100
    const piecesContribution = (piecesCompletion * piecesWeight) / 100

    return Math.round(piecesContribution)
  }

  const handleSave = async () => {
    if (!property) return

    try {
      setSaving(true)

      const currentData = property.inspection_pieces || { floors: {}, totalRooms: 0, completedRooms: 0 }
      const wasCompleted = currentData.floors?.[floorId]?.rooms?.[roomId]?.completedAt !== undefined

      // Update room data with completion timestamp
      const updatedRoomData = {
        ...roomData,
        completedAt: new Date().toISOString(),
        customValues
      }

      // Update the room in the floor
      const updatedFloor = {
        ...currentData.floors[floorId],
        rooms: {
          ...currentData.floors[floorId].rooms,
          [roomId]: updatedRoomData
        }
      }

      // Calculate new completed rooms count
      let newCompletedRooms = currentData.completedRooms
      if (!wasCompleted) {
        newCompletedRooms += 1
      }

      const updatedPieces: InspectionPieces = {
        ...currentData,
        floors: {
          ...currentData.floors,
          [floorId]: updatedFloor
        },
        completedRooms: newCompletedRooms
      }

      // Calculate overall inspection completion
      const overallCompletion = calculateCompletionPercentage(updatedPieces)

      // Update property with new inspection data
      await propertiesSupabaseService.updateProperty(propertyId, {
        inspection_pieces: updatedPieces,
        inspection_completion: overallCompletion
      })

      // Navigate back to pieces page
      router.push(`/${locale}/inspection/${propertyId}/pieces`)
    } catch (err) {
      console.error('Error saving room inspection:', err)
      setError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push(`/${locale}/inspection/${propertyId}/pieces`)
  }

  const handleBreadcrumbClick = (path: string) => {
    router.push(`/${locale}${path}`)
  }

  const renderField = (field: RoomFieldConfig) => {
    const value = roomData[field.name] || (field.type === 'multiselect' ? [] : '')

    switch (field.type) {
      case 'multiselect':
        return (
          <Box key={field.name}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t(field.translationKey)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {field.options?.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value)
                const isOther = option.value === 'other'
                const customValue = isOther ? customValues[field.name] : null

                return (
                  <Chip
                    key={option.value}
                    label={customValue || t(option.translationKey)}
                    onClick={() => {
                      const currentValues = Array.isArray(value) ? value : []
                      if (isSelected) {
                        handleMultiSelectChange(field.name, currentValues.filter(v => v !== option.value))
                      } else {
                        handleMultiSelectChange(field.name, [...currentValues, option.value])
                      }
                    }}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover'
                      }
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        )

      case 'select':
        return (
          <Box key={field.name}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t(field.translationKey)}
            </Typography>
            <ToggleButtonGroup
              value={value}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  handleFieldChange(field.name, newValue)
                }
              }}
              aria-label={t(field.translationKey)}
              sx={{ flexWrap: 'wrap' }}
            >
              {field.options?.map((option) => (
                <ToggleButton key={option.value} value={option.value} sx={{ px: 3 }}>
                  {t(option.translationKey)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )

      case 'text':
        return (
          <Box key={field.name}>
            <TextField
              label={t(field.translationKey)}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              fullWidth
              multiline={field.name === 'plafond'}
              rows={field.name === 'plafond' ? 2 : 1}
            />
          </Box>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <MaterialDashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MaterialDashboardLayout>
    )
  }

  if (error || !property) {
    return (
      <MaterialDashboardLayout>
        <Alert severity="error">{error || t('common.error')}</Alert>
      </MaterialDashboardLayout>
    )
  }

  const roomType = getRoomType()
  const roomConfig = getRoomConfig(roomType)

  if (!roomConfig) {
    return (
      <MaterialDashboardLayout>
        <Alert severity="error">Room configuration not found</Alert>
      </MaterialDashboardLayout>
    )
  }

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick('/inspection')}
            sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('inspection.breadcrumb.root')}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick(`/inspection/${propertyId}/categories`)}
            sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('inspection.breadcrumb.categories')}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick(`/inspection/${propertyId}/pieces`)}
            sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('inspection.categories.pieces')}
          </Link>
          <Typography color="text.primary">
            {getFloorName()} - {getRoomName()}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              variant="outlined"
            >
              {t('common.back')}
            </Button>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {getRoomName()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getFloorName()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {roomConfig.fields.map(field => renderField(field))}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={saving}
                size="large"
              >
                {t('common.back')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                onClick={handleSave}
                size="large"
                startIcon={saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Save />}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': {
                    bgcolor: '#45a049'
                  }
                }}
              >
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Custom Value Dialog */}
        <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('inspection.materials.other')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('common.value')}
              type="text"
              fullWidth
              value={tempCustomValue}
              onChange={(e) => setTempCustomValue(e.target.value)}
              placeholder={t('common.enterCustomValue')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCustomValueSave} variant="contained">
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MaterialDashboardLayout>
  )
}
