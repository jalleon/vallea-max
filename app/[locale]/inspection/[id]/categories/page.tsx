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
  Home,
  Business,
  DirectionsCar,
  Build,
  Inventory,
  Yard,
  NavigateNext,
  OpenInNew
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'

const categories = [
  {
    id: 'pieces',
    icon: Home,
    color: '#4CAF50',
    weight: 40,
    enabled: true
  },
  {
    id: 'batiment',
    icon: Business,
    color: '#2196F3',
    weight: 15,
    enabled: false
  },
  {
    id: 'garage',
    icon: DirectionsCar,
    color: '#FF9800',
    weight: 10,
    enabled: false
  },
  {
    id: 'mecanique',
    icon: Build,
    color: '#9C27B0',
    weight: 15,
    enabled: false
  },
  {
    id: 'divers',
    icon: Inventory,
    color: '#FFC107',
    weight: 0,
    enabled: false
  },
  {
    id: 'exterieur',
    icon: Yard,
    color: '#00BCD4',
    weight: 20,
    enabled: false
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

  const calculateOverallProgress = () => {
    if (!property) return 0

    // Calculate weighted progress based on category completion
    let totalProgress = 0
    let totalWeight = 0

    categories.forEach(cat => {
      if (cat.weight > 0) {
        const categoryProgress = getCategoryProgress(cat.id)
        totalProgress += categoryProgress * cat.weight
        totalWeight += cat.weight
      }
    })

    return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0
  }

  const getCategoryProgress = (categoryId: string) => {
    if (!property) return 0

    switch (categoryId) {
      case 'pieces':
        const piecesData = property.inspection_pieces
        if (piecesData && piecesData.totalRooms > 0) {
          return Math.round((piecesData.completedRooms / piecesData.totalRooms) * 100)
        }
        return 0
      case 'batiment':
        return property.inspection_batiment ? 100 : 0
      case 'garage':
        return property.inspection_garage ? 100 : 0
      case 'mecanique':
        return property.inspection_mecanique ? 100 : 0
      case 'divers':
        return property.inspection_divers ? 100 : 0
      case 'exterieur':
        return property.inspection_exterieur ? 100 : 0
      default:
        return 0
    }
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
              {property.province} • {property.property_type}
            </Typography>
          )}
        </Box>

        {/* Overall Progress */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {t('inspection.progress.overall')}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {t('inspection.progress.completion', { percent: overallProgress })}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                bgcolor: overallProgress < 33 ? 'error.main' : overallProgress < 66 ? 'warning.main' : 'success.main'
              }
            }}
          />
        </Paper>

        {/* Categories Title */}
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          {t('inspection.categories.title')}
        </Typography>

        {/* Category Grid */}
        <Grid container spacing={3}>
          {categories.map((category) => {
            const Icon = category.icon
            const progress = getCategoryProgress(category.id)

            return (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '2px solid',
                    borderColor: category.color,
                    opacity: category.enabled ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: category.enabled ? 'translateY(-4px)' : 'none',
                      boxShadow: category.enabled ? 4 : 0
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCategoryClick(category)}
                    disabled={!category.enabled}
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Icon sx={{ fontSize: 48, color: category.color }} />
                        <Chip
                          label={`${progress}%`}
                          sx={{
                            bgcolor: category.color,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}
                        />
                      </Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: category.color }}>
                        {t(`inspection.categories.${category.id}`)}
                      </Typography>
                      {category.weight > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {category.weight}% {t('inspection.progress.overall').toLowerCase()}
                        </Typography>
                      )}
                      {!category.enabled && (
                        <Chip
                          label={t('inspection.categories.comingSoon')}
                          size="small"
                          sx={{ mt: 1 }}
                          color="default"
                        />
                      )}
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
