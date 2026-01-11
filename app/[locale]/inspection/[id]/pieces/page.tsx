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
  Link,
  keyframes
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
  OpenInNew,
  MeetingRoom,
  WbSunny
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property, InspectionPieces, FloorInspection } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import { InspectionFloatingNav } from '@/features/inspection/components/InspectionFloatingNav'
import { CategoryHeader } from '@/features/inspection/components/CategoryHeader'
import { FLOOR_OPTIONS, ROOM_CONFIG } from '@/features/inspection/constants/room.constants'
import { Layers } from '@mui/icons-material'

// Premium animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`

const BASE_ROOM_TYPES = ['cuisine', 'salle_a_manger', 'salon', 'chambre', 'bureau', 'salle_sejour', 'salle_bain', 'salle_eau']
const BASEMENT_ROOM_TYPES = ['salle_familiale', 'salle_sejour', 'chambre', 'bureau', 'buanderie', 'rangement', 'salle_mecanique', 'salle_bain', 'salle_eau']
const UPPER_FLOOR_ROOM_TYPES = ['chambre', 'bureau', 'salle_bain', 'salle_eau']
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
  salle_mecanique: Settings,
  vestibule: MeetingRoom,
  solarium: WbSunny
}
const ADDITIONAL_ROOM_TYPES = ['chambre', 'salle_bain', 'salle_eau', 'vestibule', 'solarium', 'cuisine', 'salle_a_manger', 'salon', 'bureau', 'salle_sejour', 'salle_familiale', 'buanderie', 'rangement', 'salle_mecanique']

export default function PiecesPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params?.locale as string
  const propertyId = params?.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false)
  const [newRoomType, setNewRoomType] = useState('chambre')
  const [roomInstanceDialogOpen, setRoomInstanceDialogOpen] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null)
  const [selectedRoomInstances, setSelectedRoomInstances] = useState<Array<{ id: string; type: string; data: any }>>([])

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
      const floorParam = searchParams?.get('floor')

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

  const getGroupedRooms = (floorId: string) => {
    const rooms = getRoomsForFloor(floorId)
    const grouped: Record<string, Array<{ id: string; type: string; data: any }>> = {}

    rooms.forEach(room => {
      if (!grouped[room.type]) {
        grouped[room.type] = []
      }
      grouped[room.type].push(room)
    })

    return grouped
  }

  const isRoomCompleted = (floorId: string, roomId: string) => {
    const room = property?.inspection_pieces?.floors?.[floorId]?.rooms?.[roomId]
    return room?.completedAt !== undefined
  }

  // Calculate room counts using the same logic as InspectionProgressWindow
  const calculateRoomCounts = () => {
    if (!property?.inspection_pieces?.floors) {
      return { bedrooms: 0, bathrooms: 0, powderRooms: 0, totalRooms: 0 }
    }

    let bedrooms = 0
    let bathrooms = 0
    let powderRooms = 0
    let totalRooms = 0

    // Room types to EXCLUDE from total count
    const excludedRoomTypes = ['salle_bain', 'salle_eau', 'vestibule', 'solarium']

    // Helper function to check if a room has been filled (has any data besides type)
    const isRoomFilledWithData = (roomData: any): boolean => {
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
        if (!isRoomFilledWithData(roomData)) return

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

    // Initialize upper floor room types for the new floor (2e+)
    UPPER_FLOOR_ROOM_TYPES.forEach(roomType => {
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
      totalRooms: currentData.totalRooms + UPPER_FLOOR_ROOM_TYPES.length
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

    // Determine room types based on floor
    let roomTypes = BASE_ROOM_TYPES
    if (floorValue === 'sous_sol') {
      roomTypes = BASEMENT_ROOM_TYPES
    } else if (floorValue === 'deuxieme' || floorValue === 'troisieme') {
      // 2e and 3e floors use upper floor room types
      roomTypes = UPPER_FLOOR_ROOM_TYPES
    }

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

  const handleRoomGroupClick = (roomType: string, instances: Array<{ id: string; type: string; data: any }>) => {
    if (instances.length === 1) {
      // If only one instance, go directly to that room
      router.push(`/${locale}/inspection/${propertyId}/pieces/${selectedFloor}/${instances[0].id}`)
    } else {
      // If multiple instances, show selection dialog
      setSelectedRoomType(roomType)
      setSelectedRoomInstances(instances)
      setRoomInstanceDialogOpen(true)
    }
  }

  const handleRoomInstanceClick = (roomId: string) => {
    setRoomInstanceDialogOpen(false)
    router.push(`/${locale}/inspection/${propertyId}/pieces/${selectedFloor}/${roomId}`)
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
      <Box sx={{ pb: { xs: 12, md: 3 } }}>
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
            onClick={() => router.push(`/${locale}/library?propertyId=${propertyId}`)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Voir la fiche
          </Button>
        </Box>

        {/* Category Header */}
        <CategoryHeader
          categoryName={t('inspection.categories.pieces')}
          categoryColor="#2196F3"
          categoryIcon={Layers}
          progress={Math.round(((property.inspection_pieces?.completedRooms || 0) / Math.max(property.inspection_pieces?.totalRooms || 1, 1)) * 100)}
          subtitle="Inspection pièce par pièce"
          roomCounts={calculateRoomCounts()}
        />

        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ bgcolor: 'grey.100' }}>
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Floor Selector - Premium Style */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            animation: `${fadeInUp} 0.5s ease-out`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              {t('inspection.floors.addFloor')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {FLOOR_OPTIONS.map((floor, index) => {
              const floorExists = floors.some(f => f.id === floor.value)
              const isSelected = selectedFloor === floor.value

              return (
                <Button
                  key={floor.value}
                  onClick={() => handleAddPredefinedFloor(floor.value, floor.displayName)}
                  sx={{
                    minWidth: 100,
                    px: 2.5,
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    border: '2px solid',
                    animation: `${scaleIn} 0.3s ease-out ${index * 0.05}s both`,
                    ...(isSelected ? {
                      bgcolor: '#3B82F6',
                      borderColor: '#3B82F6',
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                      '&:hover': {
                        bgcolor: '#2563EB',
                        borderColor: '#2563EB'
                      }
                    } : floorExists ? {
                      bgcolor: '#EFF6FF',
                      borderColor: '#3B82F6',
                      color: '#3B82F6',
                      '&:hover': {
                        bgcolor: '#DBEAFE',
                        borderColor: '#2563EB'
                      }
                    } : {
                      bgcolor: 'white',
                      borderColor: '#E2E8F0',
                      color: '#64748B',
                      '&:hover': {
                        bgcolor: '#F8FAFC',
                        borderColor: '#CBD5E1'
                      }
                    })
                  }}
                  startIcon={floorExists ? <CheckCircle sx={{ fontSize: 18 }} /> : undefined}
                >
                  {floor.displayName}
                </Button>
              )
            })}
            {/* Additional floors (4e, 5e, etc.) */}
            {floors
              .filter(f => {
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
                    onClick={() => setSelectedFloor(floor.id)}
                    sx={{
                      minWidth: 100,
                      px: 2.5,
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '14px',
                      textTransform: 'none',
                      border: '2px solid',
                      ...(isSelected ? {
                        bgcolor: '#3B82F6',
                        borderColor: '#3B82F6',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                        '&:hover': { bgcolor: '#2563EB', borderColor: '#2563EB' }
                      } : {
                        bgcolor: '#EFF6FF',
                        borderColor: '#3B82F6',
                        color: '#3B82F6',
                        '&:hover': { bgcolor: '#DBEAFE', borderColor: '#2563EB' }
                      })
                    }}
                    startIcon={<CheckCircle sx={{ fontSize: 18 }} />}
                  >
                    {floor.name}
                  </Button>
                )
              })}
            <Button
              onClick={handleAddNextFloor}
              sx={{
                minWidth: 48,
                width: 48,
                height: 48,
                borderRadius: '12px',
                border: '2px dashed #CBD5E1',
                color: '#94A3B8',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#3B82F6',
                  color: '#3B82F6'
                }
              }}
            >
              <Add />
            </Button>
          </Box>
        </Paper>

        {/* Rooms Grid - Premium Style */}
        {selectedFloor && (
          <Box sx={{ animation: `${fadeInUp} 0.5s ease-out 0.1s both` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Pièces - {floors.find(f => f.id === selectedFloor)?.name}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#64748B', mt: 0.5 }}>
                  Sélectionnez une pièce pour l'inspecter
                </Typography>
              </Box>
              <Button
                startIcon={<Add />}
                onClick={() => setAddRoomDialogOpen(true)}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  bgcolor: '#10B981',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    bgcolor: '#059669',
                    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
                  }
                }}
              >
                {t('common.add')}
              </Button>
            </Box>

            <Grid container spacing={2}>
              {(() => {
                const groupedRooms = getGroupedRooms(selectedFloor)
                let roomTypesOrder = BASE_ROOM_TYPES
                if (selectedFloor === 'sous_sol') {
                  roomTypesOrder = BASEMENT_ROOM_TYPES
                } else if (selectedFloor === 'deuxieme' || selectedFloor === 'troisieme' || selectedFloor?.startsWith('floor_')) {
                  roomTypesOrder = UPPER_FLOOR_ROOM_TYPES
                }

                const sortedRoomTypes = Object.keys(groupedRooms).sort((a, b) => {
                  const orderA = roomTypesOrder.indexOf(a)
                  const orderB = roomTypesOrder.indexOf(b)
                  if (orderA === -1 && orderB === -1) return 0
                  if (orderA === -1) return 1
                  if (orderB === -1) return -1
                  return orderA - orderB
                })

                return sortedRoomTypes.map((roomType, index) => {
                  const instances = groupedRooms[roomType]
                  const roomConfig = ROOM_CONFIG[roomType]
                  const RoomIcon = ROOM_ICONS[roomType]
                  const allCompleted = instances.every(instance => isRoomCompleted(selectedFloor, instance.id))
                  const someCompleted = instances.some(instance => isRoomCompleted(selectedFloor, instance.id))

                  const statusColor = allCompleted ? '#10B981' : someCompleted ? '#F59E0B' : '#94A3B8'
                  const statusBg = allCompleted ? '#10B98115' : someCompleted ? '#F59E0B15' : '#F8FAFC'

                  return (
                    <Grid item xs={12} sm={6} md={4} key={roomType}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: '16px',
                          border: '2px solid',
                          borderColor: allCompleted ? '#10B981' : someCompleted ? '#F59E0B' : 'rgba(0,0,0,0.06)',
                          bgcolor: statusBg,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          animation: `${scaleIn} 0.3s ease-out ${index * 0.05}s both`,
                          position: 'relative',
                          overflow: 'visible',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: `0 12px 32px ${statusColor}25`,
                            borderColor: statusColor
                          }
                        }}
                      >
                        {/* Completion badge */}
                        {allCompleted && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                              zIndex: 10
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 18, color: 'white' }} />
                          </Box>
                        )}

                        <CardActionArea onClick={() => handleRoomGroupClick(roomType, instances)} sx={{ p: 2.5 }}>
                          <CardContent sx={{ p: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              {/* Icon container */}
                              <Box
                                sx={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: '14px',
                                  background: allCompleted
                                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                    : someCompleted
                                      ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                      : '#E2E8F0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {RoomIcon && <RoomIcon sx={{ fontSize: 28, color: allCompleted || someCompleted ? 'white' : '#64748B' }} />}
                              </Box>

                              {/* Text content */}
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  color: '#0F172A',
                                  letterSpacing: '-0.01em',
                                  mb: 0.5
                                }}>
                                  {roomConfig ? t(roomConfig.translationKey) : roomType}
                                </Typography>
                                {instances.length > 1 && (
                                  <Chip
                                    label={`${instances.length} pièces`}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      bgcolor: 'rgba(0,0,0,0.06)',
                                      color: '#64748B',
                                      fontWeight: 500,
                                      fontSize: '11px'
                                    }}
                                  />
                                )}
                                {!allCompleted && (
                                  <Typography sx={{
                                    fontSize: '12px',
                                    color: someCompleted ? '#D97706' : '#94A3B8',
                                    mt: 0.5
                                  }}>
                                    {someCompleted ? 'En cours' : 'Non inspecté'}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  )
                })
              })()}
            </Grid>
          </Box>
        )}

        {/* Add Room Dialog */}
        <Dialog open={addRoomDialogOpen} onClose={() => setAddRoomDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('common.add')}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('inspection.form.roomType')}</InputLabel>
              <Select
                value={newRoomType}
                label={t('inspection.form.roomType')}
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

        {/* Room Instance Selection Dialog */}
        <Dialog open={roomInstanceDialogOpen} onClose={() => setRoomInstanceDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedRoomType && ROOM_CONFIG[selectedRoomType] ? t(ROOM_CONFIG[selectedRoomType].translationKey) : selectedRoomType}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sélectionnez la pièce que vous souhaitez inspecter:
            </Typography>
            <Grid container spacing={2}>
              {selectedRoomInstances.map((instance, index) => {
                const isCompleted = isRoomCompleted(selectedFloor!, instance.id)
                return (
                  <Grid item xs={12} key={instance.id}>
                    <Card
                      elevation={0}
                      sx={{
                        border: '2px solid',
                        borderColor: isCompleted ? '#4CAF50' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handleRoomInstanceClick(instance.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {selectedRoomType && ROOM_CONFIG[selectedRoomType] ? t(ROOM_CONFIG[selectedRoomType].translationKey) : selectedRoomType} #{index + 1}
                          </Typography>
                          {isCompleted && (
                            <CheckCircle sx={{ color: '#4CAF50', fontSize: 24 }} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoomInstanceDialogOpen(false)}>{t('common.cancel')}</Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Floating Navigation */}
      <InspectionFloatingNav inspectionId={propertyId} currentCategory="pieces" />
    </MaterialDashboardLayout>
  )
}
