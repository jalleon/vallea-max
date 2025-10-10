'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  IconButton
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
  const [formData, setFormData] = useState<Record<string, any>>({
    type: '',
    nombre_places: '',
    largeur: '',
    profondeur: '',
    type_porte: '',
    ouvre_porte: '',
    etat: '',
    notes: ''
  })

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const prop = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(prop)

      if (prop.inspection_garage) {
        setFormData(prop.inspection_garage)
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
      await propertiesSupabaseService.updateProperty(propertyId, {
        inspection_garage: {
          ...formData,
          completedAt: new Date().toISOString()
        }
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
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
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
          <Typography color="text.primary">Garage</Typography>
        </Breadcrumbs>

        {/* Property Address - Clickable to Google Maps */}
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
              Garage
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type de garage</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  label="Type de garage"
                >
                  <MenuItem value="Attaché">Attaché</MenuItem>
                  <MenuItem value="Détaché">Détaché</MenuItem>
                  <MenuItem value="Intégré">Intégré</MenuItem>
                  <MenuItem value="Carport">Carport</MenuItem>
                  <MenuItem value="Aucun">Aucun</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de places"
                type="number"
                value={formData.nombre_places}
                onChange={(e) => handleFieldChange('nombre_places', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Largeur (pieds)"
                value={formData.largeur}
                onChange={(e) => handleFieldChange('largeur', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profondeur (pieds)"
                value={formData.profondeur}
                onChange={(e) => handleFieldChange('profondeur', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type de porte</InputLabel>
                <Select
                  value={formData.type_porte}
                  onChange={(e) => handleFieldChange('type_porte', e.target.value)}
                  label="Type de porte"
                >
                  <MenuItem value="Basculante">Basculante</MenuItem>
                  <MenuItem value="Sectionnelle">Sectionnelle</MenuItem>
                  <MenuItem value="Enroulable">Enroulable</MenuItem>
                  <MenuItem value="Battante">Battante</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ouvre-porte</InputLabel>
                <Select
                  value={formData.ouvre_porte}
                  onChange={(e) => handleFieldChange('ouvre_porte', e.target.value)}
                  label="Ouvre-porte"
                >
                  <MenuItem value="Manuel">Manuel</MenuItem>
                  <MenuItem value="Électrique">Électrique</MenuItem>
                  <MenuItem value="N/A">N/A</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>État général</InputLabel>
                <Select
                  value={formData.etat}
                  onChange={(e) => handleFieldChange('etat', e.target.value)}
                  label="État général"
                >
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Bon">Bon</MenuItem>
                  <MenuItem value="Moyen">Moyen</MenuItem>
                  <MenuItem value="Mauvais">Mauvais</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/${locale}/inspection/${propertyId}/categories`)}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : t('common.save')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </MaterialDashboardLayout>
  )
}
