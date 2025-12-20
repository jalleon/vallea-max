'use client'

import React, { useState } from 'react'
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Box
} from '@mui/material'
import {
  Layers,
  Home,
  DirectionsCar,
  Settings,
  Build,
  Landscape,
  GridView
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface InspectionFloatingNavProps {
  inspectionId: string
  currentCategory?: string
}

const INSPECTION_CATEGORIES = [
  {
    id: 'pieces',
    icon: Layers,
    color: '#2196F3',
    weight: 25
  },
  {
    id: 'batiment',
    icon: Home,
    color: '#FF9800',
    weight: 25
  },
  {
    id: 'garage',
    icon: DirectionsCar,
    color: '#4CAF50',
    weight: 15
  },
  {
    id: 'mecanique',
    icon: Settings,
    color: '#9C27B0',
    weight: 15
  },
  {
    id: 'exterieur',
    icon: Landscape,
    color: '#795548',
    weight: 20
  },
  {
    id: 'divers',
    icon: Build,
    color: '#607D8B',
    weight: 0
  }
]

export function InspectionFloatingNav({ inspectionId, currentCategory }: InspectionFloatingNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('inspection.categories')
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleNavigate = (categoryId: string) => {
    // Extract locale from pathname (e.g., /fr/inspection/... or /en/inspection/...)
    const locale = pathname?.split('/')[1] || 'fr'
    router.push(`/${locale}/inspection/${inspectionId}/${categoryId}`)
    handleClose()
  }

  // Extract locale from pathname
  const locale = pathname?.split('/')[1] || 'fr'

  // Don't show on main inspection page or category list page
  if (pathname === `/${locale}/inspection/${inspectionId}` || pathname?.includes('/categories')) {
    return null
  }

  return (
    <SpeedDial
      ariaLabel="Navigation entre catégories"
      sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 24 }, // Higher on mobile to avoid browser UI
        right: 24,
        // Only show on tablet/mobile (inspection is tablet-optimized)
        display: { xs: 'flex', md: 'flex' },
        '& .MuiSpeedDial-fab': {
          width: 56,
          height: 56,
          bgcolor: '#16a34a', // Green to match inspection theme
          color: 'white',
          boxShadow: 3,
          '&:hover': {
            bgcolor: '#15803d',
            boxShadow: 6
          }
        },
        '& .MuiSpeedDialAction-fab': {
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4
          }
        }
      }}
      icon={<SpeedDialIcon icon={<GridView />} />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="up"
    >
      {INSPECTION_CATEGORIES.map((category) => {
        const Icon = category.icon
        const isActive = currentCategory === category.id || pathname?.includes(`/${category.id}`)

        return (
          <SpeedDialAction
            key={category.id}
            icon={
              <Icon
                sx={{
                  fontSize: 24,
                  color: isActive ? 'white' : category.color
                }}
              />
            }
            tooltipTitle={
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ fontWeight: 600 }}>{t(category.id)}</Box>
                {category.weight > 0 && (
                  <Box sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {category.weight}%
                  </Box>
                )}
              </Box>
            }
            onClick={() => handleNavigate(category.id)}
            sx={{
              bgcolor: isActive ? category.color : 'white',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: isActive ? category.color : `${category.color}15`
              },
              '& .MuiSpeedDialAction-staticTooltipLabel': {
                whiteSpace: 'nowrap',
                fontWeight: 600,
                minWidth: '120px'
              }
            }}
          />
        )
      })}
    </SpeedDial>
  )
}
