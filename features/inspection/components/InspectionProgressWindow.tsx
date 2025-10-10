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
  Assessment
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { Property } from '@/features/library/types/property.types'

interface InspectionProgressWindowProps {
  property: Property
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

export function InspectionProgressWindow({ property }: InspectionProgressWindowProps) {
  const t = useTranslations('inspection.progress')
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
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

  const renderPiecesDetails = () => {
    if (!property.inspection_pieces?.floors) return null

    return (
      <Box sx={{ pl: 4, mt: 1 }}>
        {Object.entries(property.inspection_pieces.floors).map(([floorId, floor]) => {
          const totalRooms = Object.keys(floor.rooms || {}).length
          const completedRooms = Object.values(floor.rooms || {}).filter(
            (room: any) => room.completedAt
          ).length

          return (
            <Box key={floorId} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                {floor.name}
              </Typography>
              {Object.entries(floor.rooms || {}).map(([roomId, roomData]: [string, any]) => {
                if (!roomData.completedAt) return null

                return (
                  <Box key={roomId} sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {roomData.type}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {Object.entries(roomData).map(([key, value]) => {
                        if (key === 'type' || key === 'completedAt' || key === 'customValues') return null
                        if (Array.isArray(value) && value.length > 0) {
                          return (
                            <Chip
                              key={key}
                              label={`${key}: ${value.join(', ')}`}
                              size="small"
                              sx={{ fontSize: '11px' }}
                            />
                          )
                        } else if (value && !Array.isArray(value)) {
                          return (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              sx={{ fontSize: '11px' }}
                            />
                          )
                        }
                        return null
                      })}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </Box>
    )
  }

  const renderCategoryDetails = (categoryId: string) => {
    if (categoryId === 'pieces') {
      return renderPiecesDetails()
    }

    // For other categories, show JSONB data if available
    const categoryData = (property as any)[`inspection_${categoryId}`]
    if (!categoryData) return null

    return (
      <Box sx={{ pl: 4, mt: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {Object.entries(categoryData).map(([key, value]) => (
            <Chip
              key={key}
              label={`${key}: ${value}`}
              size="small"
              sx={{ fontSize: '11px' }}
            />
          ))}
        </Box>
      </Box>
    )
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
      {/* Header with collapse button */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('title')}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary">
            {overallProgress}%
          </Typography>
        </Box>
        <IconButton size="small">
          {isCollapsed ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
        </IconButton>
      </Box>

      {/* Progress bar - always visible */}
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
      </Box>

      {/* Collapsible category details */}
      <Collapse in={!isCollapsed}>
        <Box sx={{ p: 2, pt: 0 }}>
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            const isCompleted = isCategoryCompleted(category.id)
            const isExpanded = expandedCategories.includes(category.id)

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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleCategory(category.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon sx={{ fontSize: 20, color: category.color }} />
                    <Typography variant="body1" fontWeight={600}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({category.weight > 0 ? `${category.weight * 100}%` : 'optionnel'})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={isCompleted ? 'Complété' : 'Non commencé'}
                      size="small"
                      color={isCompleted ? 'success' : 'default'}
                      icon={isCompleted ? <CheckCircle sx={{ fontSize: 16 }} /> : undefined}
                    />
                    <IconButton size="small">
                      {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={isExpanded}>
                  {renderCategoryDetails(category.id)}
                </Collapse>
              </Box>
            )
          })}
        </Box>
      </Collapse>
    </Paper>
  )
}
