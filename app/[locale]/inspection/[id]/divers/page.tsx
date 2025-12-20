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
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  NavigateNext,
  ArrowBack,
  CheckCircle,
  OpenInNew,
  Build,
  Public,
  Fireplace,
  MiscellaneousServices,
  WaterDrop,
  WavingHand,
  FlashOn,
  DirectionsWalk,
  Opacity,
  Landscape,
  Kitchen,
  Air,
  Security,
  Bathtub,
  HotTub,
  SolarPower,
  Stairs,
  Radio,
  VolumeUp,
  Microwave,
  DinnerDining,
  ElectricBolt,
  Light
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { InspectionFloatingNav } from '@/features/inspection/components/InspectionFloatingNav'
import { CategoryHeader } from '@/features/inspection/components/CategoryHeader'

const getServicesItems = (t: any) => [
  { id: 'aqueduc', label: t('inspection.diversOptions.servicesItems.aqueduc'), icon: WaterDrop },
  { id: 'egout_sanitaire', label: t('inspection.diversOptions.servicesItems.egoutSanitaire'), icon: Opacity },
  { id: 'egout_pluvial', label: t('inspection.diversOptions.servicesItems.egoutPluvial'), icon: WaterDrop },
  { id: 'rue_pavee', label: t('inspection.diversOptions.servicesItems.ruePavee'), icon: DirectionsWalk },
  { id: 'rue_non_pavee', label: t('inspection.diversOptions.servicesItems.rueNonPavee'), icon: DirectionsWalk },
  { id: 'eclairage', label: t('inspection.diversOptions.servicesItems.eclairage'), icon: FlashOn },
  { id: 'trottoirs', label: t('inspection.diversOptions.servicesItems.trottoirs'), icon: DirectionsWalk },
  { id: 'puits', label: t('inspection.diversOptions.servicesItems.puits'), icon: WaterDrop },
  { id: 'fosse_septique', label: t('inspection.diversOptions.servicesItems.fosseSeptique'), icon: Opacity },
  { id: 'fosse', label: t('inspection.diversOptions.servicesItems.fosse'), icon: Landscape },
  { id: 'champs_epuration', label: t('inspection.diversOptions.servicesItems.champsEpuration'), icon: Landscape },
  { id: 'bordures', label: t('inspection.diversOptions.servicesItems.bordures'), icon: DirectionsWalk },
  { id: 'eau_lac', label: t('inspection.diversOptions.servicesItems.eauLac'), icon: WaterDrop },
  { id: 'pointe_eau', label: t('inspection.diversOptions.servicesItems.pointeEau'), icon: WaterDrop }
]

const getDiversItems = (t: any) => [
  { id: 'lave_vaisselle', label: t('inspection.diversOptions.diversItems.laveVaisselle'), icon: Kitchen },
  { id: 'ventilateur_salle_bain', label: t('inspection.diversOptions.diversItems.ventilateurSalleBain'), icon: Air },
  { id: 'hotte', label: t('inspection.diversOptions.diversItems.hotte'), icon: Air },
  { id: 'aspirateur_central', label: t('inspection.diversOptions.diversItems.aspirateurCentral'), icon: MiscellaneousServices },
  { id: 'systeme_alarme', label: t('inspection.diversOptions.diversItems.systemeAlarme'), icon: Security },
  { id: 'bain_tourbillon', label: t('inspection.diversOptions.diversItems.bainTourbillon'), icon: Bathtub },
  { id: 'spa_integre', label: t('inspection.diversOptions.diversItems.spaIntegre'), icon: HotTub },
  { id: 'sauna', label: t('inspection.diversOptions.diversItems.sauna'), icon: HotTub },
  { id: 'puits_lumiere', label: t('inspection.diversOptions.diversItems.puitsLumiere'), icon: Light },
  { id: 'entree_sous_sol', label: t('inspection.diversOptions.diversItems.entreeSousSol'), icon: Stairs },
  { id: 'radio_intercom', label: t('inspection.diversOptions.diversItems.radioIntercom'), icon: Radio },
  { id: 'systeme_son', label: t('inspection.diversOptions.diversItems.systemeSon'), icon: VolumeUp },
  { id: 'four_encastre', label: t('inspection.diversOptions.diversItems.fourEncastre'), icon: Microwave },
  { id: 'plaque_encastree', label: t('inspection.diversOptions.diversItems.plaqueEncastree'), icon: DinnerDining },
  { id: 'micro_onde_encastre', label: t('inspection.diversOptions.diversItems.microOndeEncastre'), icon: Microwave }
]

const getSubcategories = (t: any) => [
  {
    id: 'services',
    name: t('inspection.divers.services'),
    icon: Public
  },
  {
    id: 'voisinage',
    name: t('inspection.divers.voisinage'),
    icon: WavingHand
  },
  {
    id: 'foyer',
    name: t('inspection.divers.foyer'),
    icon: Fireplace
  },
  {
    id: 'divers',
    name: t('inspection.divers.diversSub'),
    icon: MiscellaneousServices
  }
]

export default function DiversPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const propertyId = params?.id as string

  // Get translated arrays
  const SERVICES_ITEMS = getServicesItems(t)
  const DIVERS_ITEMS = getDiversItems(t)

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

      if (prop.inspection_divers) {
        setFormData(prop.inspection_divers)

        // Load custom values
        if (prop.inspection_divers.customValues) {
          setCustomValues(prop.inspection_divers.customValues)
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
        inspection_divers: updatedData
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

  const renderItemCard = (item: { id: string, label: string, icon: any }, selected: boolean) => {
    const Icon = item.icon
    const handleClick = () => {
      if (!selectedSubcategory) return

      // Handle "Autres" special case
      if (item.id === 'autres') {
        if (!selected) {
          setCurrentField('autres')
          setTempCustomValue(customValues[selectedSubcategory]?.['autres'] || '')
          setCustomDialogOpen(true)
        }
      }

      const currentItems = formData[selectedSubcategory]?.selectedItems || []
      const newItems = currentItems.includes(item.id)
        ? currentItems.filter((id: string) => id !== item.id)
        : [...currentItems, item.id]

      handleFieldChange(selectedSubcategory, 'selectedItems', newItems)
    }

    // Show custom value if "Autres" is selected and has a custom value
    const displayLabel = (item.id === 'autres' && selectedSubcategory && customValues[selectedSubcategory]?.['autres'])
      ? customValues[selectedSubcategory]['autres']
      : item.label

    return (
      <Card
        key={item.id}
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          border: '2px solid',
          borderColor: selected ? '#607D8B' : 'divider',
          bgcolor: selected ? '#607D8B1a' : 'white',
          borderRadius: '12px',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#607D8B',
            bgcolor: '#607D8B10'
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Icon sx={{ fontSize: 32, color: '#607D8B', mb: 1 }} />
          <Typography variant="body2" fontWeight={selected ? 600 : 400}>
            {displayLabel}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const renderChipField = (label: string, fieldId: string, options: string[]) => {
    if (!selectedSubcategory) return null
    const currentValue = formData[selectedSubcategory]?.[fieldId]

    return (
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {options.map((option) => {
            const isOther = option === 'Autres' || option === 'Autre'
            const customValue = isOther ? customValues[selectedSubcategory]?.[fieldId] : null
            const displayLabel = customValue || option

            const isSelected = currentValue === option

            const handleClick = () => {
              if (isOther && !isSelected) {
                setCurrentField(fieldId)
                setTempCustomValue(customValue || '')
                setCustomDialogOpen(true)
              }
              handleFieldChange(selectedSubcategory, fieldId, option)
            }

            return (
              <Chip
                key={option}
                label={displayLabel}
                onClick={handleClick}
                sx={{
                  bgcolor: isSelected ? '#607D8B' : 'white',
                  color: isSelected ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor: isSelected ? '#607D8B' : 'divider',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 2.5,
                  height: 'auto',
                  '&:hover': {
                    bgcolor: isSelected ? '#546E7A' : '#ECEFF1',
                    borderColor: '#607D8B'
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
  const selectedItems = selectedSubcategory ? (formData[selectedSubcategory]?.selectedItems || []) : []

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
          <Typography color="text.primary">{t('inspection.divers.title')}</Typography>
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

        {/* Category Header */}
        <CategoryHeader
          categoryName={t('inspection.divers.title')}
          categoryColor="#607D8B"
          categoryIcon={Build}
          progress={property?.inspection_divers?.completedAt ? 100 : 0}
          completedItems={property?.inspection_divers?.completedAt ? 1 : 0}
          totalItems={1}
          subtitle="Éléments additionnels (optionnel)"
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
                  <Grid item xs={12} sm={6} md={3} key={subcategory.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '160px',
                        borderRadius: '16px',
                        border: isCompleted ? '2px solid' : '1px solid',
                        borderColor: isCompleted ? '#607D8B' : '#e0e0e0',
                        bgcolor: isCompleted ? '#607D8B1a' : 'white',
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
                            color: '#607D8B'
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
                            color: '#607D8B',
                            mb: 2
                          }} />
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: isCompleted ? '#607D8B' : 'text.primary' }}
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

                {selectedSubcategory === 'services' && (
                  <>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Services disponibles
                      </Typography>
                      <Grid container spacing={2}>
                        {SERVICES_ITEMS.map(item => (
                          <Grid item xs={6} sm={4} md={3} key={item.id}>
                            {renderItemCard(item, selectedItems.includes(item.id))}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Notes */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Notes
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Notes (optionnel)"
                        value={formData[selectedSubcategory]?.notes || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, 'notes', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#607D8B'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#607D8B'
                            }
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

                {selectedSubcategory === 'voisinage' && (
                  <>
                    {/* Secteur */}
                    {renderChipField('Secteur', 'secteur', [
                      t('inspection.diversOptions.secteurOptions.homogene'),
                      t('inspection.diversOptions.secteurOptions.mixte')
                    ])}

                    {/* Intersection */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Intersection
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Intersection"
                        value={formData[selectedSubcategory]?.intersection || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, 'intersection', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#607D8B'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#607D8B'
                            }
                          }
                        }}
                      />
                    </Box>

                    {/* Facteurs favorables ou défavorables */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Facteurs favorables ou défavorables
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Facteurs favorables ou défavorables"
                        value={formData[selectedSubcategory]?.facteurs || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, 'facteurs', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#607D8B'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#607D8B'
                            }
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

                {selectedSubcategory === 'foyer' && (
                  <>
                    {/* Étage */}
                    {renderChipField('Étage', 'etage', [
                      t('inspection.diversOptions.foyerPlancher.sousSol'),
                      t('inspection.diversOptions.foyerPlancher.rdc'),
                      t('inspection.diversOptions.foyerPlancher.etage')
                    ])}

                    {/* Type */}
                    {renderChipField('Type', 'type', [
                      t('inspection.diversOptions.foyerType.acierPrefab'),
                      t('inspection.diversOptions.foyerType.foyerGaz'),
                      t('inspection.diversOptions.foyerType.acierCombLenteInt'),
                      t('inspection.diversOptions.foyerType.briques'),
                      t('inspection.diversOptions.foyerType.pierres'),
                      t('inspection.diversOptions.foyerType.poeleCombLenteBois'),
                      t('inspection.options.other')
                    ])}

                    {/* Notes */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Notes
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Notes (optionnel)"
                        value={formData[selectedSubcategory]?.notes || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, 'notes', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#607D8B'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#607D8B'
                            }
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

                {selectedSubcategory === 'divers' && (
                  <>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Équipements et installations
                      </Typography>
                      <Grid container spacing={2}>
                        {DIVERS_ITEMS.map(item => (
                          <Grid item xs={6} sm={4} md={3} key={item.id}>
                            {renderItemCard(item, selectedItems.includes(item.id))}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Notes */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#607D8B' }}>
                        Notes
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Notes (optionnel)"
                        value={formData[selectedSubcategory]?.notes || ''}
                        onChange={(e) => handleFieldChange(selectedSubcategory, 'notes', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#607D8B'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#607D8B'
                            }
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSubcategory(null)}
                  disabled={saving}
                  sx={{
                    borderColor: '#607D8B',
                    color: '#607D8B',
                    '&:hover': {
                      borderColor: '#546E7A',
                      bgcolor: '#ECEFF1'
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
                    bgcolor: '#607D8B',
                    '&:hover': {
                      bgcolor: '#546E7A'
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
          <Button onClick={handleCustomValueSave} variant="contained" sx={{ bgcolor: '#607D8B', '&:hover': { bgcolor: '#546E7A' } }}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Navigation */}
      <InspectionFloatingNav inspectionId={propertyId} currentCategory="divers" />
    </MaterialDashboardLayout>
  )
}
