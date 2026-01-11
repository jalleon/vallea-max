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
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Autocomplete,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  keyframes
} from '@mui/material'

// Premium animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`
import {
  Home,
  NavigateNext,
  ArrowBack,
  Foundation,
  Roofing,
  Window,
  CheckCircle,
  OpenInNew,
  Apartment,
  MeetingRoom,
  Deck,
  Fireplace
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
    id: 'fondation_mur_toiture',
    name: t('inspection.batiment.fondationMurToiture'),
    icon: Foundation,
    fields: [
      {
        id: 'type_fondation',
        label: t('inspection.batiment.typeFondation'),
        type: 'select',
        options: [
          t('inspection.batimentOptions.fondationOptions.betonCoule'),
          t('inspection.batimentOptions.fondationOptions.blocsBeton'),
          t('inspection.batimentOptions.fondationOptions.dalleBeton'),
          t('inspection.batimentOptions.fondationOptions.sousSolPartiel'),
          t('inspection.batimentOptions.fondationOptions.videSanitaire'),
          t('inspection.batimentOptions.fondationOptions.piliers'),
          t('inspection.batimentOptions.fondationOptions.pierreChamps'),
          t('inspection.options.other')
        ],
        multiselect: false
      },
      {
        id: 'materiau_mur',
        label: t('inspection.batiment.murExterieur'),
        type: 'multiselect',
        options: [
          t('inspection.batimentOptions.murOptions.briques'),
          t('inspection.batimentOptions.murOptions.pierre'),
          t('inspection.batimentOptions.murOptions.aluminium'),
          t('inspection.batimentOptions.murOptions.vinyle'),
          t('inspection.batimentOptions.murOptions.agregat'),
          t('inspection.batimentOptions.murOptions.bois'),
          t('inspection.batimentOptions.murOptions.stucco'),
          t('inspection.batimentOptions.murOptions.maybec'),
          t('inspection.batimentOptions.murOptions.bardeauxAsphalte'),
          t('inspection.batimentOptions.murOptions.canexel'),
          t('inspection.batimentOptions.murOptions.acrylique'),
          t('inspection.batimentOptions.murOptions.blocsBeton'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      {
        id: 'gouttieres',
        label: t('inspection.batiment.gouttieres'),
        type: 'select',
        options: [t('inspection.options.yes'), t('inspection.options.no')],
        multiselect: false
      },
      {
        id: 'type_toiture',
        label: t('inspection.batiment.toiture'),
        type: 'multiselect',
        options: [
          t('inspection.batimentOptions.toitureOptions.bardeauxAsphalte'),
          t('inspection.batimentOptions.toitureOptions.goudronGravier'),
          t('inspection.batimentOptions.toitureOptions.tole'),
          t('inspection.batimentOptions.toitureOptions.membraneElastomere'),
          t('inspection.batimentOptions.toitureOptions.acier'),
          t('inspection.batimentOptions.toitureOptions.bardeauxBois'),
          t('inspection.batimentOptions.toitureOptions.tuilesBeton'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      { id: 'age_toiture', label: t('inspection.batiment.ageToiture'), type: 'text' },
      { id: 'notes', label: t('inspection.fields.notes'), type: 'text', multiline: true }
    ]
  },
  {
    id: 'portes_fenetres',
    name: t('inspection.batiment.portesFenetres'),
    icon: Window,
    fields: [
      {
        id: 'type_portes',
        label: t('inspection.batiment.typePortes'),
        type: 'multiselect',
        options: [
          t('inspection.batimentOptions.portesOptions.acier'),
          t('inspection.batimentOptions.portesOptions.portePatio'),
          t('inspection.batimentOptions.portesOptions.bois'),
          t('inspection.batimentOptions.portesOptions.aluminium'),
          t('inspection.batimentOptions.portesOptions.vitree'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      {
        id: 'materiau_fenetres',
        label: t('inspection.batiment.fenetresMateirau'),
        type: 'multiselect',
        options: [
          t('inspection.batimentOptions.fenetresMateriauOptions.aluminium'),
          t('inspection.batimentOptions.fenetresMateriauOptions.pvc'),
          t('inspection.batimentOptions.fenetresMateriauOptions.vinyle'),
          t('inspection.batimentOptions.fenetresMateriauOptions.bois'),
          t('inspection.batimentOptions.fenetresMateriauOptions.vitreVitre'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      {
        id: 'type_fenetres',
        label: t('inspection.batiment.fenetresType'),
        type: 'multiselect',
        options: [
          t('inspection.batimentOptions.fenetresTypeOptions.manivelles'),
          t('inspection.batimentOptions.fenetresTypeOptions.battant'),
          t('inspection.batimentOptions.fenetresTypeOptions.coulissantes'),
          t('inspection.batimentOptions.fenetresTypeOptions.guillotine'),
          t('inspection.batimentOptions.fenetresTypeOptions.fixes'),
          t('inspection.options.other')
        ],
        multiselect: true
      },
      { id: 'notes', label: t('inspection.fields.notes'), type: 'text', multiline: true }
    ]
  },
  {
    id: 'corniche_lucarnes_cheminee',
    name: t('inspection.batiment.cornicheLucarnesCheminee'),
    icon: Deck,
    fields: [
      {
        id: 'corniche',
        label: t('inspection.batiment.corniche'),
        type: 'select',
        options: [
          t('inspection.batimentOptions.murOptions.aluminium'),
          t('inspection.options.other')
        ],
        multiselect: false
      },
      { id: 'lucarnes_nombre', label: t('inspection.batiment.lucarnesNombre'), type: 'number' },
      { id: 'lucarnes_longueur', label: t('inspection.batiment.lucarnesLongueur'), type: 'text' },
      { id: 'cheminee_nombre', label: t('inspection.batiment.chemineeNombre'), type: 'number' },
      {
        id: 'cheminee_materiau',
        label: t('inspection.batiment.chemineeMateirau'),
        type: 'select',
        options: [
          t('inspection.batimentOptions.chemineesOptions.briques'),
          t('inspection.options.other')
        ],
        multiselect: false
      },
      { id: 'notes', label: t('inspection.fields.notes'), type: 'text', multiline: true }
    ]
  }
]

export default function BatimentPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const propertyId = params?.id as string

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

      // Load existing data if available
      if (prop.inspection_batiment) {
        const batimentData = prop.inspection_batiment
        setFormData(batimentData)

        // Load custom values for each subcategory
        const loadedCustomValues: Record<string, Record<string, string>> = {}
        Object.keys(batimentData).forEach(subcategoryId => {
          const subcategoryData = batimentData[subcategoryId]
          if (subcategoryData?.customValues) {
            loadedCustomValues[subcategoryId] = subcategoryData.customValues
          }
        })
        setCustomValues(loadedCustomValues)
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
          customValues: customValues[selectedSubcategory] || {},
          completedAt: new Date().toISOString()
        }
      }

      await propertiesSupabaseService.updateProperty(propertyId, {
        inspection_batiment: updatedData
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

  const calculateProgress = () => {
    const SUBCATEGORIES = getSubcategories(t)
    const completed = SUBCATEGORIES.filter(sub => isSubcategoryCompleted(sub.id)).length
    return Math.round((completed / SUBCATEGORIES.length) * 100)
  }

  const getCompletedCount = () => {
    const SUBCATEGORIES = getSubcategories(t)
    return SUBCATEGORIES.filter(sub => isSubcategoryCompleted(sub.id)).length
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
          <Typography color="text.primary">{t('inspection.batiment.title')}</Typography>
        </Breadcrumbs>

        {/* Property Address - Clickable to Google Maps */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
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
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/${locale}/library?propertyId=${propertyId}`)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Voir la fiche
          </Button>
        </Box>

        {/* Category Header */}
        <CategoryHeader
          categoryName={t('inspection.batiment.title')}
          categoryColor="#FF9800"
          categoryIcon={Home}
          progress={calculateProgress()}
          completedItems={getCompletedCount()}
          totalItems={getSubcategories(t).length}
          subtitle="Inspection du bâtiment et structures"
        />

        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => router.push(`/${locale}/inspection/${propertyId}/categories`)} sx={{ bgcolor: 'grey.100' }}>
            <ArrowBack />
          </IconButton>
        </Box>

        {!selectedSubcategory ? (
          <>
            {/* Subcategory Cards - Premium Style */}
            <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Sections d'inspection
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#64748B', mt: 0.5 }}>
                  Sélectionnez une section pour commencer l'inspection
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {SUBCATEGORIES.map((subcategory, index) => {
                  const Icon = subcategory.icon
                  const isCompleted = isSubcategoryCompleted(subcategory.id)
                  const categoryColor = '#F59E0B'

                  return (
                    <Grid item xs={12} sm={6} md={4} key={subcategory.id}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: '16px',
                          position: 'relative',
                          overflow: 'visible',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '2px solid',
                          borderColor: isCompleted ? categoryColor : 'rgba(0,0,0,0.06)',
                          bgcolor: isCompleted ? `${categoryColor}10` : 'white',
                          boxShadow: isCompleted ? `0 4px 20px ${categoryColor}25` : '0 2px 8px rgba(0,0,0,0.04)',
                          animation: `${scaleIn} 0.3s ease-out ${index * 0.08}s both`,
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: `0 12px 32px ${categoryColor}20`,
                            borderColor: categoryColor
                          }
                        }}
                      >
                        {/* Completion badge */}
                        {isCompleted && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${categoryColor} 0%, #D97706 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${categoryColor}50`,
                              zIndex: 10
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                        )}

                        <CardActionArea onClick={() => setSelectedSubcategory(subcategory.id)} sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {/* Icon container */}
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: '14px',
                                background: isCompleted
                                  ? `linear-gradient(135deg, ${categoryColor} 0%, #D97706 100%)`
                                  : `${categoryColor}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Icon sx={{ fontSize: 26, color: isCompleted ? 'white' : categoryColor }} />
                            </Box>

                            {/* Text content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: '#0F172A',
                                letterSpacing: '-0.01em',
                                mb: 0.25
                              }}>
                                {subcategory.name}
                              </Typography>
                              <Typography sx={{
                                fontSize: '12px',
                                color: isCompleted ? '#059669' : '#94A3B8'
                              }}>
                                {isCompleted ? 'Complété' : 'Non inspecté'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          </>
        ) : (
          <>
            {/* Form View */}
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
              {currentSubcategory?.name}
            </Typography>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {currentSubcategory?.fields.map((field) => (
                  <Box key={field.id}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#FF9800' }}>
                      {field.label}
                    </Typography>

                    {(field.type === 'select' || field.type === 'autocomplete' || field.type === 'multiselect') && field.options ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {field.options.map((option) => {
                          const isMultiselect = field.type === 'multiselect'
                          const currentValue = formData[selectedSubcategory]?.[field.id]
                          const isOther = option === 'Autres' || option === 'Autre'
                          const customValue = isOther && selectedSubcategory ? customValues[selectedSubcategory]?.[field.id] : null
                          const displayLabel = customValue || option

                          const isSelected = isMultiselect
                            ? Array.isArray(currentValue) && currentValue.includes(option)
                            : currentValue === option

                          const handleClick = () => {
                            if (isOther && !isSelected) {
                              // Open dialog for custom value
                              setCurrentField(field.id)
                              setTempCustomValue(customValue || '')
                              setCustomDialogOpen(true)
                            }

                            if (isMultiselect) {
                              // Handle multiple selection
                              const current = Array.isArray(currentValue) ? currentValue : []
                              const newValue = current.includes(option)
                                ? current.filter(v => v !== option) // Remove if already selected
                                : [...current, option] // Add if not selected
                              handleFieldChange(selectedSubcategory, field.id, newValue)
                            } else {
                              // Handle single selection
                              handleFieldChange(selectedSubcategory, field.id, option)
                            }
                          }

                          return (
                            <Chip
                              key={option}
                              label={displayLabel}
                              onClick={handleClick}
                              sx={{
                                bgcolor: isSelected ? '#FF9800' : 'white',
                                color: isSelected ? 'white' : 'text.primary',
                                border: '1px solid',
                                borderColor: isSelected ? '#FF9800' : 'divider',
                                fontWeight: isSelected ? 600 : 400,
                                fontSize: '0.9rem',
                                px: 2,
                                py: 2.5,
                                height: 'auto',
                                '&:hover': {
                                  bgcolor: isSelected ? '#F57C00' : '#FFF3E0',
                                  borderColor: '#FF9800'
                                },
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            />
                          )
                        })}
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        placeholder={field.label}
                        type={field.type}
                        multiline={field.multiline}
                        rows={field.multiline ? 4 : 1}
                        value={formData[selectedSubcategory]?.[field.id] || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, field.id, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#FF9800'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF9800'
                            }
                          }
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSubcategory(null)}
                  disabled={saving}
                  sx={{
                    borderColor: '#FF9800',
                    color: '#FF9800',
                    '&:hover': {
                      borderColor: '#F57C00',
                      bgcolor: '#FFF3E0'
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
                    bgcolor: '#FF9800',
                    '&:hover': {
                      bgcolor: '#F57C00'
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
          <Button onClick={handleCustomValueSave} variant="contained" sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Navigation */}
      <InspectionFloatingNav inspectionId={propertyId} currentCategory="batiment" />
    </MaterialDashboardLayout>
  )
}
