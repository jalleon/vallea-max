'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardActionArea,
  CardContent,
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
  Settings,
  NavigateNext,
  ArrowBack,
  Thermostat,
  Plumbing,
  ElectricBolt,
  Air,
  CheckCircle,
  OpenInNew
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'

const SUBCATEGORIES = [
  {
    id: 'chauffage',
    name: 'Chauffage',
    icon: Thermostat,
    fields: [
      { id: 'type', label: 'Type de système', type: 'autocomplete', options: ['Électrique', 'Gaz naturel', 'Mazout', 'Thermopompe', 'Géothermie', 'Bois/Granules'] },
      { id: 'age', label: 'Âge approximatif (années)', type: 'number' },
      { id: 'marque', label: 'Marque', type: 'text' },
      { id: 'etat', label: 'État', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Mauvais'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'plomberie',
    name: 'Plomberie',
    icon: Plumbing,
    fields: [
      { id: 'materiau_entree', label: 'Matériau d\'entrée d\'eau', type: 'select', options: ['Cuivre', 'PEX', 'Galvanisé', 'Autre'] },
      { id: 'chauffe_eau_type', label: 'Type de chauffe-eau', type: 'select', options: ['Réservoir électrique', 'Réservoir gaz', 'Sans réservoir (tankless)', 'Thermopompe'] },
      { id: 'chauffe_eau_age', label: 'Âge chauffe-eau (années)', type: 'number' },
      { id: 'drainage', label: 'Type de drainage', type: 'select', options: ['Municipal', 'Fosse septique', 'Champ d\'épuration'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'electricite',
    name: 'Électricité',
    icon: ElectricBolt,
    fields: [
      { id: 'amperage', label: 'Ampérage du panneau principal', type: 'select', options: ['60A', '100A', '200A', '400A'] },
      { id: 'type_cablage', label: 'Type de câblage', type: 'select', options: ['Cuivre', 'Aluminium', 'Mixte'] },
      { id: 'annee_mise_niveau', label: 'Année de mise à niveau', type: 'number' },
      { id: 'etat', label: 'État', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Mauvais'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'ventilation',
    name: 'Ventilation/Climatisation',
    icon: Air,
    fields: [
      { id: 'type_ventilation', label: 'Type de ventilation', type: 'select', options: ['VRC (Échangeur d\'air)', 'VRE (Récupérateur de chaleur)', 'Naturelle', 'Aucune'] },
      { id: 'climatisation', label: 'Climatisation', type: 'select', options: ['Centrale', 'Murale (split)', 'Fenêtre', 'Aucune'] },
      { id: 'age', label: 'Âge approximatif (années)', type: 'number' },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  }
]

export default function MecaniquePage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const prop = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(prop)

      if (prop.inspection_mecanique) {
        setFormData(prop.inspection_mecanique)
      }
    } catch (err) {
      console.error('Error loading property:', err)
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubcategory = async () => {
    if (!selectedSubcategory) return

    try {
      setSaving(true)
      const updatedData = {
        ...formData,
        [selectedSubcategory]: {
          ...formData[selectedSubcategory],
          completedAt: new Date().toISOString()
        }
      }

      await propertiesSupabaseService.updateProperty(propertyId, {
        inspection_mecanique: updatedData
      })

      setFormData(updatedData)
      setSelectedSubcategory(null)
      await loadProperty()
    } catch (err) {
      console.error('Error saving:', err)
      setError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (subcategoryId: string, fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [subcategoryId]: {
        ...prev[subcategoryId],
        [fieldId]: value
      }
    }))
  }

  const isSubcategoryCompleted = (subcategoryId: string) => {
    return formData[subcategoryId]?.completedAt !== undefined
  }

  const handleAddressClick = () => {
    if (property?.adresse && property?.ville) {
      const query = encodeURIComponent(`${property.adresse}, ${property.ville}, ${property.province || 'QC'}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }
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

  const currentSubcategory = SUBCATEGORIES.find(s => s.id === selectedSubcategory)

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
          <Typography color="text.primary">Mécanique</Typography>
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
              Mécanique
            </Typography>
          </Box>
        </Box>

        {!selectedSubcategory ? (
          <>
            {/* Subcategory Cards */}
            <Grid container spacing={3}>
              {SUBCATEGORIES.map((subcategory) => {
                const Icon = subcategory.icon
                const isCompleted = isSubcategoryCompleted(subcategory.id)

                return (
                  <Grid item xs={12} sm={6} md={4} key={subcategory.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '160px',
                        borderRadius: '16px',
                        border: isCompleted ? '2px solid' : '1px solid',
                        borderColor: isCompleted ? '#9C27B0' : '#e0e0e0',
                        bgcolor: isCompleted ? '#9C27B01a' : 'white',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      {isCompleted && (
                        <CheckCircle
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            fontSize: 28,
                            color: '#9C27B0'
                          }}
                        />
                      )}
                      <CardActionArea
                        onClick={() => setSelectedSubcategory(subcategory.id)}
                        sx={{
                          height: '100%',
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CardContent sx={{ p: 0, width: '100%', textAlign: 'center' }}>
                          <Icon sx={{
                            fontSize: 48,
                            color: isCompleted ? '#9C27B0' : '#9e9e9e',
                            mb: 2
                          }} />
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: isCompleted ? '#9C27B0' : 'text.primary' }}
                          >
                            {subcategory.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </>
        ) : (
          <>
            {/* Form View */}
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
              {currentSubcategory?.name}
            </Typography>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={3}>
                {currentSubcategory?.fields.map((field) => (
                  <Grid item xs={12} md={6} key={field.id}>
                    {field.type === 'select' ? (
                      <FormControl fullWidth>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          value={formData[selectedSubcategory]?.[field.id] || ''}
                          onChange={(e) => handleFieldChange(selectedSubcategory, field.id, e.target.value)}
                          label={field.label}
                        >
                          {field.options?.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : field.type === 'autocomplete' ? (
                      <Autocomplete
                        freeSolo
                        options={field.options || []}
                        value={formData[selectedSubcategory]?.[field.id] || ''}
                        onChange={(e, newValue) => handleFieldChange(selectedSubcategory, field.id, newValue)}
                        onInputChange={(e, newValue) => handleFieldChange(selectedSubcategory, field.id, newValue)}
                        renderInput={(params) => <TextField {...params} label={field.label} />}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={field.label}
                        type={field.type}
                        multiline={field.multiline}
                        rows={field.multiline ? 4 : 1}
                        value={formData[selectedSubcategory]?.[field.id] || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, field.id, e.target.value)}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSubcategory(null)}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveSubcategory}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : t('common.save')}
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </MaterialDashboardLayout>
  )
}
