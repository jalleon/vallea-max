'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  Add,
  CheckCircle,
  ArrowBack,
  NavigateNext,
  Kitchen,
  RestaurantMenu,
  Chair,
  Bed,
  WorkOutline,
  Weekend,
  Bathtub,
  Shower,
  Weekend as SalleFamiliale,
  LocalLaundryService,
  Inventory,
  Settings,
  OpenInNew
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property, InspectionPieces, FloorInspection } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { FLOOR_OPTIONS, ROOM_CONFIG } from '@/features/inspection/constants/room.constants'

const BASE_ROOM_TYPES = ['cuisine', 'salle_a_manger', 'salon', 'chambre', 'bureau', 'salle_sejour', 'salle_bain', 'salle_eau']
const BASEMENT_ROOM_TYPES = ['salle_familiale', 'salle_sejour', 'chambre', 'bureau', 'buanderie', 'rangement', 'salle_mecanique', 'salle_bain', 'salle_eau']
const ROOM_ICONS: Record<string, any> = {
  cuisine: Kitchen,
  salle_a_manger: RestaurantMenu,
  salon: Chair,
  chambre: Bed,
  bureau: WorkOutline,
  salle_sejour: Weekend,
  salle_bain: Bathtub,
  salle_eau: Shower,
  salle_familiale: SalleFamiliale,
  buanderie: LocalLaundryService,
  rangement: Inventory,
  salle_mecanique: Settings
}
const ADDITIONAL_ROOM_TYPES = ['chambre', 'salle_bain', 'salle_eau', 'autre']

export default function PiecesPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false)
  const [newRoomType, setNewRoomType] = useState('chambre')

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const prop = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(prop)

      // Check if there's a floor query parameter
      const floorParam = searchParams.get('floor')

      // Initialize inspection_pieces if not exists or default to RDC floor
      if (!prop.inspection_pieces || !prop.inspection_pieces.floors) {
        const initialData: InspectionPieces = {
          floors: {},
          totalRooms: 0,
          completedRooms: 0
        }
        await updateInspectionPieces(initialData)
        // Create RDC floor and set as selected
        await handleAddPredefinedFloor('rdc', 'R.D.C.')
      } else if (!selectedFloor) {
        // If there's a floor parameter and it exists, select it
        if (floorParam && prop.inspection_pieces.floors[floorParam]) {
          setSelectedFloor(floorParam)
        } else if (prop.inspection_pieces.floors['rdc']) {
          // Otherwise default to RDC if it exists
          setSelectedFloor('rdc')
        } else {
          // Otherwise select first available floor
          const firstFloor = Object.keys(prop.inspection_pieces.floors)[0]
          if (firstFloor) setSelectedFloor(firstFloor)
        }
      }
    } catch (err) {
      console.error('Error loading property:', err)
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const updateInspectionPieces = async (data: InspectionPieces) => {
    try {
      setSaving(true)
      await propertiesSupabaseService.updateProperty(propertyId, {
        inspection_pieces: data
      })

      // Reload property to get updated data
      const updatedProp = await propertiesSupabaseService.getProperty(propertyId)
      setProperty(updatedProp)
    } catch (err) {
      console.error('Error updating inspection pieces:', err)
      setError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const getFloors = () => {
    if (!property?.inspection_pieces?.floors) return []
    return Object.keys(property.inspection_pieces.floors).map(floorId => ({
      id: floorId,
      name: property.inspection_pieces!.floors[floorId].name
    }))
  }

  const getRoomsForFloor = (floorId: string) => {
    if (!property?.inspection_pieces?.floors?.[floorId]) return []
    const floor = property.inspection_pieces.floors[floorId]
    return Object.keys(floor.rooms || {}).map(roomId => ({
      id: roomId,
      type: floor.rooms[roomId].type,
      data: floor.rooms[roomId]
    }))
  }

  const isRoomCompleted = (floorId: string, roomId: string) => {
    const room = property?.inspection_pieces?.floors?.[floorId]?.rooms?.[roomId]
    return room?.completedAt !== undefined
  }

  const handleAddNextFloor = async () => {
    if (!property) return

    const currentData = property.inspection_pieces || { floors: {}, totalRooms: 0, completedRooms: 0 }

    // Determine next floor number
    let nextFloorNumber = 4
    while (currentData.floors[`floor_${nextFloorNumber}`]) {
      nextFloorNumber++
    }

    const floorId = `floor_${nextFloorNumber}`
    const floorName = `${nextFloorNumber}e`

    const newFloor: FloorInspection = {
      name: floorName,
      rooms: {}
    }

    // Initialize base room types for the new floor
    BASE_ROOM_TYPES.forEach(roomType => {
      const roomId = `${roomType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      newFloor.rooms[roomId] = {
        type: roomType
      }
    })

    const updatedData: InspectionPieces = {
      ...currentData,
      floors: {
        ...currentData.floors,
        [floorId]: newFloor
      },
      totalRooms: currentData.totalRooms + BASE_ROOM_TYPES.length
    }

    await updateInspectionPieces(updatedData)
    setSelectedFloor(floorId)
  }

  const handleAddPredefinedFloor = async (floorValue: string, floorName: string) => {
    if (!property) return

    const currentData = property.inspection_pieces || { floors: {}, totalRooms: 0, completedRooms: 0 }

    // Check if floor already exists
    if (currentData.floors[floorValue]) {
      // If it's basement and has wrong room types, recreate it
      if (floorValue === 'sous_sol') {
        const existingRooms = Object.values(currentData.floors[floorValue].rooms || {})
        const hasOldRoomTypes = existingRooms.some(room =>
          room.type === 'cuisine' || room.type === 'salle_a_manger' || room.type === 'salon'
        )

        if (hasOldRoomTypes) {
          // Delete and recreate basement with correct room types
          const oldRoomCount = Object.keys(currentData.floors[floorValue].rooms || {}).length

          const newFloor: FloorInspection = {
            name: floorName,
            rooms: {}
          }

          BASEMENT_ROOM_TYPES.forEach(roomType => {
            const roomId = `${roomType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            newFloor.rooms[roomId] = {
              type: roomType
            }
          })

          const updatedData: InspectionPieces = {
            ...currentData,
            floors: {
              ...currentData.floors,
              [floorValue]: newFloor
            },
            totalRooms: currentData.totalRooms - oldRoomCount + BASEMENT_ROOM_TYPES.length
          }

          await updateInspectionPieces(updatedData)
          setSelectedFloor(floorValue)
          return
        }
      }

      setSelectedFloor(floorValue)
      return
    }

    const newFloor: FloorInspection = {
      name: floorName,
      rooms: {}
    }

    // Use basement room types for sous_sol, otherwise use base room types
    const roomTypes = floorValue === 'sous_sol' ? BASEMENT_ROOM_TYPES : BASE_ROOM_TYPES

    // Initialize room types
    roomTypes.forEach(roomType => {
      const roomId = `${roomType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      newFloor.rooms[roomId] = {
        type: roomType
      }
    })

    const updatedData: InspectionPieces = {
      ...currentData,
      floors: {
        ...currentData.floors,
        [floorValue]: newFloor
      },
      totalRooms: currentData.totalRooms + roomTypes.length
    }

    await updateInspectionPieces(updatedData)
    setSelectedFloor(floorValue)
  }

  const handleAddRoom = async () => {
    if (!property || !selectedFloor || !newRoomType) return

    const currentData = property.inspection_pieces || { floors: {}, totalRooms: 0, completedRooms: 0 }
    const roomId = `${newRoomType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const updatedFloor = {
      ...currentData.floors[selectedFloor],
      rooms: {
        ...currentData.floors[selectedFloor].rooms,
        [roomId]: {
          type: newRoomType
        }
      }
    }

    const updatedData: InspectionPieces = {
      ...currentData,
      floors: {
        ...currentData.floors,
        [selectedFloor]: updatedFloor
      },
      totalRooms: currentData.totalRooms + 1
    }

    await updateInspectionPieces(updatedData)
    setAddRoomDialogOpen(false)
    setNewRoomType('chambre')
  }

  const handleRoomClick = (floorId: string, roomId: string) => {
    router.push(`/${locale}/inspection/${propertyId}/pieces/${floorId}/${roomId}`)
  }

  const handleBack = () => {
    router.push(`/${locale}/inspection/${propertyId}/categories`)
  }

  const handleBreadcrumbClick = (path: string) => {
    router.push(`/${locale}${path}`)
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

  const floors = getFloors()
  const rooms = selectedFloor ? getRoomsForFloor(selectedFloor) : []

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
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick(`/inspection/${propertyId}/categories`)}
            sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('inspection.breadcrumb.categories')}
          </Link>
          <Typography color="text.primary">{t('inspection.categories.pieces')}</Typography>
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

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack} sx={{ bgcolor: 'grey.100' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight={700}>
              {t('inspection.categories.pieces')}
            </Typography>
          </Box>
        </Box>

        {/* Floor Selector */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('inspection.floors.addFloor')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            {FLOOR_OPTIONS.map((floor) => {
              const floorExists = floors.some(f => f.id === floor.value)
              const isSelected = selectedFloor === floor.value

              return (
                <Button
                  key={floor.value}
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => handleAddPredefinedFloor(floor.value, floor.displayName)}
                  sx={{
                    minWidth: 120,
                    bgcolor: isSelected ? '#4CAF50' : 'transparent',
                    borderColor: floorExists ? '#4CAF50' : 'grey.300',
                    color: isSelected ? 'white' : floorExists ? '#4CAF50' : 'text.primary',
                    '&:hover': {
                      bgcolor: isSelected ? '#45a049' : '#f0fdf4',
                      borderColor: '#4CAF50'
                    }
                  }}
                  startIcon={floorExists ? <CheckCircle /> : undefined}
                >
                  {floor.displayName}
                </Button>
              )
            })}
            {/* Additional floors (4e, 5e, etc.) */}
            {floors
              .filter(f => {
                // Only show floors that are not in FLOOR_OPTIONS
                const isPredefinedFloor = FLOOR_OPTIONS.some(opt => opt.value === f.id)
                return !isPredefinedFloor && f.id.startsWith('floor_')
              })
              .sort((a, b) => {
                const numA = parseInt(a.id.replace('floor_', ''))
                const numB = parseInt(b.id.replace('floor_', ''))
                return numA - numB
              })
              .map((floor) => {
                const isSelected = selectedFloor === floor.id

                return (
                  <Button
                    key={floor.id}
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setSelectedFloor(floor.id)}
                    sx={{
                      minWidth: 120,
                      bgcolor: isSelected ? '#4CAF50' : 'transparent',
                      borderColor: '#4CAF50',
                      color: isSelected ? 'white' : '#4CAF50',
                      '&:hover': {
                        bgcolor: isSelected ? '#45a049' : '#f0fdf4',
                        borderColor: '#4CAF50'
                      }
                    }}
                    startIcon={<CheckCircle />}
                  >
                    {floor.name}
                  </Button>
                )
              })}
            <Button
              variant="outlined"
              onClick={handleAddNextFloor}
              sx={{ minWidth: 60 }}
            >
              <Add />
            </Button>
          </Box>
        </Paper>

        {/* Rooms Grid */}
        {selectedFloor && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Pièces - {floors.find(f => f.id === selectedFloor)?.name}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setAddRoomDialogOpen(true)}
                sx={{
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  '&:hover': {
                    bgcolor: '#f0fdf4',
                    borderColor: '#4CAF50'
                  }
                }}
              >
                {t('common.add')}
              </Button>
            </Box>

            <Grid container spacing={2}>
              {rooms.sort((a, b) => {
                // Use basement room types for sous_sol, otherwise use base room types
                const roomTypesOrder = selectedFloor === 'sous_sol' ? BASEMENT_ROOM_TYPES : BASE_ROOM_TYPES
                const orderA = roomTypesOrder.indexOf(a.type)
                const orderB = roomTypesOrder.indexOf(b.type)
                if (orderA === -1 && orderB === -1) return 0
                if (orderA === -1) return 1
                if (orderB === -1) return -1
                return orderA - orderB
              }).map((room) => {
                const isCompleted = isRoomCompleted(selectedFloor, room.id)
                const roomConfig = ROOM_CONFIG[room.type]
                const RoomIcon = ROOM_ICONS[room.type]

                return (
                  <Grid item xs={12} sm={6} md={4} key={room.id}>
                    <Card
                      elevation={0}
                      sx={{
                        border: '2px solid',
                        borderColor: isCompleted ? '#4CAF50' : 'grey.300',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <CardActionArea onClick={() => handleRoomClick(selectedFloor, room.id)} sx={{ p: 2 }}>
                        <CardContent sx={{ p: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            {RoomIcon && <RoomIcon sx={{ fontSize: 32, color: isCompleted ? '#4CAF50' : 'text.secondary' }} />}
                            {isCompleted && (
                              <CheckCircle sx={{ color: '#4CAF50', fontSize: 24 }} />
                            )}
                          </Box>
                          <Typography variant="h6" fontWeight={600} color={isCompleted ? '#4CAF50' : 'text.primary'}>
                            {roomConfig ? t(roomConfig.translationKey) : room.type}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}

        {/* Add Room Dialog */}
        <Dialog open={addRoomDialogOpen} onClose={() => setAddRoomDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('common.add')}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('inspection.form.propertyType')}</InputLabel>
              <Select
                value={newRoomType}
                label={t('inspection.form.propertyType')}
                onChange={(e) => setNewRoomType(e.target.value)}
              >
                {ADDITIONAL_ROOM_TYPES.map((roomType) => {
                  const roomConfig = ROOM_CONFIG[roomType]
                  return (
                    <MenuItem key={roomType} value={roomType}>
                      {roomConfig ? t(roomConfig.translationKey) : roomType}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddRoomDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddRoom} variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : t('common.add')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MaterialDashboardLayout>
  )
}
