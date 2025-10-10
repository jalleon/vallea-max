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
  NavigateNext
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property, InspectionPieces, FloorInspection } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { FLOOR_OPTIONS, ROOM_CONFIG } from '@/features/inspection/constants/room.constants'

const BASE_ROOM_TYPES = ['cuisine', 'salon', 'salle_a_manger', 'chambre', 'bureau', 'salle_sejour', 'salle_bain', 'salle_eau']
const ADDITIONAL_ROOM_TYPES = ['chambre', 'salle_bain', 'salle_eau', 'autre']

export default function PiecesPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addFloorDialogOpen, setAddFloorDialogOpen] = useState(false)
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false)
  const [newFloorName, setNewFloorName] = useState('')
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

      // Initialize inspection_pieces if not exists
      if (!prop.inspection_pieces) {
        const initialData: InspectionPieces = {
          floors: {},
          totalRooms: 0,
          completedRooms: 0
        }
        await updateInspectionPieces(initialData)
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

  const handleAddFloor = async () => {
    if (!property || !newFloorName.trim()) return

    const floorId = `floor_${Date.now()}`
    const currentData = property.inspection_pieces || { floors: {}, totalRooms: 0, completedRooms: 0 }

    const newFloor: FloorInspection = {
      name: newFloorName,
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
    setAddFloorDialogOpen(false)
    setNewFloorName('')
    setSelectedFloor(floorId)
  }

  const handleAddPredefinedFloor = async (floorValue: string, floorName: string) => {
    if (!property) return

    const currentData = property.inspection_pieces || { floors: {}, totalRooms: 0, completedRooms: 0 }

    // Check if floor already exists
    if (currentData.floors[floorValue]) {
      setSelectedFloor(floorValue)
      return
    }

    const newFloor: FloorInspection = {
      name: floorName,
      rooms: {}
    }

    // Initialize base room types
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
        [floorValue]: newFloor
      },
      totalRooms: currentData.totalRooms + BASE_ROOM_TYPES.length
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
                  onClick={() => handleAddPredefinedFloor(floor.value, t(floor.translationKey))}
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
                  {t(floor.translationKey)}
                </Button>
              )
            })}
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setAddFloorDialogOpen(true)}
              sx={{ minWidth: 120 }}
            >
              +
            </Button>
          </Box>
        </Paper>

        {/* Rooms Grid */}
        {selectedFloor && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {floors.find(f => f.id === selectedFloor)?.name}
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
              {rooms.map((room) => {
                const isCompleted = isRoomCompleted(selectedFloor, room.id)
                const roomConfig = ROOM_CONFIG[room.type]

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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={600} color={isCompleted ? '#4CAF50' : 'text.primary'}>
                              {roomConfig ? t(roomConfig.translationKey) : room.type}
                            </Typography>
                            {isCompleted && (
                              <CheckCircle sx={{ color: '#4CAF50', fontSize: 32 }} />
                            )}
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}

        {/* Add Floor Dialog */}
        <Dialog open={addFloorDialogOpen} onClose={() => setAddFloorDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('inspection.floors.addFloor')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('common.name')}
              type="text"
              fullWidth
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              placeholder="4e étage, Grenier, etc."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddFloorDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddFloor} variant="contained" disabled={!newFloorName.trim() || saving}>
              {saving ? <CircularProgress size={20} /> : t('common.add')}
            </Button>
          </DialogActions>
        </Dialog>

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
