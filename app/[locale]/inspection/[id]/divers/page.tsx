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
  Autocomplete,
  IconButton
} from '@mui/material'
import {
  Build,
  NavigateNext,
  ArrowBack,
  OpenInNew
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'

export default function DiversPage() {
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
    systeme_securite: '',
    alarme_type: '',
    detecteurs_fumee: '',
    detecteurs_co: '',
    systeme_gicleurs: '',
    autres_systemes: '',
    notes_generales: ''
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

      if (prop.inspection_divers) {
        setFormData(prop.inspection_divers)
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
        inspection_divers: {
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
          <Typography color="text.primary">Divers</Typography>
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
              Divers
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Système de sécurité</InputLabel>
                <Select
                  value={formData.systeme_securite}
                  onChange={(e) => handleFieldChange('systeme_securite', e.target.value)}
                  label="Système de sécurité"
                >
                  <MenuItem value="Oui">Oui</MenuItem>
                  <MenuItem value="Non">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={['Filaire', 'Sans fil', 'Mixte', 'N/A']}
                value={formData.alarme_type}
                onChange={(e, newValue) => handleFieldChange('alarme_type', newValue)}
                onInputChange={(e, newValue) => handleFieldChange('alarme_type', newValue)}
                renderInput={(params) => <TextField {...params} label="Type d'alarme" />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Détecteurs de fumée</InputLabel>
                <Select
                  value={formData.detecteurs_fumee}
                  onChange={(e) => handleFieldChange('detecteurs_fumee', e.target.value)}
                  label="Détecteurs de fumée"
                >
                  <MenuItem value="Oui">Oui</MenuItem>
                  <MenuItem value="Non">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Détecteurs de CO</InputLabel>
                <Select
                  value={formData.detecteurs_co}
                  onChange={(e) => handleFieldChange('detecteurs_co', e.target.value)}
                  label="Détecteurs de CO"
                >
                  <MenuItem value="Oui">Oui</MenuItem>
                  <MenuItem value="Non">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Système de gicleurs</InputLabel>
                <Select
                  value={formData.systeme_gicleurs}
                  onChange={(e) => handleFieldChange('systeme_gicleurs', e.target.value)}
                  label="Système de gicleurs"
                >
                  <MenuItem value="Oui">Oui</MenuItem>
                  <MenuItem value="Non">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Autres systèmes"
                value={formData.autres_systemes}
                onChange={(e) => handleFieldChange('autres_systemes', e.target.value)}
                placeholder="Ex: Système domotique, interphone, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes générales"
                multiline
                rows={4}
                value={formData.notes_generales}
                onChange={(e) => handleFieldChange('notes_generales', e.target.value)}
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
