'use client'

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Collapse
} from '@mui/material'
import {
  ExpandMore,
  Layers,
  Home,
  DirectionsCar,
  Settings,
  Build,
  Landscape,
  CheckCircle,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Assessment,
  Countertops,
  Kitchen,
  Bathtub,
  Shower,
  Chair,
  Bed,
  Weekend,
  MeetingRoom
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { Property } from '@/features/library/types/property.types'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'

interface InspectionProgressWindowProps {
  property: Property
  onPropertyUpdate?: (property: Property) => void
}

const CATEGORIES = [
  {
    id: 'pieces',
    name: 'Pièces',
    icon: Layers,
    color: '#2196F3',
    weight: 0.25
  },
  {
    id: 'batiment',
    name: 'Bâtiment',
    icon: Home,
    color: '#FF9800',
    weight: 0.25
  },
  {
    id: 'garage',
    name: 'Garage',
    icon: DirectionsCar,
    color: '#4CAF50',
    weight: 0.15
  },
  {
    id: 'mecanique',
    name: 'Mécanique',
    icon: Settings,
    color: '#9C27B0',
    weight: 0.15
  },
  {
    id: 'divers',
    name: 'Divers',
    icon: Build,
    color: '#607D8B',
    weight: 0.00
  },
  {
    id: 'exterieur',
    name: 'Extérieur',
    icon: Landscape,
    color: '#795548',
    weight: 0.20
  }
]

export function InspectionProgressWindow({ property, onPropertyUpdate }: InspectionProgressWindowProps) {
  const t = useTranslations()
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

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

  // Update library record with room counts
  const updateLibraryRecordCounts = async () => {
    const counts = calculateRoomCounts()

    try {
      const updatedProperty = await propertiesSupabaseService.updateProperty(property.id, {
        nombre_chambres: counts.bedrooms,
        salle_bain: counts.bathrooms,
        salle_eau: counts.powderRooms
      })

      // Notify parent component if callback provided
      if (onPropertyUpdate) {
        onPropertyUpdate(updatedProperty)
      }

      console.log('Library record updated:', counts)
      return updatedProperty
    } catch (error) {
      console.error('Error updating library record:', error)
      throw error
    }
  }

  const isCategoryCompleted = (categoryId: string): boolean => {
    switch (categoryId) {
      case 'pieces':
        return (property.inspection_pieces?.completedRooms || 0) >= 2
      case 'batiment':
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

  const calculateOverallProgress = (): number => {
    let total = 0
    CATEGORIES.forEach(cat => {
      if (isCategoryCompleted(cat.id)) {
        total += cat.weight * 100
      }
    })
    return Math.round(total)
  }

  const overallProgress = calculateOverallProgress()
  const roomCounts = calculateRoomCounts()

  const getMaterialIcon = (fieldName: string) => {
    switch (fieldName.toLowerCase()) {
      case 'plancher':
      case 'flooring':
        return <Layers sx={{ fontSize: 14, mr: 0.5 }} />
      case 'armoires':
      case 'cabinets':
        return <Kitchen sx={{ fontSize: 14, mr: 0.5 }} />
      case 'comptoirs':
      case 'counters':
        return <Countertops sx={{ fontSize: 14, mr: 0.5 }} />
      case 'dosseret':
      case 'backsplash':
        return <Home sx={{ fontSize: 14, mr: 0.5 }} />
      case 'murs':
      case 'walls':
        return <Weekend sx={{ fontSize: 14, mr: 0.5 }} />
      case 'plafond':
      case 'ceiling':
        return <ExpandMore sx={{ fontSize: 14, mr: 0.5 }} />
      default:
        return null
    }
  }

  const getRoomTypeLabel = (roomType: string) => {
    const roomTranslations: Record<string, string> = {
      'cuisine': 'Cuisine',
      'salon': 'Salon',
      'salle_a_manger': 'Salle à manger',
      'chambre': 'Chambre',
      'bureau': 'Bureau',
      'salle_sejour': 'Salle de séjour',
      'salle_bain': 'Salle de bain',
      'salle_eau': 'Salle d\'eau',
      'salle_familiale': 'Salle familiale',
      'buanderie': 'Buanderie',
      'rangement': 'Rangement',
      'salle_mecanique': 'Salle mécanique',
      'vestibule': 'Vestibule',
      'solarium': 'Solarium'
    }
    return roomTranslations[roomType] || roomType
  }

  const getFieldLabel = (fieldName: string) => {
    const fieldTranslations: Record<string, string> = {
      'plancher': 'Plancher',
      'armoires': 'Armoires',
      'comptoirs': 'Comptoirs',
      'dosseret': 'Dosseret',
      'murs': 'Murs',
      'plafond': 'Plafond',
      'grandeur': 'Grandeur',
      'nombreAppareils': 'Appareils',
      'notes': 'Notes'
    }
    const label = fieldTranslations[fieldName] || fieldName
    // Capitalize first letter
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  // Helper to translate values that might be translation keys
  const translateValue = (value: any): string => {
    // Ensure value is a string
    if (typeof value !== 'string') {
      return String(value)
    }

    // Check if value looks like a translation key (contains dots and starts with 'inspection')
    if (value.includes('.') && value.startsWith('inspection')) {
      try {
        const translated = t(value)
        // If translation returns the same key, it means translation doesn't exist
        return translated !== value ? translated : value
      } catch {
        return value
      }
    }
    return value
  }

  const renderPiecesDetails = () => {
    if (!property.inspection_pieces?.floors) return null

    return (
      <Box sx={{ mt: 1 }}>
        {Object.entries(property.inspection_pieces.floors).map(([floorId, floor]) => {
          const roomsData = Object.entries(floor.rooms || {})
          if (roomsData.length === 0) return null

          // Count room types to add numbering for duplicates
          const roomTypeCounts: Record<string, number> = {}
          const roomTypeIndices: Record<string, number> = {}

          roomsData.forEach(([_, roomData]: [string, any]) => {
            const roomType = roomData.type
            roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1
          })

          // Collect room types and their materials
          const roomsWithMaterials: Array<{ roomType: string; materials: Array<{ icon: any; label: string; value: string }> }> = []

          roomsData.forEach(([roomId, roomData]: [string, any]) => {
            const customValues = roomData.customValues || {}
            const roomType = roomData.type
            let roomTypeLabel = getRoomTypeLabel(roomType)

            // Add numbering if there are multiple rooms of the same type
            if (roomTypeCounts[roomType] > 1) {
              roomTypeIndices[roomType] = (roomTypeIndices[roomType] || 0) + 1
              roomTypeLabel = `${roomTypeLabel} #${roomTypeIndices[roomType]}`
            }

            // Collect materials for this room
            const materials: Array<{ icon: any; label: string; value: string }> = []
            Object.entries(roomData).forEach(([key, value]) => {
              if (key === 'type' || key === 'completedAt' || key === 'customValues') return

              let displayValue: string
              if (Array.isArray(value) && value.length > 0) {
                displayValue = value.map(v => {
                  if (v === 'other' && customValues[key]) {
                    return customValues[key]
                  }
                  return translateValue(v)
                }).join(', ')
              } else if (!value || (Array.isArray(value) && value.length === 0)) {
                return
              } else {
                displayValue = translateValue(value)
              }

              materials.push({
                icon: getMaterialIcon(getFieldLabel(key)),
                label: getFieldLabel(key),
                value: displayValue
              })
            })

            if (materials.length > 0) {
              roomsWithMaterials.push({ roomType: roomTypeLabel, materials })
            }
          })

          if (roomsWithMaterials.length === 0) return null

          return (
            <Box key={floorId} sx={{ mb: 1.5 }}>
              {/* Line 1: Icon + Floor name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Layers sx={{ fontSize: 16, color: '#2196F3' }} />
                <Typography variant="body2" fontWeight={700} sx={{ color: '#2196F3', fontSize: '13px' }}>
                  {floor.name}
                </Typography>
              </Box>

              {/* Line 2+: Horizontal layout - room types as columns with materials underneath */}
              <Box sx={{ pl: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {roomsWithMaterials.map((room, idx) => (
                  <Box key={idx} sx={{ minWidth: '120px' }}>
                    {/* Room type header */}
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px', color: 'text.primary', display: 'block', mb: 0.5 }}>
                      {room.roomType}
                    </Typography>
                    {/* Materials list vertically */}
                    {room.materials.map((material, matIdx) => (
                      <Box key={matIdx} sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
                        {material.icon}
                        <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
                          {material.label}: {material.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  const renderBatimentDetails = () => {
    const batimentData = property.inspection_batiment
    if (!batimentData) return null

    const subcategories = [
      { id: 'fondation_mur_toiture', name: t('inspection.batiment.fondationMurToiture') },
      { id: 'portes_fenetres', name: t('inspection.batiment.portesFenetres') },
      { id: 'corniche_lucarnes_cheminee', name: t('inspection.batiment.cornicheLucarnesCheminee') }
    ]

    return (
      <Box sx={{ mt: 1 }}>
        {/* Line 1: Category name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Home sx={{ fontSize: 16, color: '#FF9800' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#FF9800', fontSize: '13px' }}>
            {t('inspection.categories.batiment')}
          </Typography>
        </Box>

        {/* Horizontal layout - subcategories as columns */}
        <Box sx={{ pl: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {subcategories.map((subcat) => {
            const subcatData = (batimentData as any)[subcat.id]
            if (!subcatData) return null

            // Collect fields for this subcategory
            const fields: Array<{ label: string; value: string }> = []
            Object.entries(subcatData).forEach(([key, value]) => {
              if (key === 'notes' || key === 'customValues' || key === 'completedAt' || !value) return

              let displayValue: string
              if (Array.isArray(value)) {
                displayValue = value.map(v => translateValue(v)).join(', ')
              } else {
                displayValue = translateValue(value)
              }
              const label = key.replace(/_/g, ' ')
              const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
              fields.push({ label: capitalizedLabel, value: displayValue })
            })

            if (fields.length === 0) return null

            return (
              <Box key={subcat.id} sx={{ minWidth: '180px' }}>
                {/* Subcategory name header */}
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px', color: 'text.primary', display: 'block', mb: 0.5 }}>
                  {subcat.name}
                </Typography>
                {/* Fields list vertically */}
                {fields.map((field, idx) => (
                  <Typography key={idx} variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', display: 'block', mb: 0.25 }}>
                    {field.label}: {field.value}
                  </Typography>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  const renderGarageDetails = () => {
    const garageData = property.inspection_garage
    if (!garageData) return null

    // Collect fields
    const fields: Array<{ label: string; value: string }> = []
    Object.entries(garageData).forEach(([key, value]) => {
      if (key === 'notes' || key === 'customValues' || key === 'dimensions' || key === 'completedAt' || !value) return

      let displayValue = value
      if (Array.isArray(value)) {
        displayValue = value.map(v => translateValue(v)).join(', ')
      } else {
        displayValue = translateValue(displayValue)
      }
      const label = key.replace(/_/g, ' ')
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
      fields.push({ label: capitalizedLabel, value: displayValue })
    })

    if (fields.length === 0) return null

    return (
      <Box sx={{ mt: 1 }}>
        {/* Line 1: Category name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <DirectionsCar sx={{ fontSize: 16, color: '#4CAF50' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#4CAF50', fontSize: '13px' }}>
            {t('inspection.categories.garage')}
          </Typography>
        </Box>
        {/* Line 2: All fields inline on same line */}
        <Box sx={{ pl: 2 }}>
          <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {fields.map((field, idx) => (
              <span key={idx}>
                {field.label}: {field.value}
                {idx < fields.length - 1 ? ', ' : ''}
              </span>
            ))}
          </Typography>
        </Box>
      </Box>
    )
  }

  const renderMecaniqueDetails = () => {
    const mecaniqueData = property.inspection_mecanique
    if (!mecaniqueData) return null

    const subcategories = [
      { id: 'chauffage_ventilation', name: t('inspection.mecanique.chauffageVentilation') },
      { id: 'plomberie', name: t('inspection.mecanique.plomberie') },
      { id: 'electricite', name: t('inspection.mecanique.electricite') }
    ]

    return (
      <Box sx={{ mt: 1 }}>
        {/* Line 1: Category name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Settings sx={{ fontSize: 16, color: '#9C27B0' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#9C27B0', fontSize: '13px' }}>
            {t('inspection.categories.mecanique')}
          </Typography>
        </Box>

        {/* Horizontal layout - subcategories as columns */}
        <Box sx={{ pl: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {subcategories.map((subcat) => {
            const subcatData = (mecaniqueData as any)[subcat.id]
            if (!subcatData) return null

            // Collect fields for this subcategory
            const fields: Array<{ label: string; value: string }> = []
            Object.entries(subcatData).forEach(([key, value]) => {
              if (key === 'notes' || key === 'customValues' || key === 'completedAt' || !value) return

              let displayValue: string
              if (Array.isArray(value)) {
                displayValue = value.map(v => translateValue(v)).join(', ')
              } else {
                displayValue = translateValue(value)
              }
              const label = key.replace(/_/g, ' ')
              const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
              fields.push({ label: capitalizedLabel, value: displayValue })
            })

            if (fields.length === 0) return null

            return (
              <Box key={subcat.id} sx={{ minWidth: '180px' }}>
                {/* Subcategory name header */}
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px', color: 'text.primary', display: 'block', mb: 0.5 }}>
                  {subcat.name}
                </Typography>
                {/* Fields list vertically */}
                {fields.map((field, idx) => (
                  <Typography key={idx} variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', display: 'block', mb: 0.25 }}>
                    {field.label}: {field.value}
                  </Typography>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  const renderExterieurDetails = () => {
    const exterieurData = property.inspection_exterieur
    if (!exterieurData) return null

    const subcategories = [
      { id: 'amenagement_installations_entree', name: t('inspection.exterieur.amenagementInstallationsEntree') },
      { id: 'piscine_spa', name: t('inspection.exterieur.piscineSpa') }
    ]

    return (
      <Box sx={{ mt: 1 }}>
        {/* Line 1: Category name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Landscape sx={{ fontSize: 16, color: '#795548' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#795548', fontSize: '13px' }}>
            {t('inspection.categories.exterieur')}
          </Typography>
        </Box>

        {/* Horizontal layout - subcategories as columns */}
        <Box sx={{ pl: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {subcategories.map((subcat) => {
            const subcatData = (exterieurData as any)[subcat.id]
            if (!subcatData) return null

            // Collect fields for this subcategory
            const fields: Array<{ label: string; value: string }> = []
            Object.entries(subcatData).forEach(([key, value]) => {
              if (key === 'notes' || key === 'customValues' || key === 'dimensions' || key === 'lengths' || key === 'completedAt' || !value) return

              let displayValue: string
              if (Array.isArray(value)) {
                displayValue = value.join(', ')
              } else {
                displayValue = String(value)
              }
              fields.push({ label: key.replace(/_/g, ' '), value: displayValue })
            })

            if (fields.length === 0) return null

            return (
              <Box key={subcat.id} sx={{ minWidth: '180px' }}>
                {/* Subcategory name header */}
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px', color: 'text.primary', display: 'block', mb: 0.5 }}>
                  {subcat.name}
                </Typography>
                {/* Fields list vertically */}
                {fields.map((field, idx) => (
                  <Typography key={idx} variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', display: 'block', mb: 0.25 }}>
                    {field.label}: {field.value}
                  </Typography>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  const renderDiversDetails = () => {
    const diversData = property.inspection_divers
    if (!diversData) return null

    const subcategories = [
      { id: 'services', name: t('inspection.divers.services') },
      { id: 'voisinage', name: t('inspection.divers.voisinage') },
      { id: 'foyer', name: t('inspection.divers.foyer') },
      { id: 'divers', name: t('inspection.divers.diversSub') }
    ]

    return (
      <Box sx={{ mt: 1 }}>
        {/* Line 1: Category name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Build sx={{ fontSize: 16, color: '#607D8B' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#607D8B', fontSize: '13px' }}>
            {t('inspection.categories.divers')}
          </Typography>
        </Box>

        {/* Horizontal layout - subcategories as columns */}
        <Box sx={{ pl: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {subcategories.map((subcat) => {
            const subcatData = (diversData as any)[subcat.id]
            if (!subcatData) return null

            // Collect fields for this subcategory
            const fields: Array<{ label: string; value: string }> = []
            Object.entries(subcatData).forEach(([key, value]) => {
              if (key === 'notes' || key === 'customValues' || key === 'completedAt' || !value) return

              let displayValue: string
              if (Array.isArray(value)) {
                displayValue = value.map(v => translateValue(v)).join(', ')
              } else {
                displayValue = translateValue(value)
              }
              const label = key.replace(/_/g, ' ')
              const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
              fields.push({ label: capitalizedLabel, value: displayValue })
            })

            if (fields.length === 0) return null

            return (
              <Box key={subcat.id} sx={{ minWidth: '180px' }}>
                {/* Subcategory name header */}
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px', color: 'text.primary', display: 'block', mb: 0.5 }}>
                  {subcat.name}
                </Typography>
                {/* Fields list vertically */}
                {fields.map((field, idx) => (
                  <Typography key={idx} variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', display: 'block', mb: 0.25 }}>
                    {field.label}: {field.value}
                  </Typography>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  const renderCategoryDetails = (categoryId: string) => {
    switch (categoryId) {
      case 'pieces':
        return renderPiecesDetails()
      case 'batiment':
        return renderBatimentDetails()
      case 'garage':
        return renderGarageDetails()
      case 'mecanique':
        return renderMecaniqueDetails()
      case 'exterieur':
        return renderExterieurDetails()
      case 'divers':
        return renderDiversDetails()
      default:
        return null
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        mb: 3,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        {/* Title and Progress */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Assessment sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('inspection.progress.title')}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary">
            {overallProgress}%
          </Typography>
        </Box>

        {/* Room Counts */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Bed sx={{ fontSize: 20, color: '#2196F3' }} />
            <Typography variant="body2" fontWeight={600}>
              {roomCounts.bedrooms} {t('inspection.rooms.bedrooms')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Bathtub sx={{ fontSize: 20, color: '#9C27B0' }} />
            <Typography variant="body2" fontWeight={600}>
              {roomCounts.bathrooms} {t('inspection.rooms.bathrooms')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Shower sx={{ fontSize: 20, color: '#FF9800' }} />
            <Typography variant="body2" fontWeight={600}>
              {roomCounts.powderRooms} {t('inspection.rooms.powderRooms')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MeetingRoom sx={{ fontSize: 20, color: '#4CAF50' }} />
            <Typography variant="body2" fontWeight={600}>
              {roomCounts.totalRooms} {t('inspection.rooms.totalRooms')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Progress bar and category pills - always visible */}
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
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

        {/* Category Pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            const isCompleted = isCategoryCompleted(category.id)
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <Chip
                key={category.id}
                icon={<Icon sx={{ fontSize: 18 }} />}
                label={category.name}
                onClick={() => toggleCategory(category.id)}
                sx={{
                  bgcolor: isExpanded ? `${category.color}3a` : 'white',
                  color: isExpanded || isCompleted ? category.color : 'text.secondary',
                  border: `1px solid ${category.color}`,
                  fontWeight: isExpanded || isCompleted ? 600 : 400,
                  boxShadow: isExpanded ? `0 0 0 2px ${category.color}40` : 'none',
                  '& .MuiChip-icon': {
                    color: category.color
                  },
                  '&:hover': {
                    bgcolor: `${category.color}2a`,
                    borderColor: category.color
                  }
                }}
                deleteIcon={isCompleted ? <CheckCircle sx={{ fontSize: 18 }} /> : undefined}
                onDelete={isCompleted ? () => {} : undefined}
              />
            )
          })}
        </Box>
      </Box>

      {/* Category details */}
      <Box sx={{ p: 2, pt: 0 }}>
        {CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.includes(category.id)

          if (!isExpanded) return null

          return (
            <Box
              key={category.id}
              sx={{
                mb: 2,
                borderLeft: '4px solid',
                borderColor: category.color,
                pl: 2,
                py: 1
              }}
            >
              <Collapse in={isExpanded}>
                {renderCategoryDetails(category.id)}
              </Collapse>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
