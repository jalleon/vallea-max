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
  Layers
} from '@mui/icons-material'
import { Property } from '../types/property.types'
import { formatCurrency, formatDate, formatMeasurement } from '@/lib/utils/formatting'

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
                    <Typography variant="body1">{property.nombre_pieces || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Nombre de chambres</Typography>
                    <Typography variant="body1">{property.nombre_chambres || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Salle de bain</Typography>
                    <Typography variant="body1">{property.salle_bain || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Salle d'eau</Typography>
                    <Typography variant="body1">{property.salle_eau || 'N/A'}</Typography>
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