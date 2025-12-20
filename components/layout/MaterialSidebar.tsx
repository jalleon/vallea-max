'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
  Paper,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Dashboard,
  LibraryBooks,
  Assessment,
  Balance,
  Description,
  TrendingUp,
  Home,
  Analytics,
  Search,
  ChevronLeft,
  ChevronRight,
  FileUpload,
  AdminPanelSettings
} from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface MaterialSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  drawerWidth: number
  miniDrawerWidth: number
  desktopCollapsed: boolean
  onDesktopToggle: () => void
}

export function MaterialSidebar({
  mobileOpen,
  onMobileClose,
  drawerWidth,
  miniDrawerWidth,
  desktopCollapsed,
  onDesktopToggle
}: MaterialSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('common.nav')
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single() as { data: { is_admin: boolean } | null; error: any }

        setIsAdmin(profile?.is_admin || false)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  const regularMenuItems = [
    {
      id: 'dashboard',
      label: t('dashboard.label'),
      icon: Dashboard,
      path: `/${locale}/dashboard`,
      description: t('dashboard.description')
    },
    {
      id: 'library',
      label: t('library.label'),
      icon: LibraryBooks,
      path: `/${locale}/library`,
      description: t('library.description')
    },
    {
      id: 'import',
      label: t('import.label'),
      icon: FileUpload,
      path: `/${locale}/import`,
      description: t('import.description')
    },
    {
      id: 'evaluations',
      label: t('evaluations.label'),
      icon: Assessment,
      path: `/${locale}/evaluations`,
      description: t('evaluations.description')
    },
    {
      id: 'adjustments',
      label: t('adjustments.label'),
      icon: Balance,
      path: `/${locale}/adjustments`,
      description: t('adjustments.description')
    },
    {
      id: 'reports',
      label: t('reports.label'),
      icon: Description,
      path: `/${locale}/reports`,
      description: t('reports.description')
    }
  ]

  const inspectionMenuItem = {
    id: 'inspection',
    label: t('inspection.label'),
    icon: Search,
    path: `/${locale}/inspection`
  }

  const adminMenuItem = {
    id: 'admin',
    label: locale === 'fr' ? 'Panneau Admin' : 'Admin Panel',
    icon: AdminPanelSettings,
    path: `/${locale}/admin`
  }

  const handleItemClick = (path: string) => {
    router.push(path)
    onMobileClose()
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box sx={{ p: desktopCollapsed ? 1 : 3, pt: 2 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          justifyContent: desktopCollapsed ? 'center' : 'flex-start'
        }}>
          <Image
            src="/logo.png"
            alt="Valea Max Logo"
            width={40}
            height={40}
            style={{ borderRadius: '8px' }}
          />
          {!desktopCollapsed && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Valea Max
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, display: 'block', mt: '-2px' }}>
                {t('tagline')}
              </Typography>
            </Box>
          )}
        </Box>

        {!desktopCollapsed && (
          <Paper
            sx={{
              p: 2,
              bgcolor: alpha('#1e3a8a', 0.05),
              border: '1px solid',
              borderColor: alpha('#1e3a8a', 0.1)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp color="primary" fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                {t('performance.title')}
              </Typography>
            </Box>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {t('performance.growth')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('performance.completed', { count: 12 })}
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, px: desktopCollapsed ? 0.5 : 2, py: 1, display: 'flex', flexDirection: 'column' }}>
        {!desktopCollapsed && (
          <Typography
            variant="overline"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: 1
            }}
          >
            {t('navigation')}
          </Typography>
        )}

        <List>
          {regularMenuItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon

            const listItemButton = (
              <ListItemButton
                onClick={() => handleItemClick(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isActive ? alpha('#1e3a8a', 0.1) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? alpha('#1e3a8a', 0.15) : alpha('#1e3a8a', 0.05)
                  },
                  transition: 'all 0.2s ease-in-out',
                  justifyContent: desktopCollapsed ? 'center' : 'flex-start',
                  px: desktopCollapsed ? 1 : 2
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    minWidth: desktopCollapsed ? 'unset' : 40,
                    justifyContent: 'center'
                  }}
                >
                  <Icon />
                </ListItemIcon>
                {!desktopCollapsed && (
                  <>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={isActive ? 600 : 500}
                        >
                          {item.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      }
                    />
                    {isActive && (
                      <Box
                        sx={{
                          width: 3,
                          height: 20,
                          bgcolor: 'primary.main',
                          borderRadius: 1.5
                        }}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            )

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                {desktopCollapsed ? (
                  <Tooltip title={item.label} placement="right">
                    {listItemButton}
                  </Tooltip>
                ) : (
                  listItemButton
                )}
              </ListItem>
            )
          })}
        </List>

        {/* Spacer to push inspection to bottom */}
        <Box sx={{ flex: 1 }} />

        {/* Inspection Menu Item - Green highlight for mobile/tablet use */}
        <List>
          {(() => {
            const isActive = pathname === inspectionMenuItem.path
            const Icon = inspectionMenuItem.icon

            const inspectionButton = (
              <ListItemButton
                onClick={() => handleItemClick(inspectionMenuItem.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isActive ? alpha('#16a34a', 0.2) : alpha('#16a34a', 0.08),
                  color: isActive ? '#15803d' : '#16a34a',
                  border: '1px solid',
                  borderColor: isActive ? '#16a34a' : alpha('#16a34a', 0.3),
                  '&:hover': {
                    bgcolor: alpha('#16a34a', 0.15),
                    borderColor: '#16a34a'
                  },
                  transition: 'all 0.2s ease-in-out',
                  justifyContent: desktopCollapsed ? 'center' : 'flex-start',
                  px: desktopCollapsed ? 1 : 2
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#15803d' : '#16a34a',
                    minWidth: desktopCollapsed ? 'unset' : 40,
                    justifyContent: 'center'
                  }}
                >
                  <Icon />
                </ListItemIcon>
                {!desktopCollapsed && (
                  <>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {inspectionMenuItem.label}
                        </Typography>
                      }
                    />
                    {isActive && (
                      <Box
                        sx={{
                          width: 3,
                          height: 20,
                          bgcolor: '#16a34a',
                          borderRadius: 1.5
                        }}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            )

            return (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                {desktopCollapsed ? (
                  <Tooltip title={inspectionMenuItem.label} placement="right">
                    {inspectionButton}
                  </Tooltip>
                ) : (
                  inspectionButton
                )}
              </ListItem>
            )
          })()}

          {/* Admin Panel Menu Item - Only visible to admins */}
          {isAdmin && (() => {
            const isActive = pathname === adminMenuItem.path
            const Icon = adminMenuItem.icon

            const adminButton = (
              <ListItemButton
                onClick={() => handleItemClick(adminMenuItem.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isActive ? alpha('#667eea', 0.2) : alpha('#667eea', 0.08),
                  color: isActive ? '#5a67d8' : '#667eea',
                  border: '1px solid',
                  borderColor: isActive ? '#667eea' : alpha('#667eea', 0.3),
                  '&:hover': {
                    bgcolor: alpha('#667eea', 0.15),
                    borderColor: '#667eea'
                  },
                  transition: 'all 0.2s ease-in-out',
                  justifyContent: desktopCollapsed ? 'center' : 'flex-start',
                  px: desktopCollapsed ? 1 : 2
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#5a67d8' : '#667eea',
                    minWidth: desktopCollapsed ? 'unset' : 40,
                    justifyContent: 'center'
                  }}
                >
                  <Icon />
                </ListItemIcon>
                {!desktopCollapsed && (
                  <>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {adminMenuItem.label}
                        </Typography>
                      }
                    />
                    {isActive && (
                      <Box
                        sx={{
                          width: 3,
                          height: 20,
                          bgcolor: '#667eea',
                          borderRadius: 1.5
                        }}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            )

            return (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                {desktopCollapsed ? (
                  <Tooltip title={adminMenuItem.label} placement="right">
                    {adminButton}
                  </Tooltip>
                ) : (
                  adminButton
                )}
              </ListItem>
            )
          })()}
        </List>
      </Box>

      <Divider />

      {/* Toggle Button */}
      <Box sx={{ p: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: desktopCollapsed ? 'center' : 'flex-end' }}>
        <Tooltip title={desktopCollapsed ? t('expand') : t('collapse')} placement="right">
          <IconButton onClick={onDesktopToggle} size="small">
            {desktopCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  const currentWidth = desktopCollapsed ? miniDrawerWidth : drawerWidth

  return (
    <Box
      component="nav"
      sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
          disableEnforceFocus: true,
          disableRestoreFocus: true
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRadius: 0
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentWidth,
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
            borderRadius: 0
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  )
}