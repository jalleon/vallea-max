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
  Landscape,
  NavigateNext,
  ArrowBack,
  Terrain,
  LocalFlorist,
  DriveEta,
  Fence,
  Pool,
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
    id: 'terrain',
    name: 'Terrain',
    icon: Terrain,
    fields: [
      { id: 'superficie', label: 'Superficie (pieds carrés)', type: 'text' },
      { id: 'topographie', label: 'Topographie', type: 'select', options: ['Plat', 'En pente', 'Vallonné', 'Irrégulier'] },
      { id: 'drainage', label: 'Drainage', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Mauvais'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'amenagement',
    name: 'Aménagement paysager',
    icon: LocalFlorist,
    fields: [
      { id: 'type', label: 'Type', type: 'autocomplete', options: ['Gazon', 'Jardin', 'Arbres matures', 'Haies', 'Mixte'] },
      { id: 'entretien', label: 'Niveau d\'entretien', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Faible'] },
      { id: 'irrigation', label: 'Système d\'irrigation', type: 'select', options: ['Oui', 'Non'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'entree_stationnement',
    name: 'Entrée/Stationnement',
    icon: DriveEta,
    fields: [
      { id: 'type_entree', label: 'Type d\'entrée', type: 'autocomplete', options: ['Asphalte', 'Béton', 'Pavé', 'Gravier', 'Autre'] },
      { id: 'longueur', label: 'Longueur (pieds)', type: 'text' },
      { id: 'etat', label: 'État', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Mauvais'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'clotures',
    name: 'Clôtures',
    icon: Fence,
    fields: [
      { id: 'type', label: 'Type de clôture', type: 'autocomplete', options: ['Bois', 'Vinyle', 'Métal', 'Haie naturelle', 'Autre', 'Aucune'] },
      { id: 'hauteur', label: 'Hauteur (pieds)', type: 'text' },
      { id: 'etat', label: 'État', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Mauvais', 'N/A'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  },
  {
    id: 'piscine_spa',
    name: 'Piscine/Spa',
    icon: Pool,
    fields: [
      { id: 'type', label: 'Type', type: 'select', options: ['Piscine creusée', 'Piscine hors-terre', 'Spa', 'Les deux', 'Aucun'] },
      { id: 'dimensions', label: 'Dimensions', type: 'text' },
      { id: 'chauffage', label: 'Système de chauffage', type: 'select', options: ['Oui', 'Non', 'N/A'] },
      { id: 'etat', label: 'État', type: 'select', options: ['Excellent', 'Bon', 'Moyen', 'Mauvais', 'N/A'] },
      { id: 'notes', label: 'Notes', type: 'text', multiline: true }
    ]
  }
]

export default function ExterieurPage() {
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

      if (prop.inspection_exterieur) {
        setFormData(prop.inspection_exterieur)
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
        inspection_exterieur: updatedData
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
          <Typography color="text.primary">Extérieur</Typography>
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
              Extérieur
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
                        borderColor: isCompleted ? '#795548' : '#e0e0e0',
                        bgcolor: isCompleted ? '#7955481a' : 'white',
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
                            color: '#795548'
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
                            color: isCompleted ? '#795548' : '#9e9e9e',
                            mb: 2
                          }} />
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: isCompleted ? '#795548' : 'text.primary' }}
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
