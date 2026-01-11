'use client'

import React, { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardActionArea,
  keyframes
} from '@mui/material'
import {
  Add,
  Delete,
  ArrowForward,
  LocationOn,
  Schedule,
  Home,
  PlayArrow,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { calculateInspectionProgress } from '@/features/inspection/utils/progress.utils'

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

export default function InspectionPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadInspections()
  }, [])

  const loadInspections = async () => {
    try {
      setLoading(true)
      setError(null)

      const { items } = await propertiesSupabaseService.getProperties({ limit: 1000 })

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const inspections = items.filter(prop => {
        if (!prop.inspection_status) return false
        const hasActiveStatus = prop.inspection_status === 'in_progress' || prop.inspection_status === 'completed'
        if (!hasActiveStatus) return false
        if (prop.inspection_status === 'completed' && prop.updated_at) {
          return prop.updated_at >= sevenDaysAgo
        }
        return true
      })

      inspections.sort((a, b) => {
        const dateA = a.updated_at?.getTime() || 0
        const dateB = b.updated_at?.getTime() || 0
        return dateB - dateA
      })

      setProperties(inspections)
    } catch (err) {
      console.error('Error loading inspections:', err)
      setError('Failed to load inspections')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    router.push(`/${locale}/inspection/create`)
  }

  const handleContinue = (propertyId: string) => {
    router.push(`/${locale}/inspection/${propertyId}/categories`)
  }

  const handleDeleteClick = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation()
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return
    try {
      await propertiesSupabaseService.delete(propertyToDelete.id)
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
      loadInspections()
    } catch (err) {
      console.error('Error deleting property:', err)
      setError('Failed to delete inspection')
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#10B981'
    if (progress >= 50) return '#F59E0B'
    return '#3B82F6'
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'À l\'instant'
    if (hours < 24) return `Il y a ${hours}h`
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`

    return new Intl.DateTimeFormat('fr-CA', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const getPropertyImage = (property: Property) => {
    if (property.photos && property.photos.length > 0) {
      return property.photos[0].reference || property.photos[0].thumbnail
    }
    return null
  }

  return (
    <MaterialDashboardLayout>
      <Box sx={{ pb: 4 }}>
        {/* Premium Header */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            mb: 4,
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
            animation: mounted ? `${fadeInUp} 0.6s ease-out` : 'none'
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(ellipse 60% 40% at 10% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse 50% 30% at 90% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)
              `,
              zIndex: 1
            }}
          />

          {/* Grid pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              zIndex: 2
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '28px', md: '36px' },
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                {t('inspection.title')}
              </Typography>
              <Typography sx={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
                {properties.length} inspection{properties.length !== 1 ? 's' : ''} en cours
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{
                bgcolor: '#10B981',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  bgcolor: '#059669',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {t('inspection.createNew')}
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={48} sx={{ color: '#3B82F6' }} />
              <Typography sx={{ mt: 2, color: '#64748B', fontSize: '14px' }}>
                Chargement des inspections...
              </Typography>
            </Box>
          </Box>
        ) : properties.length === 0 ? (
          /* Premium Empty State */
          <Paper
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              animation: mounted ? `${scaleIn} 0.5s ease-out` : 'none'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <Home sx={{ fontSize: 40, color: '#94A3B8' }} />
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', mb: 1 }}>
              {t('inspection.empty')}
            </Typography>
            <Typography sx={{ fontSize: '15px', color: '#64748B', mb: 4, maxWidth: 400, mx: 'auto' }}>
              {t('inspection.emptyDescription')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{
                bgcolor: '#3B82F6',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#2563EB' }
              }}
            >
              {t('inspection.createNew')}
            </Button>
          </Paper>
        ) : (
          /* Property Cards Grid */
          <Grid container spacing={2.5}>
            {properties.map((property, index) => {
              const progress = calculateInspectionProgress(property)
              const progressColor = getProgressColor(progress)
              const image = getPropertyImage(property)
              const isCompleted = progress >= 100

              return (
                <Grid item xs={12} sm={6} lg={4} key={property.id}>
                  <Card
                    sx={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: isCompleted ? '#10B98130' : 'rgba(0,0,0,0.06)',
                      boxShadow: isCompleted
                        ? '0 4px 20px rgba(16, 185, 129, 0.15)'
                        : '0 2px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: mounted ? `${fadeInUp} 0.5s ease-out ${0.1 + index * 0.05}s both` : 'none',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                        borderColor: progressColor
                      }
                    }}
                  >
                    <CardActionArea onClick={() => handleContinue(property.id)}>
                      {/* Image / Placeholder */}
                      <Box
                        sx={{
                          height: 140,
                          position: 'relative',
                          background: image
                            ? `url(${image}) center/cover`
                            : 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Gradient overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
                          }}
                        />

                        {/* Progress ring - positioned top right */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={44}
                            thickness={4}
                            sx={{ color: '#E2E8F0', position: 'absolute' }}
                          />
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={44}
                            thickness={4}
                            sx={{
                              color: progressColor,
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round'
                              }
                            }}
                          />
                          <Typography
                            sx={{
                              position: 'absolute',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: progressColor
                            }}
                          >
                            {progress}
                          </Typography>
                        </Box>

                        {/* Status badge */}
                        <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
                          <Chip
                            icon={isCompleted ? <CheckCircle sx={{ fontSize: 14 }} /> : <TrendingUp sx={{ fontSize: 14 }} />}
                            label={isCompleted ? 'Complété' : 'En cours'}
                            size="small"
                            sx={{
                              bgcolor: isCompleted ? 'rgba(16, 185, 129, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '11px',
                              backdropFilter: 'blur(8px)',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        </Box>

                        {/* No image placeholder icon */}
                        {!image && (
                          <Home
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: 48,
                              color: '#94A3B8',
                              opacity: 0.5
                            }}
                          />
                        )}
                      </Box>

                      {/* Content */}
                      <Box sx={{ p: 2.5 }}>
                        <Typography
                          sx={{
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#0F172A',
                            letterSpacing: '-0.01em',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.adresse}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                          <LocationOn sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                            {property.ville || 'N/A'}
                          </Typography>
                          {property.type_propriete && (
                            <>
                              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#CBD5E1', mx: 0.5 }} />
                              <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                {property.type_propriete}
                              </Typography>
                            </>
                          )}
                        </Box>

                        {/* Footer */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule sx={{ fontSize: 14, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                              {formatDate(property.updated_at)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => handleDeleteClick(e, property)}
                              sx={{
                                color: '#94A3B8',
                                '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' }
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: progressColor,
                                fontSize: '13px',
                                fontWeight: 600
                              }}
                            >
                              Continuer
                              <ArrowForward sx={{ fontSize: 16 }} />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: '16px', p: 1 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>{t('inspection.confirmDelete')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('inspection.deleteMessage')}
              {propertyToDelete && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#FEE2E2', borderRadius: '8px' }}>
                  <Typography sx={{ fontWeight: 600, color: '#991B1B' }}>
                    {propertyToDelete.adresse}
                  </Typography>
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ borderRadius: '10px', textTransform: 'none' }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{
                bgcolor: '#EF4444',
                borderRadius: '10px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#DC2626' }
              }}
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MaterialDashboardLayout>
  )
}
