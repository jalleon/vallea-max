'use client'

import React, { useState } from 'react'
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material'
import { Layers, Home, DirectionsCar, Settings, Build, Landscape, GridView } from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface InspectionFloatingNavProps {
  inspectionId: string
  currentCategory?: string
}

const INSPECTION_CATEGORIES = [
  { id: 'pieces', icon: Layers, color: '#2196F3', weight: 25 },
  { id: 'batiment', icon: Home, color: '#FF9800', weight: 25 },
  { id: 'garage', icon: DirectionsCar, color: '#4CAF50', weight: 15 },
  { id: 'mecanique', icon: Settings, color: '#9C27B0', weight: 15 },
  { id: 'exterieur', icon: Landscape, color: '#795548', weight: 20 },
  { id: 'divers', icon: Build, color: '#607D8B', weight: 0 }
]

export function InspectionFloatingNav({ inspectionId, currentCategory }: InspectionFloatingNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('inspection.categories')
  const [open, setOpen] = useState(false)

  // Extract locale from pathname (e.g., /fr/inspection/... or /en/inspection/...)
  const locale = pathname.split('/')[1]

  // Don't show on main inspection page or category list page
  if (pathname === `/${locale}/inspection/${inspectionId}` || pathname.includes('/categories')) {
    return null
  }

  return (
    <SpeedDial
      ariaLabel="Navigation entre catégories"
      sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 24 }, // Higher on mobile to avoid browser UI
        right: 24,
        '& .MuiSpeedDial-fab': {
          width: 56,
          height: 56,
          bgcolor: '#16a34a', // Green to match inspection theme
          color: 'white',
          boxShadow: 3,
          '&:hover': { bgcolor: '#15803d', boxShadow: 6 }
        },
        '& .MuiSpeedDialAction-fab': {
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4
          }
        }
      }}
      icon={<SpeedDialIcon icon={<GridView />} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      direction="up"
    >
      {INSPECTION_CATEGORIES.map((category) => {
        const Icon = category.icon
        const isActive = currentCategory === category.id

        return (
          <SpeedDialAction
            key={category.id}
            icon={<Icon sx={{ fontSize: 24, color: isActive ? 'white' : category.color }} />}
            tooltipTitle={t(category.id)}
            onClick={() => router.push(`/${locale}/inspection/${inspectionId}/${category.id}`)}
            sx={{
              bgcolor: isActive ? category.color : 'white',
              '&:hover': { bgcolor: isActive ? category.color : `${category.color}15` }
            }}
          />
        )
      })}
    </SpeedDial>
  )
}
