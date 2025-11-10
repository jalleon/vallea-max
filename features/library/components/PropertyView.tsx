'use client'

// Google Maps integration with API key from environment
import { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  alpha,
  useTheme
} from '@mui/material'
import {
  Edit,
  Close,
  NavigateBefore,
  NavigateNext,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Home,
  Straighten,
  Layers,
  Search as InspectionIcon,
  CheckCircle,
  AccountBalance,
  ContentCopy,
  Map,
  Assessment,
  Balance
} from '@mui/icons-material'
import { Property } from '../types/property.types'
import { formatCurrency, formatDate, formatMeasurement } from '@/lib/utils/formatting'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { calculateInspectionProgress, getCompletedCategories, getCategoryTranslationKey } from '@/features/inspection/utils/progress.utils'

interface PropertyViewProps {
  property: Property | null
  open: boolean
  onClose: () => void
  onEdit?: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
  canNavigatePrev?: boolean
  canNavigateNext?: boolean
}

export function PropertyView({
  property,
  open,
  onClose,
  onEdit,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false
}: PropertyViewProps) {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('library.view')
  const tCommon = useTranslations('common')
  const tInspection = useTranslations('inspection')

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return

      if (event.key === 'ArrowLeft' && canNavigatePrev && onNavigate) {
        event.preventDefault()
        onNavigate('prev')
      } else if (event.key === 'ArrowRight' && canNavigateNext && onNavigate) {
        event.preventDefault()
        onNavigate('next')
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, canNavigatePrev, canNavigateNext, onNavigate, onClose])

  if (!property) return null

  const inspectionProgress = calculateInspectionProgress(property)
  const completedCategories = getCompletedCategories(property)
  const isInspectionComplete = inspectionProgress === 100

  // Calculate room counts from inspection data
  const calculateRoomCounts = () => {
    if (!property.inspection_pieces?.floors) {
      return { bedrooms: 0, bathrooms: 0, powderRooms: 0, totalRooms: 0 }
    }

    let bedrooms = 0
    let bathrooms = 0
    let powderRooms = 0
    let totalRooms = 0

    // Room types to EXCLUDE from total count
    const excludedRoomTypes = ['salle_bain', 'salle_eau', 'vestibule', 'solarium']

    // Helper function to check if a room has been filled (has any data besides type)
    const isRoomCompleted = (roomData: any): boolean => {
      if (!roomData) return false

      // Check if room has any fields filled besides 'type' and 'customValues'
      const filledFields = Object.entries(roomData).filter(([key, value]) => {
        if (key === 'type' || key === 'customValues' || key === 'completedAt') return false

        // Check if value is not empty
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== null && value !== undefined && value !== ''
      })

      return filledFields.length > 0
    }

    Object.entries(property.inspection_pieces.floors).forEach(([floorId, floor]) => {
      // Exclude basement (sous_sol) from bedroom and total room counts
      const isBasement = floorId === 'sous_sol' || floor.name?.toLowerCase().includes('sous-sol')

      Object.entries(floor.rooms || {}).forEach(([_, roomData]: [string, any]) => {
        // Only count rooms that have been completed/filled
        if (!isRoomCompleted(roomData)) return

        const roomType = roomData.type

        // Count bedrooms (excluding basement)
        if (roomType === 'chambre' && !isBasement) {
          bedrooms++
        }

        // Count bathrooms (including basement)
        if (roomType === 'salle_bain') {
          bathrooms++
        }

        // Count powder rooms (including basement)
        if (roomType === 'salle_eau') {
          powderRooms++
        }

        // Count total rooms (excluding basement and excluded room types)
        if (!isBasement && !excludedRoomTypes.includes(roomType)) {
          totalRooms++
        }
      })
    })

    return { bedrooms, bathrooms, powderRooms, totalRooms }
  }

  const roomCounts = calculateRoomCounts()
  const hasInspectionData = property.inspection_pieces?.floors && Object.keys(property.inspection_pieces.floors).length > 0

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Vendu':
        return 'success'
      case 'Actif':
        return 'warning'
      case 'Retiré':
        return 'default'
      case 'Conditionnel':
        return 'warning'
      case 'Expiré':
        return 'error'
      default:
        return 'default'
    }
  }

  const calculateTotalArea = (floors: typeof property.floor_areas) => {
    if (!floors || floors.length === 0) return { hors_sol: 0, sous_sol: 0 }

    return floors.reduce(
      (acc, floor) => {
        if (floor.type === 'hors-sol') {
          acc.hors_sol += floor.area_m2
        } else {
          acc.sous_sol += floor.area_m2
        }
        return acc
      },
      { hors_sol: 0, sous_sol: 0 }
    )
  }

  const totals = calculateTotalArea(property.floor_areas)

  // Get appropriate inspection button text
  const getInspectionButtonText = () => {
    if (inspectionProgress === 0) {
      return t('startInspection')
    } else if (inspectionProgress === 100) {
      return t('viewInspection')
    } else {
      return t('continueInspection', { percent: inspectionProgress })
    }
  }

  // Format lot number as # ### ###
  const formatLotNumber = (lotNumber: string | null | undefined): string => {
    if (!lotNumber) return 'N/A'

    // Remove any non-digit characters
    const digits = lotNumber.replace(/\D/g, '')

    // Format as # ### ###
    if (digits.length === 7) {
      return `${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)}`
    }

    // Return original if not 7 digits
    return lotNumber
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          py: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Home sx={{ fontSize: 32 }} />
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.adresse}, ${property.ville || ''}, ${property.code_postal || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {property.adresse}
                </Typography>
                <IconButton
                  size="small"
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.adresse}, ${property.ville || ''}, ${property.code_postal || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                >
                  <Map fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.7, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                {[property.ville, property.municipalite].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {/* Navigation buttons */}
            <IconButton
              onClick={() => onNavigate?.('prev')}
              disabled={!canNavigatePrev}
              sx={{
                color: 'white',
                '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              onClick={() => onNavigate?.('next')}
              disabled={!canNavigateNext}
              sx={{
                color: 'white',
                '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              <NavigateNext />
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />

            {property.status && (
              <Chip
                label={property.status}
                sx={{
                  bgcolor: getStatusColor(property.status) === 'success' ? theme.palette.success.main :
                           getStatusColor(property.status) === 'error' ? theme.palette.error.main :
                           getStatusColor(property.status) === 'warning' ? '#FFC107' :
                           theme.palette.info.main,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  height: '36px',
                  px: 2
                }}
              />
            )}

            <IconButton onClick={onClose} sx={{ color: 'white', ml: 1 }}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
        {/* Quick Actions Bar */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'grey.50',
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <Button
            variant="contained"
            startIcon={<InspectionIcon />}
            onClick={() => {
              router.push(`/${locale}/inspection/${property.id}`)
              onClose()
            }}
            sx={{
              borderRadius: '12px',
              bgcolor: '#16a34a',
              minHeight: '48px',
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 2,
              '&:hover': {
                bgcolor: '#15803d',
                boxShadow: 4
              }
            }}
          >
            {getInspectionButtonText()}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => {
              router.push(`/${locale}/evaluations/create?propertyId=${property.id}`)
              onClose()
            }}
            sx={{
              borderRadius: '12px',
              minHeight: '48px',
              px: 3,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                bgcolor: alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            {t('newAppraisal')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Balance />}
            onClick={() => {
              router.push(`/${locale}/adjustments?propertyId=${property.id}`)
              onClose()
            }}
            sx={{
              borderRadius: '12px',
              minHeight: '48px',
              px: 3,
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: theme.palette.secondary.dark,
                bgcolor: alpha(theme.palette.secondary.main, 0.08)
              }
            }}
          >
            {t('adjustments')}
          </Button>
        </Box>

        {/* Two-column layout: Price Banner + Google Maps */}
        <Box sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          background: `linear-gradient(135deg, ${theme.palette.success.main}20 0%, ${theme.palette.success.main}10 100%)`
        }}>
          {/* Left Column - Price Banner */}
          <Box
            sx={{
              p: 2.5,
              flex: '0 0 50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2
            }}
          >
            {/* Line 1: Sale Price and Sale Date */}
            <Box display="flex" alignItems="center" gap={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoney sx={{ color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {property.status === 'Sujet' ? t('evaluationValue') : t('salePrice')}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {property.prix_vente ? formatCurrency(property.prix_vente) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {property.status === 'Sujet' ? t('effectiveDate') : t('saleDate')}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {property.date_vente ? formatDate(property.date_vente) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Line 2: Superficie habitable */}
            <Box display="flex" alignItems="center" gap={1}>
              <Straighten sx={{ color: theme.palette.info.main }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {t('livingArea')}
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {property.superficie_habitable_m2 ?
                    formatMeasurement(property.superficie_habitable_m2, 'area', 'm2')
                    : 'N/A'
                  }
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Column - Google Maps */}
          <Box
            sx={{
              flex: '0 0 50%',
              height: 160,
              pr: 3,
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDADvWmeRywpjT0oP_Fa8WrxV0Lnt-bEaw&q=${encodeURIComponent(`${property.adresse}, ${property.ville || ''}, ${property.code_postal || ''}`)}`}
            />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Section 1 */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="primary">
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('generalInformation')}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3, bgcolor: 'rgba(33, 150, 243, 0.03)' }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={1.5}>
                    <Typography variant="body2" color="text.secondary">{t('idNo')}</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#1565C0' }}>
                      {property.property_id_no || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3.5}>
                    <Typography variant="body2" color="text.secondary">{t('address')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.adresse}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('city')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.ville || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('district')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.municipalite || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={1.75}>
                    <Typography variant="body2" color="text.secondary">{t('postalCode')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.code_postal || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={0.75}>
                    <Typography variant="body2" color="text.secondary">{t('province')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.province || 'N/A'}</Typography>
                  </Grid>

                  {/* Conditional fields based on status */}
                  {property.status === 'Sujet' ? (
                    <>
                      {/* Line 2: 7 columns */}
                      <Grid item xs={12} md={1.5}>
                        <Typography variant="body2" color="text.secondary">{t('evaluationValue')}</Typography>
                        <Typography variant="body1" fontWeight={700} fontSize="1.1rem">
                          {property.prix_vente ? formatCurrency(property.prix_vente) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('effectiveDate')}</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {property.date_vente ? formatDate(property.date_vente) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={1.5}>
                        <Typography variant="body2" color="text.secondary">{t('status')}</Typography>
                        <Chip
                          label={property.status || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('evaluationType')}</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>{property.type_evaluation || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={1.75}>
                        <Typography variant="body2" color="text.secondary">{t('constructionYear')}</Typography>
                        <Chip
                          label={property.annee_construction || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: '#FF9800',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1.75}>
                        <Typography variant="body2" color="text.secondary">{t('zoning')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.zonage || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <Typography variant="body2" color="text.secondary">{t('occupancy')}</Typography>
                        <Chip
                          label={property.occupancy || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: property.occupancy === 'Locataire' ? '#4CAF50' : '#1976D2',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Grid>

                      {/* Line 3: 12 columns total to match line 2 */}
                      <Grid item xs={12} md={1.5}>
                        <Typography variant="body2" color="text.secondary">{t('propertyType')}</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>{property.type_propriete || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('propertyGenre')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.genre_propriete || 'N/A'}</Typography>
                      </Grid>
                      {property.occupancy === 'Locataire' && (
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" color="text.secondary">{t('currentRent')}</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {property.loyer_en_place ? formatCurrency(property.loyer_en_place) : 'N/A'}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Line 2: 7 columns */}
                      <Grid item xs={12} md={1.5}>
                        <Typography variant="body2" color="text.secondary">{t('salePrice')}</Typography>
                        <Typography variant="body1" fontWeight={700} fontSize="1.1rem">
                          {property.prix_vente ? formatCurrency(property.prix_vente) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('askingPrice')}</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {property.prix_demande ? formatCurrency(property.prix_demande) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={1.5}>
                        <Typography variant="body2" color="text.secondary">{t('saleDate')}</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {property.date_vente ? formatDate(property.date_vente) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('daysOnMarket')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.jours_sur_marche || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('status')}</Typography>
                        <Chip
                          label={property.status || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: property.status === 'Vendu' ? theme.palette.success.main :
                                     property.status === 'Actif' ? '#FFC107' :
                                     theme.palette.primary.main,
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1.75}>
                        <Typography variant="body2" color="text.secondary">{t('constructionYear')}</Typography>
                        <Chip
                          label={property.annee_construction || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: '#FF9800',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <Typography variant="body2" color="text.secondary">{t('zoning')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.zonage || 'N/A'}</Typography>
                      </Grid>

                      {/* Line 3: 12 columns total to match line 2 */}
                      {(property.status === 'Vendu' || property.status === 'Actif') && !(property.type_propriete === 'Duplex' || property.type_propriete === 'Triplex' || property.type_propriete === 'Quadriplex+') && (
                        <Grid item xs={12} md={1.5}>
                          <Typography variant="body2" color="text.secondary">{t('occupancy')}</Typography>
                          <Chip
                            label={property.occupancy || 'N/A'}
                            size="small"
                            sx={{
                              bgcolor: property.occupancy === 'Locataire' ? '#4CAF50' : '#1976D2',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">{t('propertyType')}</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>{property.type_propriete || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={1.5}>
                        <Typography variant="body2" color="text.secondary">{t('propertyGenre')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.genre_propriete || 'N/A'}</Typography>
                      </Grid>
                      {(property.status === 'Vendu' || property.status === 'Actif') && property.occupancy === 'Locataire' && (
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" color="text.secondary">{t('currentRent')}</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {property.loyer_en_place ? formatCurrency(property.loyer_en_place) : 'N/A'}
                          </Typography>
                        </Grid>
                      )}
                      {/* MLS# field - always visible for all property types */}
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">#MLS</Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: property.numero_mls ? 'pointer' : 'default',
                            '&:hover': property.numero_mls ? {
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              px: 0.5,
                              ml: -0.5
                            } : {}
                          }}
                          onClick={() => {
                            if (property.numero_mls) {
                              navigator.clipboard.writeText(property.numero_mls)
                            }
                          }}
                          title={property.numero_mls ? "Click to copy" : undefined}
                        >
                          <Typography
                            variant="body1"
                            fontFamily="monospace"
                            fontWeight={700}
                          >
                            {property.numero_mls || 'N/A'}
                          </Typography>
                          {property.numero_mls && <ContentCopy sx={{ fontSize: 16, color: 'action.active' }} />}
                        </Box>
                      </Grid>
                      {property.type_propriete === 'Condo' && (
                        <>
                          <Grid item xs={12} md={2}>
                            <Typography variant="body2" color="text.secondary">{t('condoFees')}</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {property.frais_condo ? formatCurrency(property.frais_condo) : 'N/A'}
                            </Typography>
                          </Grid>
                          {property.floor_number != null && (
                            <Grid item xs={12} md={1.75}>
                              <Typography variant="body2" color="text.secondary">{t('floorNumber')}</Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {property.floor_number}
                              </Typography>
                            </Grid>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Conditional fields for multi-unit properties */}
                  {(property.type_propriete === 'Duplex' || property.type_propriete === 'Triplex' || property.type_propriete === 'Quadriplex+') && property.unit_rents && property.unit_rents.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          {t('unitRents')}
                        </Typography>
                        <Grid container spacing={2}>
                          {property.unit_rents.map((unit, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {unit.unitNumber}
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {unit.isOwnerOccupied ? t('ownerOccupied') : formatCurrency(unit.monthlyRent || 0)}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 2 - Superficies */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.info.main}25 0%, ${theme.palette.info.main}15 100%)`,
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" fontWeight={700} color="info.main">
                  <Layers sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('areas')}
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, bgcolor: 'rgba(33, 150, 243, 0.04)' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">{t('lotArea')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.superficie_terrain_m2 ? (
                        <>
                          {property.superficie_terrain_m2.toFixed(2)} m² / <span style={{ color: '#4CAF50' }}>{(property.superficie_terrain_m2 * 10.764).toFixed(0)} pi²</span>
                        </>
                      ) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Typography variant="body2" color="text.secondary">{t('frontageDepth')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.frontage_m2 && property.profondeur_m2 ? (
                        <>
                          {property.frontage_m2.toFixed(2)} m / <span style={{ color: '#4CAF50' }}>{(property.frontage_m2 * 3.281).toFixed(1)} pi</span>
                          {' x '}
                          {property.profondeur_m2.toFixed(2)} m / <span style={{ color: '#4CAF50' }}>{(property.profondeur_m2 * 3.281).toFixed(1)} pi</span>
                        </>
                      ) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">{t('buildingPerimeter')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.perimetre_batiment_m2 ? (
                        <>
                          {property.perimetre_batiment_m2.toFixed(2)} m / <span style={{ color: '#4CAF50' }}>{(property.perimetre_batiment_m2 * 3.281).toFixed(1)} pi</span>
                        </>
                      ) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>

                {property.floor_areas && property.floor_areas.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      {t('areaByFloor')}
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableCell sx={{ fontWeight: 600 }}>{t('floor')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('areaM2')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('areaPi2')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('type')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...property.floor_areas]
                            .sort((a, b) => {
                              // Define floor order
                              const floorOrder: { [key: string]: number } = {
                                'Sous-sol': 0,
                                'Rez-de-chaussée': 1,
                                '2e étage': 2,
                                '3e étage': 3,
                                'Comble': 4,
                                'Mezzanine': 5
                              }
                              const orderA = floorOrder[a.floor] ?? 99
                              const orderB = floorOrder[b.floor] ?? 99
                              return orderA - orderB
                            })
                            .map((floor) => (
                            <TableRow key={floor.id}>
                              <TableCell>{floor.floor}</TableCell>
                              <TableCell>{floor.area_m2.toFixed(2)}</TableCell>
                              <TableCell>{floor.area_ft2.toFixed(2)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={floor.type}
                                  size="small"
                                  sx={{
                                    bgcolor: floor.type === 'hors-sol' ? '#4CAF50' : '#424242',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box mt={2} sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.08)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                      <Typography variant="subtitle1" sx={{ color: '#1976D2', mb: 1, fontWeight: 900, fontSize: '1.1rem' }}>
                        {t('totalLivingArea')}: {totals.hors_sol.toFixed(2)} m² / <span style={{ color: '#4CAF50', fontWeight: 900 }}>{(totals.hors_sol * 10.764).toFixed(0)} pi²</span>
                      </Typography>
                      {totals.sous_sol > 0 && (
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1976D2' }}>
                          {t('totalBasementArea')}: {totals.sous_sol.toFixed(2)} m² / <span style={{ color: '#4CAF50' }}>{(totals.sous_sol * 10.764).toFixed(0)} pi²</span>
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Caractéristiques du bâtiment */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main}25 0%, ${theme.palette.success.main}15 100%)`,
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" fontWeight={700} color="success.main">
                  <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('buildingCharacteristics')}
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, bgcolor: 'rgba(76, 175, 80, 0.04)' }}>
                <Grid container spacing={2}>
                  {/* Line 1 - Conditional based on property type */}
                  {property.type_propriete === 'Condo' ? (
                    <>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('buildingType')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.type_batiment || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('location')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.localisation || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('condoType')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.type_copropriete || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('chronoAge')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.chrono_age || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('effAge')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.eff_age || 'N/A'}</Typography>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('buildingType')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.type_batiment || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <Typography variant="body2" color="text.secondary">{t('chronoAge')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.chrono_age || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={7.2}>
                        <Typography variant="body2" color="text.secondary">{t('effAge')}</Typography>
                        <Typography variant="body1" fontWeight={600}>{property.eff_age || 'N/A'}</Typography>
                      </Grid>
                    </>
                  )}

                  {/* Line 2 - Room counts (4 columns) */}
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('roomCount')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {hasInspectionData ? roomCounts.totalRooms : (property.nombre_pieces || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('bedroomCount')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {hasInspectionData ? roomCounts.bedrooms : (property.nombre_chambres || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('bathroomCount')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {hasInspectionData ? roomCounts.bathrooms : (property.salle_bain || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4.8}>
                    <Typography variant="body2" color="text.secondary">{t('powderRoomCount')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {hasInspectionData ? roomCounts.powderRooms : (property.salle_eau || 'N/A')}
                    </Typography>
                  </Grid>

                  {/* Line 3 - Building details (5 columns) */}
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('parking')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.stationnement || 'N/A'}
                      {property.nombre_stationnement ? ` (${property.nombre_stationnement})` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('garageType')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.type_garage || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('garageDimension')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {(() => {
                        // Try to get dimensions from inspection data first
                        const largeurFeet = property.inspection_garage?.largeur_feet
                        const longueurFeet = property.inspection_garage?.longueur_feet
                        const largeurMeters = property.inspection_garage?.largeur_meters
                        const longueurMeters = property.inspection_garage?.longueur_meters

                        if (largeurFeet && longueurFeet && largeurMeters && longueurMeters) {
                          const areaFeet = (parseFloat(largeurFeet) * parseFloat(longueurFeet)).toFixed(0)
                          const areaMeters = (parseFloat(largeurMeters) * parseFloat(longueurMeters)).toFixed(0)
                          return `${areaFeet} pi² (${areaMeters} m²)`
                        }

                        // Fallback to property field
                        return property.dimension_garage || 'N/A'
                      })()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('basementType')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.type_sous_sol || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2.4}>
                    <Typography variant="body2" color="text.secondary">{t('roofing')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {(() => {
                        // Try to get roof type from inspection batiment data
                        const toitureFromInspection = property.inspection_batiment?.fondation_mur_toiture?.type_toiture

                        if (toitureFromInspection) {
                          // If it's an array (multiselect), join with comma
                          if (Array.isArray(toitureFromInspection)) {
                            return toitureFromInspection.join(', ')
                          }
                          return toitureFromInspection
                        }

                        // Fallback to property field
                        return property.toiture || 'N/A'
                      })()}
                    </Typography>
                  </Grid>

                  {/* Line 4 - Extras (conditional) */}
                  {property.extras && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">{t('extras')}</Typography>
                      <Typography variant="body1" fontWeight={600}>{property.extras}</Typography>
                    </Grid>
                  )}

                  {/* Line 5 - Améliorations hors sol (conditional) */}
                  {property.ameliorations_hors_sol && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">{t('aboveGroundImprovements')}</Typography>
                      <Typography variant="body1" fontWeight={600}>{property.ameliorations_hors_sol}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Données municipales */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}05 100%)`,
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" fontWeight={700} color="warning.main">
                  <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('municipalData')}
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, bgcolor: 'rgba(255, 152, 0, 0.03)' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">{t('lotNumber')}</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1565C0' }}>{formatLotNumber(property.lot_number)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">{t('matricule')}</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1565C0' }}>{property.matricule || 'N/A'}</Typography>
                  </Grid>
                  {property.additional_lots && property.additional_lots.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('additionalLots')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {property.additional_lots.map((lot, index) => (
                          <Box key={index} sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ color: '#1565C0' }}>
                              {lot.unit_number && <><strong>{t('unit')}:</strong> {lot.unit_number} • </>}
                              <strong>{t('lot')}:</strong> {formatLotNumber(lot.lot_number)} • <strong>{t('lotType')}:</strong> {lot.type_lot}
                              {lot.matricule && <> • <strong>{t('matricule')}:</strong> {lot.matricule}</>}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, mb: 1 }}>
                      {t('municipalEvaluation')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('date')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.eval_municipale_annee || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('land')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.eval_municipale_terrain ? formatCurrency(property.eval_municipale_terrain) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('building')}</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.eval_municipale_batiment ? formatCurrency(property.eval_municipale_batiment) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('total')}</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#4CAF50' }}>
                      {property.eval_municipale_total ? formatCurrency(property.eval_municipale_total) : 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t('municipalTaxes')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('year')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.taxes_municipales_annee || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('amount')}</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#4CAF50' }}>
                      {property.taxes_municipales_montant ? formatCurrency(property.taxes_municipales_montant) : 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t('schoolTaxes')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('year')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.taxes_scolaires_annee || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">{t('amount')}</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#4CAF50' }}>
                      {property.taxes_scolaires_montant ? formatCurrency(property.taxes_scolaires_montant) : 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">{t('livingArea')}</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1565C0' }}>
                      {property.aire_habitable_m2
                        ? formatMeasurement(property.aire_habitable_m2, 'area', 'm2')
                        : property.aire_habitable_pi2
                        ? formatMeasurement(property.aire_habitable_pi2, 'area', 'pi2')
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">{t('zoningPermittedUses')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{property.zoning_usages_permis || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Inspection Section - Show for ALL properties */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                overflow: 'visible'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InspectionIcon sx={{ color: 'white', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {t('inspection')}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      isInspectionComplete ? t('completed') :
                      property.inspection_status === 'in_progress' ? t('inProgress') :
                      t('notStarted')
                    }
                    sx={{
                      backgroundColor:
                        isInspectionComplete ? '#4CAF50' :
                        property.inspection_status === 'in_progress' ? '#FF9800' :
                        '#9E9E9E',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {t('overallProgress')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {inspectionProgress}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${inspectionProgress}%`,
                          height: '100%',
                          backgroundColor: isInspectionComplete ? '#4CAF50' : 'white',
                          borderRadius: 4,
                          transition: 'width 0.3s ease, background-color 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {/* Inspection Date */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {t('inspectionDate')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                          {property.inspection_date ? new Date(property.inspection_date).toLocaleDateString('fr-CA') : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Room Count */}
                    {property.inspection_pieces && (
                      <>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              {t('roomsInspected')}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {property.inspection_pieces.completedRooms || 0} / {property.inspection_pieces.totalRooms || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              {t('floors')}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {Object.keys(property.inspection_pieces.floors || {}).length}
                            </Typography>
                          </Box>
                        </Grid>
                      </>
                    )}
                  </Grid>

                  {/* Completed Categories */}
                  {completedCategories.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, display: 'block' }}>
                        {t('completedCategories')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {completedCategories.map((categoryId) => (
                          <Chip
                            key={categoryId}
                            icon={<CheckCircle sx={{ fontSize: 16 }} />}
                            label={t(getCategoryTranslationKey(categoryId))}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              color: '#667eea',
                              fontWeight: 600
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Floor Summary */}
                  {property.inspection_pieces && Object.keys(property.inspection_pieces.floors || {}).length > 0 && (
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, display: 'block' }}>
                        {t('floorDetails')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.entries(property.inspection_pieces.floors).map(([floorId, floor]) => {
                          // Get completed rooms and their types
                          const completedRooms = Object.values(floor.rooms || {}).filter(
                            (room: any) => room.completedAt
                          )

                          // Get room type names with numbering for duplicates
                          const roomTypeCounts: Record<string, number> = {}
                          const roomNames = completedRooms.map((room: any) => {
                            const roomType = room.type
                            // Convert snake_case to camelCase for translation key
                            const camelCaseType = roomType.replace(/_([a-z])/g, (match: string, letter: string) => letter.toUpperCase())
                            const translationKey = `inspection.rooms.${camelCaseType}`
                            let roomName = t(translationKey)

                            // Count occurrences for numbering
                            roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1
                            if (roomTypeCounts[roomType] > 1) {
                              roomName = `${roomName} #${roomTypeCounts[roomType]}`
                            }

                            return roomName
                          })

                          return (
                            <Box
                              key={floorId}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: 'rgba(255,255,255,0.1)'
                              }}
                            >
                              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                {floor.name}
                              </Typography>
                              {roomNames.length > 0 ? (
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  {roomNames.join(', ')}
                                </Typography>
                              ) : (
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                                  {t('noRoomsInspected')}
                                </Typography>
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    onClick={() => {
                      onClose()
                      router.push(`/${locale}/inspection/${property.id}/categories`)
                    }}
                    fullWidth
                    sx={{
                      mt: 2,
                      backgroundColor: 'white',
                      color: '#667eea',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    {getInspectionButtonText()}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
        </Grid>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: '#f8fafc'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            {t('navigationHint')}
          </Typography>
        </Box>

        <Button onClick={onClose} sx={{ mr: 1 }}>
          {tCommon('close')}
        </Button>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="contained"
            startIcon={<Edit />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              }
            }}
          >
            {tCommon('edit')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}