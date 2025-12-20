'use client'

import React, { useState, useEffect } from 'react'
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
  const { user, profile, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null)
  const [apiKeysDialogOpen, setApiKeysDialogOpen] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false) // Hidden by default
  const [languageExpanded, setLanguageExpanded] = useState(false) // Language submenu collapsed by default

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
    router.push(`/${locale}/login`)
  }

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname || '/'
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

  // Secret keyboard shortcut to show settings menu: Ctrl+Shift+S
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        setShowSettingsMenu(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Periodically refresh profile to catch admin updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id && refreshProfile) {
        refreshProfile()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user?.id, refreshProfile])

  // Get user initials for avatar - prioritize profile over metadata
  const userFullName = profile?.full_name || user?.user_metadata?.full_name
  const userInitials = userFullName
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
        backgroundColor: '#ffffff',
        backgroundImage: `
          linear-gradient(160deg, rgba(239, 246, 255, 0.9) 0%, rgba(227, 239, 255, 0.85) 70%, rgba(210, 229, 255, 0.82) 100%),
          repeating-linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0px, rgba(59, 130, 246, 0.25) 2px, transparent 2px, transparent 18px),
          repeating-linear-gradient(315deg, rgba(59, 130, 246, 0.18) 0px, rgba(59, 130, 246, 0.18) 1px, transparent 1px, transparent 16px),
          radial-gradient(135% 165% at 100% 120%, rgba(96, 165, 250, 0.18) 0%, rgba(96, 165, 250, 0) 65%)
        `,
        backgroundSize: 'cover, 220px 220px, 260px 260px, 140% 140%',
        backgroundPosition: 'center, 0 0, 12px 12px, 100% 100%',
        backgroundBlendMode: 'normal, overlay, overlay, normal',
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.13)',
        backdropFilter: 'blur(3px)',
        color: '#1F2937',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 0
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, color: '#1F2937' }}>
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
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(96, 165, 250, 0.88)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1, mb: '-3px', color: '#1F2937' }}>
                    {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
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
            <MenuItem onClick={() => setLanguageExpanded(!languageExpanded)}>
              <ListItemIcon>
                <Language fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Langue / Language" />
              <ChevronRight
                fontSize="small"
                sx={{
                  transform: languageExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </MenuItem>
            {languageExpanded && (
              <>
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
              </>
            )}
            {showSettingsMenu && (
              <>
                <Divider />
                <MenuItem onClick={handleOpenApiKeysDialog}>
                  <ListItemIcon>
                    <Key fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.aiApiKeys')} />
                </MenuItem>
              </>
            )}
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
