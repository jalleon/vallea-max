'use client'

import React from 'react'
import { Box, Paper, Typography, CircularProgress } from '@mui/material'
import { SvgIconComponent } from '@mui/icons-material'

interface CategoryHeaderProps {
  categoryName: string
  categoryColor: string
  categoryIcon: SvgIconComponent
  progress: number
  completedItems?: number
  totalItems?: number
  subtitle?: string
  roomCounts?: {
    bedrooms: number
    bathrooms: number
    powderRooms: number
    totalRooms: number
  }
}

export function CategoryHeader({
  categoryName,
  categoryColor,
  categoryIcon: Icon,
  progress,
  completedItems,
  totalItems,
  subtitle,
  roomCounts
}: CategoryHeaderProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', mb: 3, border: '1px solid', borderColor: 'divider' }}>
      {/* Layered & Depth Header - Waves + Topology + Floating Orbs */}
      <Box
        sx={{
          position: 'relative',
          p: 3,
          color: 'white',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 50%, ${categoryColor}bb 100%)`
        }}
      >
        {/* Layer 1: Layered waves - Stacked semi-transparent curves */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse 150% 80% at 50% 120%, ${categoryColor}80 0%, transparent 50%),
              radial-gradient(ellipse 140% 70% at 50% 110%, ${categoryColor}66 0%, transparent 50%),
              radial-gradient(ellipse 130% 60% at 50% 100%, ${categoryColor}59 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Layer 2: 3D Topology map - Contour lines */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-radial-gradient(circle at 30% 40%, transparent 0px, transparent 30px, rgba(255,255,255,0.12) 30px, rgba(255,255,255,0.12) 31px),
              repeating-radial-gradient(circle at 70% 60%, transparent 0px, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 41px)
            `,
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        {/* Layer 3: Floating particles/orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle 60px at 15% 25%, rgba(255, 255, 255, 0.15), transparent),
              radial-gradient(circle 80px at 85% 70%, rgba(255, 255, 255, 0.12), transparent),
              radial-gradient(circle 50px at 50% 15%, rgba(255, 255, 255, 0.1), transparent),
              radial-gradient(circle 70px at 75% 85%, rgba(255, 255, 255, 0.08), transparent),
              radial-gradient(circle 40px at 25% 75%, rgba(255, 255, 255, 0.1), transparent)
            `,
            pointerEvents: 'none',
            zIndex: 3
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* Large Category Icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon sx={{ fontSize: 56, color: 'white' }} />
          </Box>

          {/* Title and Timeline Indicators */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#FCD34D', mb: 1 }}>
              {categoryName}
            </Typography>
            {subtitle && (
              <Typography variant="body1" sx={{ color: 'white', mb: 2, opacity: 0.95 }}>
                {subtitle}
              </Typography>
            )}
            {roomCounts ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {roomCounts.bedrooms > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                      {roomCounts.bedrooms}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      chambres
                    </Typography>
                  </Box>
                )}
                {roomCounts.bathrooms > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                      {roomCounts.bathrooms}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      sdb
                    </Typography>
                  </Box>
                )}
                {roomCounts.powderRooms > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                      {roomCounts.powderRooms}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      sde
                    </Typography>
                  </Box>
                )}
                {roomCounts.totalRooms > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                      {roomCounts.totalRooms}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      pièces
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : completedItems !== undefined && totalItems !== undefined ? (
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                  {completedItems}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                  / {totalItems} complété{completedItems !== 1 ? 's' : ''}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
