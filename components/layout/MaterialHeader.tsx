'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  AccountCircle,
  Business,
  Logout,
  Person
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface MaterialHeaderProps {
  onMenuClick: () => void
  drawerWidth: number
  mobileOpen: boolean
}

export function MaterialHeader({ onMenuClick, drawerWidth, mobileOpen }: MaterialHeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  // Get user initials for avatar
  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || 'U'

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
            <Image
              src="/logo.png"
              alt="Valea Max Logo"
              width={40}
              height={40}
              style={{ borderRadius: '8px' }}
            />
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                Valea Max
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

          <Tooltip title="Compte">
            <IconButton onClick={handleMenuOpen} sx={{ ml: 2, p: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {userInitials}
                </Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mon profil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Paramètres</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Déconnexion</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}