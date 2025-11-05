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
  Snackbar,
  Button
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

const getCategories = (t: any) => [
  {
    id: 'pieces',
    name: t('inspection.categories.pieces'),
    description: t('inspection.categories.piecesDesc'),
    icon: Layers,
    color: '#2196F3',
    weight: 0.25,
    enabled: true
  },
  {
    id: 'batiment',
    name: t('inspection.categories.batiment'),
    description: t('inspection.categories.batimentDesc'),
    icon: Home,
    color: '#FF9800',
    weight: 0.25,
    enabled: true
  },
  {
    id: 'garage',
    name: t('inspection.categories.garage'),
    description: t('inspection.categories.garageDesc'),
    icon: DirectionsCar,
    color: '#4CAF50',
    weight: 0.15,
    enabled: true
  },
  {
    id: 'mecanique',
    name: t('inspection.categories.mecanique'),
    description: t('inspection.categories.mecaniqueDesc'),
    icon: Settings,
    color: '#9C27B0',
    weight: 0.15,
    enabled: true
  },
  {
    id: 'divers',
    name: t('inspection.categories.divers'),
    description: t('inspection.categories.diversDesc'),
    icon: Build,
    color: '#607D8B',
    weight: 0.00,
    enabled: true
  },
  {
    id: 'exterieur',
    name: t('inspection.categories.exterieur'),
    description: t('inspection.categories.exterieurDesc'),
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

    const categories = getCategories(t)
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
  const categories = getCategories(t)

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
              {property.adresse}, {property.ville}
              <OpenInNew fontSize="small" />
            </Typography>
            {property.province && (
              <Typography variant="body2" color="text.secondary">
                {property.province} • {property.type_propriete}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/${locale}/library?propertyId=${property.id}`)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Voir la fiche
          </Button>
        </Box>

        {/* Progress Window */}
        <InspectionProgressWindow property={property} />


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
