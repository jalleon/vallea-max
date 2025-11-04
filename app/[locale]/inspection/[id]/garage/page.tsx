'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material'
import {
  DirectionsCar,
  NavigateNext,
  ArrowBack,
  OpenInNew
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { InspectionFloatingNav } from '@/features/inspection/components/InspectionFloatingNav'

const FEET_TO_METERS = 0.3048

export default function GaragePage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [currentField, setCurrentField] = useState<string | null>(null)
  const [tempCustomValue, setTempCustomValue] = useState('')

  // Dimension states
  const [largeurFeet, setLargeurFeet] = useState('')
  const [longueurFeet, setLongueurFeet] = useState('')
  const [largeurMeters, setLargeurMeters] = useState('')
  const [longueurMeters, setLongueurMeters] = useState('')

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  useEffect(() => {
    // Load dimensions from formData
    if (formData.largeur_feet) setLargeurFeet(formData.largeur_feet)
    if (formData.longueur_feet) setLongueurFeet(formData.longueur_feet)
    if (formData.largeur_meters) setLargeurMeters(formData.largeur_meters)
    if (formData.longueur_meters) setLongueurMeters(formData.longueur_meters)
  }, [formData])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const prop = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(prop)

      if (prop.inspection_garage) {
        setFormData(prop.inspection_garage)

        // Load custom values
        if (prop.inspection_garage.customValues) {
          setCustomValues(prop.inspection_garage.customValues)
        }
      }
    } catch (err) {
      console.error('Error loading property:', err)
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Include dimension data
      const garageData = {
        ...formData,
        largeur_feet: largeurFeet,
        longueur_feet: longueurFeet,
        largeur_meters: largeurMeters,
        longueur_meters: longueurMeters,
        customValues,
        completedAt: new Date().toISOString()
      }

      await propertiesSupabaseService.updateProperty(propertyId, {
        inspection_garage: garageData
      })

      router.push(`/${locale}/inspection/${propertyId}/categories`)
    } catch (err) {
      console.error('Error saving:', err)
      setError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddressClick = () => {
    if (property?.adresse && property?.ville) {
      const query = encodeURIComponent(`${property.adresse}, ${property.ville}, ${property.province || 'QC'}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  // Dimension conversion handlers
  const handleLargeurFeetChange = (value: string) => {
    setLargeurFeet(value)
    if (value) {
      const meters = (parseFloat(value) * FEET_TO_METERS).toFixed(2)
      setLargeurMeters(meters)
    } else {
      setLargeurMeters('')
    }
  }

  const handleLongueurFeetChange = (value: string) => {
    setLongueurFeet(value)
    if (value) {
      const meters = (parseFloat(value) * FEET_TO_METERS).toFixed(2)
      setLongueurMeters(meters)
    } else {
      setLongueurMeters('')
    }
  }

  const handleLargeurMetersChange = (value: string) => {
    setLargeurMeters(value)
    if (value) {
      const feet = (parseFloat(value) / FEET_TO_METERS).toFixed(2)
      setLargeurFeet(feet)
    } else {
      setLargeurFeet('')
    }
  }

  const handleLongueurMetersChange = (value: string) => {
    setLongueurMeters(value)
    if (value) {
      const feet = (parseFloat(value) / FEET_TO_METERS).toFixed(2)
      setLongueurFeet(feet)
    } else {
      setLongueurFeet('')
    }
  }

  const calculateAreaFeet = () => {
    if (largeurFeet && longueurFeet) {
      return (parseFloat(largeurFeet) * parseFloat(longueurFeet)).toFixed(2)
    }
    return ''
  }

  const calculateAreaMeters = () => {
    if (largeurMeters && longueurMeters) {
      return (parseFloat(largeurMeters) * parseFloat(longueurMeters)).toFixed(2)
    }
    return ''
  }

  const renderChipField = (label: string, fieldId: string, options: string[], multiselect: boolean = false) => {
    const currentValue = formData[fieldId]

    return (
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#4CAF50' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {options.map((option) => {
            const isOther = option === 'Autres' || option === 'Autre'
            const customValue = isOther ? customValues[fieldId] : null
            const displayLabel = customValue || option

            const isSelected = multiselect
              ? Array.isArray(currentValue) && currentValue.includes(option)
              : currentValue === option

            const handleClick = () => {
              if (isOther && !isSelected) {
                setCurrentField(fieldId)
                setTempCustomValue(customValue || '')
                setCustomDialogOpen(true)
              }

              if (multiselect) {
                const current = Array.isArray(currentValue) ? currentValue : []
                const newValue = current.includes(option)
                  ? current.filter(v => v !== option)
                  : [...current, option]
                handleFieldChange(fieldId, newValue)
              } else {
                handleFieldChange(fieldId, option)
              }
            }

            return (
              <Chip
                key={option}
                label={displayLabel}
                onClick={handleClick}
                sx={{
                  bgcolor: isSelected ? '#4CAF50' : 'white',
                  color: isSelected ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor: isSelected ? '#4CAF50' : 'divider',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 2.5,
                  height: 'auto',
                  '&:hover': {
                    bgcolor: isSelected ? '#45a049' : '#E8F5E9',
                    borderColor: '#4CAF50'
                  },
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              />
            )
          })}
        </Box>
      </Box>
    )
  }

  if (loading) {
    return (
      <MaterialDashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MaterialDashboardLayout>
    )
  }

  if (error) {
    return (
      <MaterialDashboardLayout>
        <Alert severity="error">{error}</Alert>
      </MaterialDashboardLayout>
    )
  }

  return (
    <MaterialDashboardLayout>
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, pb: { xs: 12, md: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link
            color="inherit"
            onClick={() => router.push(`/${locale}/inspection`)}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {t('inspection.breadcrumb.root')}
          </Link>
          <Link
            color="inherit"
            onClick={() => router.push(`/${locale}/inspection/${propertyId}/categories`)}
            sx={{ cursor: 'pointer' }}
          >
            {t('inspection.breadcrumb.categories')}
          </Link>
          <Typography color="text.primary">{t('inspection.garage.title')}</Typography>
        </Breadcrumbs>

        {/* Property Address */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="button"
            onClick={handleAddressClick}
            sx={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              p: 0,
              color: 'primary.main',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {property?.adresse}, {property?.ville}
            <OpenInNew fontSize="small" />
          </Typography>
          {property?.province && (
            <Typography variant="body2" color="text.secondary">
              {property.province} • {property.type_propriete}
            </Typography>
          )}
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push(`/${locale}/inspection/${propertyId}/categories`)} sx={{ bgcolor: 'grey.100' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight={700}>
              {t('inspection.garage.title')}
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Type de garage */}
            {renderChipField('Type de garage', 'type_garage', [
              t('inspection.garageOptions.typeOptions.aucun'),
              t('inspection.garageOptions.typeOptions.attache'),
              t('inspection.garageOptions.typeOptions.detache'),
              t('inspection.garageOptions.typeOptions.integre'),
              t('inspection.garageOptions.typeOptions.auSousSol'),
              t('inspection.garageOptions.typeOptions.abriAuto')
            ])}

            {/* Finition */}
            {renderChipField('Finition', 'finition', [
              t('inspection.garageOptions.finitionOptions.fini'),
              t('inspection.garageOptions.finitionOptions.nonFini')
            ])}

            {/* Porte électrique */}
            {renderChipField('Porte électrique', 'porte_electrique', [
              t('inspection.options.yes'),
              t('inspection.options.no')
            ])}

            {/* Dimension */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#4CAF50' }}>
                Dimension
              </Typography>

              {/* Feet row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Largeur"
                  type="number"
                  value={largeurFeet}
                  onChange={(e) => handleLargeurFeetChange(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">pi</InputAdornment>
                  }}
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Longueur"
                  type="number"
                  value={longueurFeet}
                  onChange={(e) => handleLongueurFeetChange(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">pi</InputAdornment>
                  }}
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Superficie"
                  value={calculateAreaFeet()}
                  InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">pi²</InputAdornment>
                  }}
                  sx={{ width: 150, bgcolor: '#f5f5f5' }}
                />
              </Box>

              {/* Meters row */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Largeur"
                  type="number"
                  value={largeurMeters}
                  onChange={(e) => handleLargeurMetersChange(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>
                  }}
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Longueur"
                  type="number"
                  value={longueurMeters}
                  onChange={(e) => handleLongueurMetersChange(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>
                  }}
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Superficie"
                  value={calculateAreaMeters()}
                  InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>
                  }}
                  sx={{ width: 150, bgcolor: '#f5f5f5' }}
                />
              </Box>
            </Box>

            {/* Matériaux */}
            {renderChipField('Matériaux', 'materiaux', [
              t('inspection.garageOptions.materiauxOptions.briques'),
              t('inspection.garageOptions.materiauxOptions.beton'),
              t('inspection.options.other')
            ], true)}

            {/* Notes */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#4CAF50' }}>
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Notes (optionnel)"
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#4CAF50'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4CAF50'
                    }
                  }
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/${locale}/inspection/${propertyId}/categories`)}
              disabled={saving}
              sx={{
                borderColor: '#4CAF50',
                color: '#4CAF50',
                '&:hover': {
                  borderColor: '#45a049',
                  bgcolor: '#E8F5E9'
                }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': {
                  bgcolor: '#45a049'
                }
              }}
            >
              {saving ? <CircularProgress size={24} /> : t('common.save')}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Custom Value Dialog */}
      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('inspection.customValue.title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('inspection.customValue.label')}
            value={tempCustomValue}
            onChange={(e) => setTempCustomValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCustomValueSave} variant="contained" sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Navigation */}
      <InspectionFloatingNav inspectionId={propertyId} currentCategory="garage" />
    </MaterialDashboardLayout>
  )
}
