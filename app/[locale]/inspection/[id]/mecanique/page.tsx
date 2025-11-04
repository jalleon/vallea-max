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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
import { InspectionFloatingNav } from '@/features/inspection/components/InspectionFloatingNav'
import { CategoryHeader } from '@/features/inspection/components/CategoryHeader'

const getSubcategories = (t: any) => [
  {
    id: 'chauffage_ventilation',
    name: t('inspection.mecanique.chauffageVentilation'),
    icon: Thermostat,
    fields: [
      {
        id: 'type_chauffage',
        label: t('inspection.mecanique.typeSystemeChauffage'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.chauffageOptions.electricite'),
          t('inspection.mecaniqueOptions.chauffageOptions.gaz'),
          t('inspection.mecaniqueOptions.chauffageOptions.airChaud'),
          t('inspection.mecaniqueOptions.chauffageOptions.eauChaude'),
          t('inspection.mecaniqueOptions.chauffageOptions.planchersChauffants'),
          t('inspection.mecaniqueOptions.chauffageOptions.convectaires'),
          t('inspection.mecaniqueOptions.chauffageOptions.plinthesElectrique'),
          t('inspection.mecaniqueOptions.chauffageOptions.radiant'),
          t('inspection.mecaniqueOptions.chauffageOptions.huileMazout'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      {
        id: 'climatisation',
        label: t('inspection.mecanique.climatisation'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.climatisationOptions.thermopompeCentrale'),
          t('inspection.mecaniqueOptions.climatisationOptions.thermopompeMurale'),
          t('inspection.mecaniqueOptions.climatisationOptions.climatiseurMural'),
          t('inspection.mecaniqueOptions.climatisationOptions.systemeCentralise'),
          t('inspection.mecaniqueOptions.climatisationOptions.echangeurAir')
        ],
        multiselect: true
      },
      { id: 'notes', label: t('inspection.fields.notes'), type: 'text', multiline: true }
    ]
  },
  {
    id: 'plomberie',
    name: t('inspection.mecanique.plomberie'),
    icon: Plumbing,
    fields: [
      {
        id: 'materiau_entree',
        label: t('inspection.mecanique.materiauEntreeEau'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.plomberieMateriauOptions.cuivre'),
          t('inspection.mecaniqueOptions.plomberieMateriauOptions.pex'),
          t('inspection.mecaniqueOptions.plomberieMateriauOptions.polyB')
        ],
        multiselect: true
      },
      {
        id: 'type',
        label: t('inspection.mecanique.type'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.plomberieTypeOptions.standard'),
          t('inspection.mecaniqueOptions.plomberieTypeOptions.ancienne'),
          t('inspection.mecaniqueOptions.plomberieTypeOptions.luxe')
        ],
        multiselect: true
      },
      {
        id: 'entree_laveuse',
        label: t('inspection.mecanique.entreeLaveuse'),
        type: 'select',
        options: [t('inspection.options.yes'), t('inspection.options.no')]
      },
      {
        id: 'chauffe_eau',
        label: t('inspection.mecanique.chauffeEau'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.chauffeEauOptions.40gallons'),
          t('inspection.mecaniqueOptions.chauffeEauOptions.60gallons'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      {
        id: 'type_energie',
        label: t('inspection.mecanique.typeEnergie'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.energieOptions.electrique'),
          t('inspection.mecaniqueOptions.energieOptions.gaz'),
          t('inspection.mecaniqueOptions.energieOptions.huileMazout')
        ],
        multiselect: true
      },
      { id: 'notes', label: t('inspection.fields.notes'), type: 'text', multiline: true }
    ]
  },
  {
    id: 'electricite',
    name: t('inspection.mecanique.electricite'),
    icon: ElectricBolt,
    fields: [
      {
        id: 'type_panneau',
        label: t('inspection.mecanique.typePanneau'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.panneauOptions.disjoncteurs'),
          t('inspection.mecaniqueOptions.panneauOptions.fusibles')
        ],
        multiselect: true
      },
      {
        id: 'amperage',
        label: t('inspection.mecanique.amperage'),
        type: 'multiselect',
        options: [
          t('inspection.mecaniqueOptions.amperageOptions.60'),
          t('inspection.mecaniqueOptions.amperageOptions.100'),
          t('inspection.mecaniqueOptions.amperageOptions.125'),
          t('inspection.mecaniqueOptions.amperageOptions.150'),
          t('inspection.mecaniqueOptions.amperageOptions.200'),
          t('inspection.mecaniqueOptions.amperageOptions.400')
        ],
        multiselect: true
      },
      { id: 'notes', label: t('inspection.fields.notes'), type: 'text', multiline: true }
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
  const [customValues, setCustomValues] = useState<Record<string, Record<string, string>>>({})
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [currentField, setCurrentField] = useState<string | null>(null)
  const [tempCustomValue, setTempCustomValue] = useState('')

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

        // Load custom values
        if (prop.inspection_mecanique.customValues) {
          setCustomValues(prop.inspection_mecanique.customValues)
        }
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
        },
        customValues
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

  const handleCustomValueSave = () => {
    if (selectedSubcategory && currentField && tempCustomValue.trim()) {
      setCustomValues(prev => ({
        ...prev,
        [selectedSubcategory]: {
          ...(prev[selectedSubcategory] || {}),
          [currentField]: tempCustomValue
        }
      }))
    }
    setCustomDialogOpen(false)
    setCurrentField(null)
    setTempCustomValue('')
  }

  const renderChipField = (label: string, fieldId: string, options: string[], multiselect: boolean = false) => {
    if (!selectedSubcategory) return null
    const currentValue = formData[selectedSubcategory]?.[fieldId]

    return (
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#9C27B0' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {options.map((option) => {
            const isOther = option === 'Autres' || option === 'Autre'
            const customValue = isOther ? customValues[selectedSubcategory]?.[fieldId] : null
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
                handleFieldChange(selectedSubcategory, fieldId, newValue)
              } else {
                handleFieldChange(selectedSubcategory, fieldId, option)
              }
            }

            return (
              <Chip
                key={option}
                label={displayLabel}
                onClick={handleClick}
                sx={{
                  bgcolor: isSelected ? '#9C27B0' : 'white',
                  color: isSelected ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor: isSelected ? '#9C27B0' : 'divider',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 2.5,
                  height: 'auto',
                  '&:hover': {
                    bgcolor: isSelected ? '#7B1FA2' : '#F3E5F5',
                    borderColor: '#9C27B0'
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

  const SUBCATEGORIES = getSubcategories(t)
  const currentSubcategory = SUBCATEGORIES.find(s => s.id === selectedSubcategory)

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
          <Typography color="text.primary">{t('inspection.mecanique.title')}</Typography>
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

        {/* Category Header */}
        <CategoryHeader
          categoryName={t('inspection.mecanique.title')}
          categoryColor="#9C27B0"
          categoryIcon={Settings}
          progress={0}
          completedItems={getSubcategories(t).filter(sub => formData[sub.id]?.completedAt).length}
          totalItems={getSubcategories(t).length}
          subtitle="Systèmes mécaniques"
        />

        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => router.push(`/${locale}/inspection/${propertyId}/categories`)} sx={{ bgcolor: 'grey.100' }}>
            <ArrowBack />
          </IconButton>
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
                            color: '#9C27B0',
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {currentSubcategory?.fields.map((field) => {
                  if (field.type === 'select' && field.options) {
                    return (
                      <Box key={field.id}>
                        {renderChipField(field.label, field.id, field.options, false)}
                      </Box>
                    )
                  } else if (field.type === 'multiselect' && field.options) {
                    return (
                      <Box key={field.id}>
                        {renderChipField(field.label, field.id, field.options, true)}
                      </Box>
                    )
                  } else if (field.type === 'number') {
                    return (
                      <Box key={field.id}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#9C27B0' }}>
                          {field.label}
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          placeholder={field.label}
                          value={formData[selectedSubcategory]?.[field.id] || ''}
                          onChange={(e) => selectedSubcategory && handleFieldChange(selectedSubcategory, field.id, e.target.value)}
                          sx={{
                            maxWidth: 300,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#9C27B0'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#9C27B0'
                              }
                            }
                          }}
                        />
                      </Box>
                    )
                  } else if (field.type === 'text' && !field.multiline) {
                    return (
                      <Box key={field.id}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#9C27B0' }}>
                          {field.label}
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder={field.label}
                          value={formData[selectedSubcategory]?.[field.id] || ''}
                          onChange={(e) => selectedSubcategory && handleFieldChange(selectedSubcategory, field.id, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#9C27B0'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#9C27B0'
                              }
                            }
                          }}
                        />
                      </Box>
                    )
                  } else if (field.type === 'text' && field.multiline) {
                    return (
                      <Box key={field.id}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#9C27B0' }}>
                          {field.label}
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          placeholder={field.label}
                          value={formData[selectedSubcategory]?.[field.id] || ''}
                          onChange={(e) => selectedSubcategory && handleFieldChange(selectedSubcategory, field.id, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#9C27B0'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#9C27B0'
                              }
                            }
                          }}
                        />
                      </Box>
                    )
                  }
                  return null
                })}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSubcategory(null)}
                  disabled={saving}
                  sx={{
                    borderColor: '#9C27B0',
                    color: '#9C27B0',
                    '&:hover': {
                      borderColor: '#7B1FA2',
                      bgcolor: '#F3E5F5'
                    }
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveSubcategory}
                  disabled={saving}
                  sx={{
                    bgcolor: '#9C27B0',
                    '&:hover': {
                      bgcolor: '#7B1FA2'
                    }
                  }}
                >
                  {saving ? <CircularProgress size={24} /> : t('common.save')}
                </Button>
              </Box>
            </Paper>
          </>
        )}
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
          <Button onClick={handleCustomValueSave} variant="contained" sx={{ bgcolor: '#9C27B0', '&:hover': { bgcolor: '#7B1FA2' } }}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Navigation */}
      <InspectionFloatingNav inspectionId={propertyId} currentCategory="mecanique" />
    </MaterialDashboardLayout>
  )
}
