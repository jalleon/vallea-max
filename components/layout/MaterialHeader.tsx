'use client'

import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  Person,
  Language,
  ChevronRight,
  Key
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import AiApiKeysDialog from '@/features/user-settings/components/AiApiKeysDialog'
import { BackgroundImportIndicator } from '@/components/import/BackgroundImportIndicator'

interface MaterialHeaderProps {
  onMenuClick: () => void
  drawerWidth: number
  mobileOpen: boolean
}

export function MaterialHeader({ onMenuClick, drawerWidth, mobileOpen }: MaterialHeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null)
  const [apiKeysDialogOpen, setApiKeysDialogOpen] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSettingsAnchorEl(null)
  }

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setSettingsAnchorEl(event.currentTarget)
  }

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname
    const segments = currentPath.split('/')

    // Replace the locale segment
    if (segments[1] === 'en' || segments[1] === 'fr') {
      segments[1] = newLocale
    } else {
      // If no locale in path, add it
      segments.unshift('', newLocale)
    }

    const newPath = segments.join('/').replace('//', '/')
    router.push(newPath)
    handleSettingsClose()
    handleMenuClose()
  }

  const handleOpenApiKeysDialog = () => {
    setApiKeysDialogOpen(true)
    handleSettingsClose()
    handleMenuClose()
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
        transition: 'all 0.3s ease-in-out',
        borderRadius: 0
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <BackgroundImportIndicator />
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Compte">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {userInitials}
                </Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1, mb: '-3px' }}>
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1, display: 'block' }}>
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
            <MenuItem onClick={handleSettingsOpen}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Paramètres</ListItemText>
              <ChevronRight fontSize="small" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Déconnexion</ListItemText>
            </MenuItem>
          </Menu>

          {/* Settings submenu */}
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsClose}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            <MenuItem disabled>
              <ListItemIcon>
                <Language fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Langue / Language" />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => handleLanguageChange('fr')}
              selected={locale === 'fr'}
            >
              <ListItemText inset>Français</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleLanguageChange('en')}
              selected={locale === 'en'}
            >
              <ListItemText inset>English</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleOpenApiKeysDialog}>
              <ListItemIcon>
                <Key fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('menu.aiApiKeys')} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <AiApiKeysDialog
        open={apiKeysDialogOpen}
        onClose={() => setApiKeysDialogOpen(false)}
      />
    </AppBar>
  )
}