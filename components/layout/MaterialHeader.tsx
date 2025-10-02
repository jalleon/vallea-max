'use client'

import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Chip
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  AccountCircle,
  Business
} from '@mui/icons-material'

interface MaterialHeaderProps {
  onMenuClick: () => void
  drawerWidth: number
  mobileOpen: boolean
}

export function MaterialHeader({ onMenuClick, drawerWidth, mobileOpen }: MaterialHeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${mobileOpen ? 0 : drawerWidth}px)` },
        ml: { sm: `${mobileOpen ? 0 : drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              V
            </Box>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                Vallea Max
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Évaluation Immobilière Pro
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<Business />}
            label="Évaluateur Agréé"
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 2 }}
          />

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Paramètres">
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <AccountCircle />
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Jean Dupont
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Évaluateur Principal
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}