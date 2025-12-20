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
  TextField,
  InputAdornment
} from '@mui/material'
import {
  Landscape,
  NavigateNext,
  ArrowBack,
  Pool,
  CheckCircle,
  OpenInNew,
  Grass,
  Park,
  Fence as FenceIcon,
  Deck,
  Home,
  Light,
  WaterDrop,
  Storage,
  DirectionsWalk,
  DirectionsCar
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { InspectionFloatingNav } from '@/features/inspection/components/InspectionFloatingNav'
import { CategoryHeader } from '@/features/inspection/components/CategoryHeader'

const FEET_TO_METERS = 0.3048

const getAmenagementItems = (t: any) => [
  { id: 'pelouse', label: t('inspection.exterieurOptions.amenagementItems.pelouse'), icon: Grass },
  { id: 'arbres', label: t('inspection.exterieurOptions.amenagementItems.arbres'), icon: Park },
  { id: 'arbustes', label: t('inspection.exterieurOptions.amenagementItems.arbustes'), icon: Park },
  { id: 'haie', label: t('inspection.exterieurOptions.amenagementItems.haie'), icon: Park },
  { id: 'rocailles', label: t('inspection.exterieurOptions.amenagementItems.rocailles'), icon: Landscape },
  { id: 'trottoirs', label: t('inspection.exterieurOptions.amenagementItems.trottoirs'), icon: DirectionsWalk },
  { id: 'cloture', label: t('inspection.exterieurOptions.amenagementItems.cloture'), icon: FenceIcon },
  { id: 'terrasse_pavee', label: t('inspection.exterieurOptions.amenagementItems.terrassePavee'), icon: Deck },
  { id: 'dalle_beton', label: t('inspection.exterieurOptions.amenagementItems.dalleBeton'), icon: Deck }
]

const getInstallationsItems = (t: any) => [
  { id: 'perron', label: t('inspection.exterieurOptions.installationItems.perron'), icon: Home },
  { id: 'balcon', label: t('inspection.exterieurOptions.installationItems.balcon'), icon: Deck },
  { id: 'patio', label: t('inspection.exterieurOptions.installationItems.patio'), icon: Deck },
  { id: 'terrasse', label: t('inspection.exterieurOptions.installationItems.terrasse'), icon: Deck },
  { id: 'galerie', label: t('inspection.exterieurOptions.installationItems.galerie'), icon: Deck },
  { id: 'veranda_solarium', label: t('inspection.exterieurOptions.installationItems.verandaSolarium'), icon: Light },
  { id: 'gazebo_pergola', label: t('inspection.exterieurOptions.installationItems.gazeboPergola'), icon: Deck },
  { id: 'murets', label: t('inspection.exterieurOptions.installationItems.murets'), icon: FenceIcon },
  { id: 'cabanons', label: t('inspection.exterieurOptions.installationItems.cabanons'), icon: Storage },
  { id: 'eclairage_exterieur', label: t('inspection.exterieurOptions.installationItems.eclairageExterieur'), icon: Light },
  { id: 'systeme_arrosage', label: t('inspection.exterieurOptions.installationItems.systemeArrosage'), icon: WaterDrop }
]

const getEntreeOptions = (t: any) => [
  t('inspection.exterieurOptions.entreeOptions.paveUni'),
  t('inspection.exterieurOptions.entreeOptions.beton'),
  t('inspection.exterieurOptions.entreeOptions.asphalte'),
  t('inspection.exterieurOptions.entreeOptions.gravier'),
  t('inspection.options.other')
]

const getSubcategories = (t: any) => [
  {
    id: 'amenagement_installations_entree',
    name: t('inspection.exterieur.amenagementInstallationsEntree'),
    icon: Landscape
  },
  {
    id: 'piscine_spa',
    name: t('inspection.exterieur.piscineSpa'),
    icon: Pool
  }
]

export default function ExterieurPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const propertyId = params?.id as string

  // Get translated arrays
  const AMENAGEMENT_ITEMS = getAmenagementItems(t)
  const INSTALLATIONS_ITEMS = getInstallationsItems(t)
  const ENTREE_OPTIONS = getEntreeOptions(t)

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

  // Dimension states for items requiring dimensions
  const [dimensions, setDimensions] = useState<Record<string, {
    largeurFeet: string,
    longueurFeet: string,
    largeurMeters: string,
    longueurMeters: string
  }>>({})

  // Length states for cloture and murets
  const [lengths, setLengths] = useState<Record<string, {
    feet: string,
    meters: string
  }>>({})

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

        // Load custom values
        if (prop.inspection_exterieur.customValues) {
          setCustomValues(prop.inspection_exterieur.customValues)
        }

        // Load dimensions
        if (prop.inspection_exterieur.dimensions) {
          setDimensions(prop.inspection_exterieur.dimensions)
        }

        // Load lengths
        if (prop.inspection_exterieur.lengths) {
          setLengths(prop.inspection_exterieur.lengths)
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
        customValues,
        dimensions,
        lengths
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

  // Dimension conversion handlers
  const handleDimensionChange = (itemId: string, field: 'largeurFeet' | 'longueurFeet' | 'largeurMeters' | 'longueurMeters', value: string) => {
    const newDimensions = { ...dimensions }
    if (!newDimensions[itemId]) {
      newDimensions[itemId] = { largeurFeet: '', longueurFeet: '', largeurMeters: '', longueurMeters: '' }
    }

    newDimensions[itemId][field] = value

    // Auto-convert
    if (field === 'largeurFeet' && value) {
      newDimensions[itemId].largeurMeters = (parseFloat(value) * FEET_TO_METERS).toFixed(2)
    } else if (field === 'largeurMeters' && value) {
      newDimensions[itemId].largeurFeet = (parseFloat(value) / FEET_TO_METERS).toFixed(2)
    } else if (field === 'longueurFeet' && value) {
      newDimensions[itemId].longueurMeters = (parseFloat(value) * FEET_TO_METERS).toFixed(2)
    } else if (field === 'longueurMeters' && value) {
      newDimensions[itemId].longueurFeet = (parseFloat(value) / FEET_TO_METERS).toFixed(2)
    }

    // Clear meters if feet is empty
    if (field === 'largeurFeet' && !value) {
      newDimensions[itemId].largeurMeters = ''
    }
    if (field === 'longueurFeet' && !value) {
      newDimensions[itemId].longueurMeters = ''
    }
    // Clear feet if meters is empty
    if (field === 'largeurMeters' && !value) {
      newDimensions[itemId].largeurFeet = ''
    }
    if (field === 'longueurMeters' && !value) {
      newDimensions[itemId].longueurFeet = ''
    }

    setDimensions(newDimensions)
  }

  // Length conversion handlers for cloture and murets
  const handleLengthChange = (itemId: string, unit: 'feet' | 'meters', value: string) => {
    const newLengths = { ...lengths }
    if (!newLengths[itemId]) {
      newLengths[itemId] = { feet: '', meters: '' }
    }

    newLengths[itemId][unit] = value

    if (unit === 'feet' && value) {
      newLengths[itemId].meters = (parseFloat(value) * FEET_TO_METERS).toFixed(2)
    } else if (unit === 'meters' && value) {
      newLengths[itemId].feet = (parseFloat(value) / FEET_TO_METERS).toFixed(2)
    }

    if (unit === 'feet' && !value) {
      newLengths[itemId].meters = ''
    }
    if (unit === 'meters' && !value) {
      newLengths[itemId].feet = ''
    }

    setLengths(newLengths)
  }

  const calculateAreaFeet = (itemId: string) => {
    const dim = dimensions[itemId]
    if (dim && dim.largeurFeet && dim.longueurFeet) {
      return (parseFloat(dim.largeurFeet) * parseFloat(dim.longueurFeet)).toFixed(2)
    }
    return ''
  }

  const calculateAreaMeters = (itemId: string) => {
    const dim = dimensions[itemId]
    if (dim && dim.largeurMeters && dim.longueurMeters) {
      return (parseFloat(dim.largeurMeters) * parseFloat(dim.longueurMeters)).toFixed(2)
    }
    return ''
  }

  const needsDimensions = (itemId: string) => {
    // Items that need full dimensions (largeur x longueur)
    return ['perron', 'balcon', 'patio', 'terrasse', 'galerie', 'veranda', 'gazebo', 'terrasse_pavee', 'dalle_beton'].includes(itemId)
  }

  const needsLength = (itemId: string) => {
    // Items that only need length
    return ['cloture', 'murets'].includes(itemId)
  }

  const renderItemCard = (item: { id: string, label: string, icon: any }, selected: boolean) => {
    const Icon = item.icon
    const handleClick = () => {
      if (!selectedSubcategory) return

      const currentItems = formData[selectedSubcategory]?.selectedItems || []
      const newItems = currentItems.includes(item.id)
        ? currentItems.filter((id: string) => id !== item.id)
        : [...currentItems, item.id]

      handleFieldChange(selectedSubcategory, 'selectedItems', newItems)
    }

    return (
      <Card
        key={item.id}
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          border: '2px solid',
          borderColor: selected ? '#795548' : 'divider',
          bgcolor: selected ? '#7955481a' : 'white',
          borderRadius: '12px',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#795548',
            bgcolor: '#79554810'
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Icon sx={{ fontSize: 32, color: '#795548', mb: 1 }} />
          <Typography variant="body2" fontWeight={selected ? 600 : 400}>
            {item.label}
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
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
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
                  bgcolor: isSelected ? '#795548' : 'white',
                  color: isSelected ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor: isSelected ? '#795548' : 'divider',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 2.5,
                  height: 'auto',
                  '&:hover': {
                    bgcolor: isSelected ? '#6D4C41' : '#EFEBE9',
                    borderColor: '#795548'
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
          <Typography color="text.primary">{t('inspection.exterieur.title')}</Typography>
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
          categoryName={t('inspection.exterieur.title')}
          categoryColor="#795548"
          categoryIcon={Landscape}
          progress={0}
          completedItems={getAmenagementItems(t).filter(item => formData[item.id]?.completedAt).length}
          totalItems={getAmenagementItems(t).length}
          subtitle="Aménagements extérieurs"
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
                  <Grid item xs={12} sm={6} key={subcategory.id}>
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
                            color: '#795548',
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                {selectedSubcategory === 'amenagement_installations_entree' && (
                  <>
                    {/* Éléments d'aménagement paysager */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
                        Éléments d'aménagement paysager
                      </Typography>
                      <Grid container spacing={2}>
                        {AMENAGEMENT_ITEMS.map(item => (
                          <Grid item xs={6} sm={4} md={3} key={item.id}>
                            {renderItemCard(item, selectedItems.includes(item.id))}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Installations extérieures */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
                        Installations extérieures
                      </Typography>
                      <Grid container spacing={2}>
                        {INSTALLATIONS_ITEMS.map(item => (
                          <Grid item xs={6} sm={4} md={3} key={item.id}>
                            {renderItemCard(item, selectedItems.includes(item.id))}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Show dimensions for selected items that need them */}
                    {selectedItems.filter((id: string) => needsDimensions(id)).map((itemId: string) => {
                      const item = [...AMENAGEMENT_ITEMS, ...INSTALLATIONS_ITEMS].find(i => i.id === itemId)
                      const dim = dimensions[itemId] || { largeurFeet: '', longueurFeet: '', largeurMeters: '', longueurMeters: '' }

                      return (
                        <Box key={`dim-${itemId}`}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
                            Dimensions - {item?.label}
                          </Typography>

                          {/* Feet row */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                              label="Largeur"
                              type="number"
                              value={dim.largeurFeet}
                              onChange={(e) => handleDimensionChange(itemId, 'largeurFeet', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">pi</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Longueur"
                              type="number"
                              value={dim.longueurFeet}
                              onChange={(e) => handleDimensionChange(itemId, 'longueurFeet', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">pi</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Superficie"
                              value={calculateAreaFeet(itemId)}
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
                              value={dim.largeurMeters}
                              onChange={(e) => handleDimensionChange(itemId, 'largeurMeters', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">m</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Longueur"
                              type="number"
                              value={dim.longueurMeters}
                              onChange={(e) => handleDimensionChange(itemId, 'longueurMeters', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">m</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Superficie"
                              value={calculateAreaMeters(itemId)}
                              InputProps={{
                                readOnly: true,
                                endAdornment: <InputAdornment position="end">m²</InputAdornment>
                              }}
                              sx={{ width: 150, bgcolor: '#f5f5f5' }}
                            />
                          </Box>
                        </Box>
                      )
                    })}

                    {/* Show length for cloture and murets */}
                    {selectedItems.filter((id: string) => needsLength(id)).map((itemId: string) => {
                      const item = [...AMENAGEMENT_ITEMS, ...INSTALLATIONS_ITEMS].find(i => i.id === itemId)
                      const length = lengths[itemId] || { feet: '', meters: '' }

                      return (
                        <Box key={`len-${itemId}`}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
                            Longueur - {item?.label}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                              label="Longueur"
                              type="number"
                              value={length.feet}
                              onChange={(e) => handleLengthChange(itemId, 'feet', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">pi</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Longueur"
                              type="number"
                              value={length.meters}
                              onChange={(e) => handleLengthChange(itemId, 'meters', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">m</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                          </Box>
                        </Box>
                      )
                    })}

                    {/* Type d'entrée */}
                    {renderChipField('Type d\'entrée', 'type_entree', ENTREE_OPTIONS)}

                    {/* Nombre de véhicules */}
                    {renderChipField('# de véhicule', 'nb_vehicules', ['1', '2', '3', '4', '5', '6', '7', '8'])}

                    {/* Notes */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
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
                              borderColor: '#795548'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#795548'
                            }
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

                {selectedSubcategory === 'piscine_spa' && (
                  <>
                    {/* Piscine/Spa selection cards */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
                        Piscine/Spa
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { id: 'piscine_creusee', label: t('inspection.exterieurOptions.piscineItems.piscineCreusee') },
                          { id: 'piscine_semi_creusee', label: t('inspection.exterieurOptions.piscineItems.piscineSemiCreusee') },
                          { id: 'plage_piscine', label: t('inspection.exterieurOptions.piscineItems.plagePiscine') }
                        ].map(item => (
                          <Grid item xs={6} sm={4} key={item.id}>
                            {renderItemCard(
                              { id: item.id, label: item.label, icon: Pool },
                              selectedItems.includes(item.id)
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Show dimensions for piscine_creusee and piscine_semi_creusee */}
                    {selectedItems.filter((id: string) => ['piscine_creusee', 'piscine_semi_creusee'].includes(id)).map((itemId: string) => {
                      const dim = dimensions[itemId] || { largeurFeet: '', longueurFeet: '', largeurMeters: '', longueurMeters: '' }
                      const label = itemId === 'piscine_creusee' ? 'Piscine creusée' : 'Piscine semi-creusée'

                      return (
                        <Box key={`dim-${itemId}`}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
                            Dimensions - {label}
                          </Typography>

                          {/* Feet row */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                              label="Largeur"
                              type="number"
                              value={dim.largeurFeet}
                              onChange={(e) => handleDimensionChange(itemId, 'largeurFeet', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">pi</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Longueur"
                              type="number"
                              value={dim.longueurFeet}
                              onChange={(e) => handleDimensionChange(itemId, 'longueurFeet', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">pi</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Superficie"
                              value={calculateAreaFeet(itemId)}
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
                              value={dim.largeurMeters}
                              onChange={(e) => handleDimensionChange(itemId, 'largeurMeters', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">m</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Longueur"
                              type="number"
                              value={dim.longueurMeters}
                              onChange={(e) => handleDimensionChange(itemId, 'longueurMeters', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">m</InputAdornment>
                              }}
                              sx={{ width: 150 }}
                            />
                            <TextField
                              label="Superficie"
                              value={calculateAreaMeters(itemId)}
                              InputProps={{
                                readOnly: true,
                                endAdornment: <InputAdornment position="end">m²</InputAdornment>
                              }}
                              sx={{ width: 150, bgcolor: '#f5f5f5' }}
                            />
                          </Box>
                        </Box>
                      )
                    })}

                    {/* Notes */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#795548' }}>
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
                              borderColor: '#795548'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#795548'
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
                    borderColor: '#795548',
                    color: '#795548',
                    '&:hover': {
                      borderColor: '#6D4C41',
                      bgcolor: '#EFEBE9'
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
                    bgcolor: '#795548',
                    '&:hover': {
                      bgcolor: '#6D4C41'
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
          <Button onClick={handleCustomValueSave} variant="contained" sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#6D4C41' } }}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Navigation */}
      <InspectionFloatingNav inspectionId={propertyId} currentCategory="exterieur" />
    </MaterialDashboardLayout>
  )
}
