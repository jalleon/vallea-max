'use client'

import { Card, CardContent, Box, Typography } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    label: string
  }
  subtitle?: string
}

export default function MetricCard({ title, value, icon, color, trend, subtitle }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ color, fontSize: 28 }}>{icon}</Box>
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend.value >= 0 ? (
                <TrendingUp sx={{ fontSize: 20, color: '#10B981' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 20, color: '#EF4444' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend.value >= 0 ? '#10B981' : '#EF4444',
                  fontWeight: 600
                }}
              >
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>

        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: trend ? 0.5 : 0 }}>
          {title}
        </Typography>

        {trend && (
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            {trend.label}
          </Typography>
        )}

        {subtitle && (
          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
