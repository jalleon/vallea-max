'use client'

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
  CheckCircle
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
  const t = useTranslations()

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

    Object.entries(property.inspection_pieces.floors).forEach(([floorId, floorData]: [string, any]) => {
      const isBasement = floorData.type === 'basement'

      Object.entries(floorData.rooms || {}).forEach(([roomId, roomData]: [string, any]) => {
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

  const getInspectionButtonText = () => {
    if (isInspectionComplete) {
      return 'Voir inspection'
    }
    if (!property.inspection_status || property.inspection_status === 'not_started') {
      return 'Commencer l\'inspection'
    }
    return 'Continuer l\'inspection'
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Vendu':
        return 'success'
      case 'Actif':
        return 'primary'
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
              <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                {property.adresse}
              </Typography>
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
                           getStatusColor(property.status) === 'warning' ? theme.palette.warning.main :
                           theme.palette.info.main,
                  color: 'white',
                  fontWeight: 600
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
        {/* Price Banner */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.main}20 0%, ${theme.palette.success.main}10 100%)`,
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoney sx={{ color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Prix de vente</Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {property.prix_vente ? formatCurrency(property.prix_vente) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Date de vente</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {property.date_vente ? formatDate(property.date_vente) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Straighten sx={{ color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Superficie habitable</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {property.superficie_habitable_m2 ?
                      formatMeasurement(property.superficie_habitable_m2, 'area', 'm2')
                      : 'N/A'
                    }
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
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
                    Informations générales
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">ID No</Typography>
                    <Typography variant="body1" fontWeight={600} color="primary">
                      {property.property_id_no || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Typography variant="body2" color="text.secondary">Adresse</Typography>
                    <Typography variant="body1">{property.adresse}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Ville, arrondissement</Typography>
                    <Typography variant="body1">
                      {[property.ville, property.municipalite].filter(Boolean).join(', ') || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Code postal, province</Typography>
                    <Typography variant="body1">
                      {[property.code_postal, property.province].filter(Boolean).join(', ') || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Prix de vente, prix demandé</Typography>
                    <Typography variant="body1">
                      {property.prix_vente ? formatCurrency(property.prix_vente) : 'N/A'}
                      {property.prix_demande && property.prix_demande !== property.prix_vente &&
                        ` (Demandé: ${formatCurrency(property.prix_demande)})`
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Date de vente</Typography>
                    <Typography variant="body1">
                      {property.date_vente ? formatDate(property.date_vente) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary"># jours sur le marché</Typography>
                    <Typography variant="body1">{property.jours_sur_marche || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Statut</Typography>
                    <Typography variant="body1">{property.status || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Type de propriété</Typography>
                    <Typography variant="body1">{property.type_propriete || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Genre de propriété</Typography>
                    <Typography variant="body1">{property.genre_propriete || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Année de construction</Typography>
                    <Typography variant="body1">{property.annee_construction || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Zonage</Typography>
                    <Typography variant="body1">{property.zonage || 'N/A'}</Typography>
                  </Grid>
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
                  background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" fontWeight={700} color="info.main">
                  <Layers sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Superficies
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Superficie de terrain</Typography>
                    <Typography variant="body1">
                      {property.superficie_terrain_m2 ?
                        formatMeasurement(property.superficie_terrain_m2, 'area', 'm2')
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Frontage / Profondeur</Typography>
                    <Typography variant="body1">
                      {property.frontage_m2 && property.profondeur_m2 ?
                        `${formatMeasurement(property.frontage_m2, 'length', 'm')} x ${formatMeasurement(property.profondeur_m2, 'length', 'm')}`
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Périmètre du bâtiment</Typography>
                    <Typography variant="body1">
                      {property.perimetre_batiment_m2 ?
                        formatMeasurement(property.perimetre_batiment_m2, 'length', 'm')
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                </Grid>

                {property.floor_areas && property.floor_areas.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Superficie par étage
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
                            <TableCell sx={{ fontWeight: 600 }}>Étage</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Superficie (m²)</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Superficie (pi²)</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {property.floor_areas.map((floor) => (
                            <TableRow key={floor.id}>
                              <TableCell>{floor.floor}</TableCell>
                              <TableCell>{floor.area_m2.toFixed(2)}</TableCell>
                              <TableCell>{floor.area_ft2.toFixed(2)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={floor.type}
                                  size="small"
                                  color={floor.type === 'hors-sol' ? 'primary' : 'default'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box mt={2}>
                      <Typography variant="subtitle2">
                        Total superficie habitable (hors-sol): {totals.hors_sol.toFixed(2)} m² / {(totals.hors_sol * 10.764).toFixed(0)} pi²
                      </Typography>
                      {totals.sous_sol > 0 && (
                        <Typography variant="subtitle2">
                          Total superficie sous-sol: {totals.sous_sol.toFixed(2)} m² / {(totals.sous_sol * 10.764).toFixed(0)} pi²
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Section 3 */}
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
                  <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Détails de la propriété
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Nombre de pièces</Typography>
                    <Typography variant="body1">
                      {hasInspectionData ? roomCounts.totalRooms : (property.nombre_pieces || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Nombre de chambres</Typography>
                    <Typography variant="body1">
                      {hasInspectionData ? roomCounts.bedrooms : (property.nombre_chambres || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Salle de bain</Typography>
                    <Typography variant="body1">
                      {hasInspectionData ? roomCounts.bathrooms : (property.salle_bain || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Salle d'eau</Typography>
                    <Typography variant="body1">
                      {hasInspectionData ? roomCounts.powderRooms : (property.salle_eau || 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Stationnement</Typography>
                    <Typography variant="body1">{property.stationnement || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Dimension garage</Typography>
                    <Typography variant="body1">{property.dimension_garage || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Type de sous-sol</Typography>
                    <Typography variant="body1">{property.type_sous_sol || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Toiture</Typography>
                    <Typography variant="body1">{property.toiture || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Améliorations hors sol</Typography>
                    <Typography variant="body1">{property.ameliorations_hors_sol || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Numéro MLS</Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {property.numero_mls || 'N/A'}
                    </Typography>
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
                      Inspection
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      isInspectionComplete ? 'Complété' :
                      property.inspection_status === 'in_progress' ? 'En cours' :
                      'Non commencé'
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
                        Progrès global
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
                          Date d'inspection
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
                              Pièces inspectées
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {property.inspection_pieces.completedRooms || 0} / {property.inspection_pieces.totalRooms || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Étages
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
                        Catégories complétées
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
                        Détails par étage
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
                                  Aucune pièce inspectée
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
            Utilisez ← → pour naviguer entre les propriétés
          </Typography>
        </Box>

        <Button onClick={onClose} sx={{ mr: 1 }}>
          Fermer
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
            Modifier
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}