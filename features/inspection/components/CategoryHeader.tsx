'use client'

import React from 'react'
import { Box, Paper, Typography, keyframes } from '@mui/material'
import { SvgIconComponent } from '@mui/icons-material'
import { Bed, Bathtub, Shower, MeetingRoom } from '@mui/icons-material'

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

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`

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
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        mb: 3,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        animation: `${fadeInUp} 0.6s ease-out`
      }}
    >
      {/* Premium Dark Header */}
      <Box
        sx={{
          position: 'relative',
          p: { xs: 3, md: 4 },
          color: 'white',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          minHeight: 160
        }}
      >
        {/* Animated gradient mesh background */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, ${categoryColor}40 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 60%, ${categoryColor}30 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 50% 80%, ${categoryColor}20 0%, transparent 50%)
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
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 3, md: 4 },
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}
        >
          {/* Icon Container with Glow */}
          <Box
            sx={{
              position: 'relative',
              animation: `${scaleIn} 0.5s ease-out 0.2s both`
            }}
          >
            {/* Glow effect */}
            <Box
              sx={{
                position: 'absolute',
                inset: -8,
                borderRadius: '24px',
                background: `radial-gradient(circle, ${categoryColor}50 0%, transparent 70%)`,
                filter: 'blur(16px)',
                animation: `${pulse} 3s ease-in-out infinite`
              }}
            />
            <Box
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}cc 100%)`,
                boxShadow: `0 8px 32px ${categoryColor}40`
              }}
            >
              <Icon sx={{ fontSize: 44, color: 'white' }} />
            </Box>
          </Box>

          {/* Title and Stats */}
          <Box
            sx={{
              flex: 1,
              animation: `${fadeInUp} 0.6s ease-out 0.3s both`
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '24px', md: '28px' },
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
                mb: 0.5,
                lineHeight: 1.2
              }}
            >
              {categoryName}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  mb: 2
                }}
              >
                {subtitle}
              </Typography>
            )}

            {/* Room counts or completion stats */}
            {roomCounts ? (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {[
                  { icon: Bed, count: roomCounts.bedrooms, label: 'chambres', color: '#3B82F6' },
                  { icon: Bathtub, count: roomCounts.bathrooms, label: 'sdb', color: '#8B5CF6' },
                  { icon: Shower, count: roomCounts.powderRooms, label: 'sde', color: '#10B981' },
                  { icon: MeetingRoom, count: roomCounts.totalRooms, label: 'pièces', color: '#F59E0B' }
                ].filter(item => item.count > 0).map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.75,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <item.icon sx={{ fontSize: 16, color: item.color }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
                      {item.count}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : completedItems !== undefined && totalItems !== undefined ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: completedItems === totalItems ? '#10B981' : categoryColor
                  }}
                />
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                  {completedItems}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  / {totalItems} complété{completedItems !== 1 ? 's' : ''}
                </Typography>
              </Box>
            ) : null}
          </Box>

          {/* Progress Ring */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${scaleIn} 0.5s ease-out 0.4s both`
            }}
          >
            {/* Circular progress background */}
            <Box
              sx={{
                position: 'relative',
                width: 72,
                height: 72
              }}
            >
              <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  stroke={categoryColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 188.5} 188.5`}
                  style={{
                    filter: `drop-shadow(0 0 8px ${categoryColor}80)`,
                    transition: 'stroke-dasharray 0.5s ease-out'
                  }}
                />
              </svg>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {progress}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
