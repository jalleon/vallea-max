'use client'

import React from 'react'
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
  alpha
} from '@mui/material'
import {
  Dashboard,
  LibraryBooks,
  Assessment,
  Balance,
  Description,
  TrendingUp,
  Home,
  Analytics
} from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'

const menuItems = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: Dashboard,
    path: '/dashboard',
    description: 'Vue d\'ensemble et analytiques'
  },
  {
    id: 'library',
    label: 'Bibliothèque',
    icon: LibraryBooks,
    path: '/library',
    description: 'Gestion des propriétés'
  },
  {
    id: 'evaluations',
    label: 'Évaluations',
    icon: Assessment,
    path: '/evaluations',
    description: 'RPS, NAS et personnalisées'
  },
  {
    id: 'adjustments',
    label: 'Ajustements',
    icon: Balance,
    path: '/adjustments',
    description: 'Calculs comparatifs'
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: Description,
    path: '/reports',
    description: 'Documents professionnels'
  }
]

interface MaterialSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  drawerWidth: number
}

export function MaterialSidebar({ mobileOpen, onMobileClose, drawerWidth }: MaterialSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleItemClick = (path: string) => {
    router.push(path)
    onMobileClose()
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box sx={{ p: 3, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            V
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
              Vallea Max
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Version 2.0 Pro
            </Typography>
          </Box>
        </Box>

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
              Performance du mois
            </Typography>
          </Box>
          <Typography variant="h6" color="primary" fontWeight={700}>
            +15.3%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            12 évaluations complétées
          </Typography>
        </Paper>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, px: 2, py: 1 }}>
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
          Navigation
        </Typography>

        <List>
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
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
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                      minWidth: 40
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
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
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Paper
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            textAlign: 'center'
          }}
        >
          <Home color="primary" sx={{ mb: 1 }} />
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Évaluation Immobilière
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Plateforme professionnelle certifiée
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label="Certifié OEQ"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth
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
            width: drawerWidth
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  )
}