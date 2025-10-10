'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import {
  Layers,
  Home,
  DirectionsCar,
  Settings,
  Build,
  Landscape,
  NavigateNext,
  OpenInNew,
  CheckCircle
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { InspectionProgressWindow } from '@/features/inspection/components/InspectionProgressWindow'

const categories = [
  {
    id: 'pieces',
    name: 'Pièces',
    description: 'Inspection pièce par pièce',
    icon: Layers,
    color: '#2196F3',
    weight: 0.25,
    enabled: true
  },
  {
    id: 'batiment',
    name: 'Bâtiment',
    description: 'Structure et éléments fixes',
    icon: Home,
    color: '#FF9800',
    weight: 0.25,
    enabled: true
  },
  {
    id: 'garage',
    name: 'Garage',
    description: 'Garage et stationnement',
    icon: DirectionsCar,
    color: '#4CAF50',
    weight: 0.15,
    enabled: true
  },
  {
    id: 'mecanique',
    name: 'Mécanique',
    description: 'Systèmes mécaniques',
    icon: Settings,
    color: '#9C27B0',
    weight: 0.15,
    enabled: true
  },
  {
    id: 'divers',
    name: 'Divers',
    description: 'Autres systèmes',
    icon: Build,
    color: '#607D8B',
    weight: 0.00,
    enabled: true
  },
  {
    id: 'exterieur',
    name: 'Extérieur',
    description: 'Aménagements extérieurs',
    icon: Landscape,
    color: '#795548',
    weight: 0.20,
    enabled: true
  }
]

export default function InspectionCategoriesPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const prop = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(prop)
    } catch (err) {
      console.error('Error loading property:', err)
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const isCategoryCompleted = (categoryId: string): boolean => {
    if (!property) return false

    switch (categoryId) {
      case 'pieces':
        // Completed if at least 2 rooms are saved
        const piecesData = property.inspection_pieces
        return (piecesData?.completedRooms || 0) >= 2
      case 'batiment':
        // Completed if any subcategory has data
        return !!property.inspection_batiment
      case 'garage':
        return !!property.inspection_garage
      case 'mecanique':
        return !!property.inspection_mecanique
      case 'divers':
        return !!property.inspection_divers
      case 'exterieur':
        return !!property.inspection_exterieur
      default:
        return false
    }
  }

  const calculateOverallProgress = () => {
    if (!property) return 0

    // Calculate progress based on completed categories with their weights
    let totalProgress = 0

    categories.forEach(cat => {
      if (isCategoryCompleted(cat.id)) {
        totalProgress += cat.weight * 100
      }
    })

    return Math.round(totalProgress)
  }

  const getCategoryProgress = (categoryId: string) => {
    return isCategoryCompleted(categoryId) ? 100 : 0
  }

  const handleCategoryClick = (category: typeof categories[0]) => {
    if (!category.enabled) {
      setSnackbarOpen(true)
      return
    }

    router.push(`/${locale}/inspection/${propertyId}/${category.id}`)
  }

  const handleAddressClick = () => {
    if (property?.adresse && property?.ville) {
      const query = encodeURIComponent(`${property.adresse}, ${property.ville}, ${property.province || 'QC'}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }
  }

  const handleBreadcrumbClick = (path: string) => {
    router.push(`/${locale}${path}`)
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

  const overallProgress = calculateOverallProgress()

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
          <Typography color="text.primary">{t('inspection.breadcrumb.categories')}</Typography>
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
            {property.adresse}, {property.ville}
            <OpenInNew fontSize="small" />
          </Typography>
          {property.province && (
            <Typography variant="body2" color="text.secondary">
              {property.province} • {property.type_propriete}
            </Typography>
          )}
        </Box>

        {/* Progress Window */}
        <InspectionProgressWindow property={property} />

        {/* Categories Title */}
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          {t('inspection.categories.title')}
        </Typography>

        {/* Category Grid - 2 columns */}
        <Grid container spacing={3}>
          {categories.map((category) => {
            const Icon = category.icon
            const isCompleted = isCategoryCompleted(category.id)
            const hasStarted = isCompleted || (category.id === 'pieces' && (property?.inspection_pieces?.totalRooms ?? 0) > 0)

            return (
              <Grid item xs={12} sm={6} key={category.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '150px',
                    borderRadius: '16px',
                    border: hasStarted ? '2px solid' : '1px solid',
                    borderColor: hasStarted ? category.color : '#e0e0e0',
                    bgcolor: hasStarted ? `${category.color}1a` : 'white',
                    opacity: category.enabled ? 1 : 0.6,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: category.enabled ? 'translateY(-4px)' : 'none',
                      boxShadow: category.enabled ? 6 : 1
                    }
                  }}
                >
                  {isCompleted && (
                    <CheckCircle
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontSize: 32,
                        color: category.color
                      }}
                    />
                  )}
                  <CardActionArea
                    onClick={() => handleCategoryClick(category)}
                    disabled={!category.enabled}
                    sx={{
                      height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CardContent sx={{
                      p: 0,
                      width: '100%',
                      textAlign: 'center',
                      '&:last-child': { pb: 0 }
                    }}>
                      <Icon sx={{
                        fontSize: 48,
                        color: category.color,
                        mb: 2
                      }} />
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ color: 'text.primary' }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '12px' }}
                      >
                        {category.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Coming Soon Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={t('inspection.categories.comingSoon')}
        />
      </Box>
    </MaterialDashboardLayout>
  )
}
