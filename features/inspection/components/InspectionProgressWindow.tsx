'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  keyframes
} from '@mui/material'
import {
  ExpandMore,
  Layers,
  Home,
  DirectionsCar,
  Settings,
  Build,
  Landscape,
  Check,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Countertops,
  Kitchen,
  Bathtub,
  Shower,
  Bed,
  Weekend,
  MeetingRoom,
  ArrowForward,
  PlayArrow
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { Property } from '@/features/library/types/property.types'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'

// Premium animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`

interface InspectionProgressWindowProps {
  property: Property
  onPropertyUpdate?: (property: Property) => void
}

const CATEGORIES = [
  {
    id: 'pieces',
    name: 'Pièces',
    description: 'Inspection pièce par pièce',
    icon: Layers,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    weight: 0.25
  },
  {
    id: 'batiment',
    name: 'Bâtiment',
    description: 'Structure et éléments fixes',
    icon: Home,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    weight: 0.25
  },
  {
    id: 'garage',
    name: 'Garage',
    description: 'Garage et stationnement',
    icon: DirectionsCar,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    weight: 0.15
  },
  {
    id: 'mecanique',
    name: 'Mécanique',
    description: 'Systèmes mécaniques',
    icon: Settings,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    weight: 0.15
  },
  {
    id: 'divers',
    name: 'Divers',
    description: 'Éléments additionnels',
    icon: Build,
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    weight: 0.00
  },
  {
    id: 'exterieur',
    name: 'Extérieur',
    description: 'Aménagements extérieurs',
    icon: Landscape,
    color: '#78716C',
    gradient: 'linear-gradient(135deg, #78716C 0%, #57534E 100%)',
    weight: 0.20
  }
]

export function InspectionProgressWindow({ property, onPropertyUpdate }: InspectionProgressWindowProps) {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    const excludedRoomTypes = ['salle_bain', 'salle_eau', 'vestibule', 'solarium']

    const isRoomCompleted = (roomData: any): boolean => {
      if (!roomData) return false
      const filledFields = Object.entries(roomData).filter(([key, value]) => {
        if (key === 'type' || key === 'customValues' || key === 'completedAt') return false
        if (Array.isArray(value)) return value.length > 0
        return value !== null && value !== undefined && value !== ''
      })
      return filledFields.length > 0
    }

    Object.entries(property.inspection_pieces.floors).forEach(([floorId, floor]) => {
      const isBasement = floorId === 'sous_sol' || floor.name?.toLowerCase().includes('sous-sol')
      Object.entries(floor.rooms || {}).forEach(([_, roomData]: [string, any]) => {
        if (!isRoomCompleted(roomData)) return
        const roomType = roomData.type
        if (roomType === 'chambre' && !isBasement) bedrooms++
        if (roomType === 'salle_bain') bathrooms++
        if (roomType === 'salle_eau') powderRooms++
        if (!isBasement && !excludedRoomTypes.includes(roomType)) totalRooms++
      })
    })

    return { bedrooms, bathrooms, powderRooms, totalRooms }
  }

  const isCategoryCompleted = (categoryId: string): boolean => {
    switch (categoryId) {
      case 'pieces': return (property.inspection_pieces?.completedRooms || 0) >= 2
      case 'batiment': return !!property.inspection_batiment
      case 'garage': return !!property.inspection_garage
      case 'mecanique': return !!property.inspection_mecanique
      case 'divers': return !!property.inspection_divers
      case 'exterieur': return !!property.inspection_exterieur
      default: return false
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
  const completedCount = CATEGORIES.filter(cat => isCategoryCompleted(cat.id)).length

  const getRoomTypeLabel = (roomType: string) => {
    const roomTranslations: Record<string, string> = {
      'cuisine': 'Cuisine', 'salon': 'Salon', 'salle_a_manger': 'Salle à manger',
      'chambre': 'Chambre', 'bureau': 'Bureau', 'salle_sejour': 'Salle de séjour',
      'salle_bain': 'Salle de bain', 'salle_eau': "Salle d'eau",
      'salle_familiale': 'Salle familiale', 'buanderie': 'Buanderie',
      'rangement': 'Rangement', 'salle_mecanique': 'Salle mécanique',
      'vestibule': 'Vestibule', 'solarium': 'Solarium'
    }
    return roomTranslations[roomType] || roomType
  }

  const getFieldLabel = (fieldName: string) => {
    const fieldTranslations: Record<string, string> = {
      'plancher': 'Plancher', 'armoires': 'Armoires', 'comptoirs': 'Comptoirs',
      'dosseret': 'Dosseret', 'murs': 'Murs', 'plafond': 'Plafond',
      'grandeur': 'Grandeur', 'nombreAppareils': 'Appareils', 'notes': 'Notes'
    }
    const label = fieldTranslations[fieldName] || fieldName
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  const translateValue = (value: any): string => {
    if (typeof value !== 'string') return String(value)
    if (value.includes('.') && value.startsWith('inspection')) {
      try {
        const translated = t(value)
        return translated !== value ? translated : value
      } catch { return value }
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

          const roomTypeCounts: Record<string, number> = {}
          const roomTypeIndices: Record<string, number> = {}

          roomsData.forEach(([_, roomData]: [string, any]) => {
            const roomType = roomData.type
            roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1
          })

          const roomsWithMaterials: Array<{ roomType: string; materials: Array<{ label: string; value: string }> }> = []

          roomsData.forEach(([roomId, roomData]: [string, any]) => {
            const customValues = roomData.customValues || {}
            const roomType = roomData.type
            let roomTypeLabel = getRoomTypeLabel(roomType)

            if (roomTypeCounts[roomType] > 1) {
              roomTypeIndices[roomType] = (roomTypeIndices[roomType] || 0) + 1
              roomTypeLabel = `${roomTypeLabel} #${roomTypeIndices[roomType]}`
            }

            const materials: Array<{ label: string; value: string }> = []
            Object.entries(roomData).forEach(([key, value]) => {
              if (key === 'type' || key === 'completedAt' || key === 'customValues') return

              let displayValue: string
              if (Array.isArray(value) && value.length > 0) {
                displayValue = value.map(v => {
                  if (v === 'other' && customValues[key]) return customValues[key]
                  return translateValue(v)
                }).join(', ')
              } else if (!value || (Array.isArray(value) && value.length === 0)) {
                return
              } else {
                displayValue = translateValue(value)
              }

              materials.push({ label: getFieldLabel(key), value: displayValue })
            })

            if (materials.length > 0) {
              roomsWithMaterials.push({ roomType: roomTypeLabel, materials })
            }
          })

          if (roomsWithMaterials.length === 0) return null

          return (
            <Box key={floorId} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#3B82F6'
                }} />
                <Typography sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  letterSpacing: '-0.01em'
                }}>
                  {floor.name}
                </Typography>
              </Box>

              <Box sx={{ pl: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {roomsWithMaterials.map((room, idx) => (
                  <Box key={idx} sx={{
                    minWidth: '140px',
                    p: 1.5,
                    bgcolor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <Typography sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                      mb: 0.5
                    }}>
                      {room.roomType}
                    </Typography>
                    {room.materials.map((material, matIdx) => (
                      <Typography key={matIdx} sx={{
                        fontSize: '11px',
                        color: '#64748B',
                        lineHeight: 1.4
                      }}>
                        {material.label}: {material.value}
                      </Typography>
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

  const renderCategoryDetails = (categoryId: string) => {
    switch (categoryId) {
      case 'pieces': return renderPiecesDetails()
      default: return null
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        mb: 4,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        opacity: mounted ? 1 : 0,
        animation: mounted ? `${fadeInUp} 0.6s ease-out` : 'none'
      }}
    >
      {/* Premium Header */}
      <Box
        sx={{
          position: 'relative',
          p: { xs: 3, md: 4 },
          color: 'white',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          minHeight: 200
        }}
      >
        {/* Animated gradient mesh background */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 50% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
            `,
            animation: `${pulse} 8s ease-in-out infinite`,
            zIndex: 1
          }}
        />

        {/* Grid pattern overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            zIndex: 2
          }}
        />

        {/* Content */}
        <Box sx={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 3, md: 5 },
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}>
          {/* Circular Progress - Enhanced */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              animation: mounted ? `${scaleIn} 0.8s ease-out 0.2s both` : 'none'
            }}
          >
            {/* Glow effect */}
            <Box
              sx={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
                animation: `${pulse} 3s ease-in-out infinite`
              }}
            />

            {/* Background track */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={140}
              thickness={4}
              sx={{
                color: 'rgba(255,255,255,0.1)',
                position: 'absolute'
              }}
            />

            {/* Progress indicator */}
            <CircularProgress
              variant="determinate"
              value={overallProgress}
              size={140}
              thickness={4}
              sx={{
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                  stroke: 'url(#progressGradientPremium)',
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
                }
              }}
            />
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="progressGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="50%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                sx={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}
              >
                {overallProgress}
              </Typography>
              <Typography sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                mt: 0.5
              }}>
                pour cent
              </Typography>
            </Box>
          </Box>

          {/* Title and Stats */}
          <Box sx={{
            flex: 1,
            animation: mounted ? `${fadeInUp} 0.6s ease-out 0.3s both` : 'none'
          }}>
            <Typography
              sx={{
                fontSize: { xs: '24px', md: '32px' },
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
                mb: 1,
                lineHeight: 1.2
              }}
            >
              {t('inspection.progress.title')}
            </Typography>

            <Typography sx={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.6)',
              mb: 3
            }}>
              {completedCount} sur {CATEGORIES.length} catégories complétées
            </Typography>

            {/* Room count chips */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {[
                { icon: Bed, count: roomCounts.bedrooms, label: t('inspection.rooms.bedrooms'), color: '#3B82F6' },
                { icon: Bathtub, count: roomCounts.bathrooms, label: t('inspection.rooms.bathrooms'), color: '#8B5CF6' },
                { icon: Shower, count: roomCounts.powderRooms, label: t('inspection.rooms.powderRooms'), color: '#10B981' },
                { icon: MeetingRoom, count: roomCounts.totalRooms, label: t('inspection.rooms.totalRooms'), color: '#F59E0B' }
              ].map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <item.icon sx={{ fontSize: 18, color: item.color }} />
                  <Typography sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    {item.count}
                  </Typography>
                  <Typography sx={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Section Title */}
      <Box sx={{ px: 3, pt: 4, pb: 2 }}>
        <Typography sx={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#0F172A',
          letterSpacing: '-0.01em'
        }}>
          Catégories d'inspection
        </Typography>
        <Typography sx={{
          fontSize: '14px',
          color: '#64748B',
          mt: 0.5
        }}>
          Sélectionnez une catégorie pour commencer ou continuer l'inspection
        </Typography>
      </Box>

      {/* Category Cards Grid */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={2}>
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon
            const isCompleted = isCategoryCompleted(category.id)
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: isCompleted ? category.color : 'rgba(0,0,0,0.08)',
                    bgcolor: 'white',
                    boxShadow: isCompleted
                      ? `0 4px 20px ${category.color}25`
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    animation: mounted ? `${fadeInUp} 0.5s ease-out ${0.1 + index * 0.08}s both` : 'none',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 12px 32px ${category.color}20`,
                      borderColor: category.color
                    }
                  }}
                >
                  {/* Completion badge */}
                  {isCompleted && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: category.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${category.color}50`,
                        zIndex: 10,
                        animation: `${scaleIn} 0.3s ease-out`
                      }}
                    >
                      <Check sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                  )}

                  <CardActionArea
                    onClick={() => router.push(`/${locale}/inspection/${property.id}/${category.id}`)}
                    sx={{ p: 2.5 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Icon container */}
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '14px',
                          background: isCompleted ? category.gradient : `${category.color}10`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          flexShrink: 0
                        }}
                      >
                        <Icon sx={{
                          fontSize: 26,
                          color: isCompleted ? 'white' : category.color
                        }} />
                      </Box>

                      {/* Text content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0F172A',
                          letterSpacing: '-0.01em',
                          mb: 0.25
                        }}>
                          {category.name}
                        </Typography>
                        <Typography sx={{
                          fontSize: '13px',
                          color: '#64748B',
                          lineHeight: 1.4
                        }}>
                          {category.description}
                        </Typography>

                        {/* Status indicator */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 1.5
                        }}>
                          {isCompleted ? (
                            <Chip
                              label="Complété"
                              size="small"
                              sx={{
                                height: 24,
                                bgcolor: `${category.color}15`,
                                color: category.color,
                                fontWeight: 600,
                                fontSize: '11px',
                                '& .MuiChip-label': { px: 1.5 }
                              }}
                            />
                          ) : (
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: '#94A3B8',
                              fontSize: '12px'
                            }}>
                              <PlayArrow sx={{ fontSize: 14 }} />
                              Commencer
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Arrow indicator */}
                      <ArrowForward sx={{
                        fontSize: 20,
                        color: '#CBD5E1',
                        transition: 'all 0.2s ease',
                        '.MuiCardActionArea-root:hover &': {
                          color: category.color,
                          transform: 'translateX(4px)'
                        }
                      }} />
                    </Box>
                  </CardActionArea>

                  {/* Details toggle (for pieces category only) */}
                  {category.id === 'pieces' && renderCategoryDetails(category.id) && (
                    <Box sx={{
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      px: 2.5,
                      py: 1
                    }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCategory(category.id)
                        }}
                        endIcon={isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        sx={{
                          color: '#64748B',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                        }}
                      >
                        {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                      </Button>
                    </Box>
                  )}
                </Card>

                {/* Collapsible details panel */}
                <Collapse in={isExpanded && category.id === 'pieces'}>
                  <Box sx={{ mt: 2, ml: 1 }}>
                    <Card
                      sx={{
                        borderRadius: '12px',
                        borderLeft: `3px solid ${category.color}`,
                        bgcolor: '#FAFBFC'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {renderCategoryDetails(category.id)}
                      </CardContent>
                    </Card>
                  </Box>
                </Collapse>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Paper>
  )
}
