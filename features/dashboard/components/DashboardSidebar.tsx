'use client'

import { usePathname } from 'next/navigation'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip
} from '@mui/material'
import {
  Dashboard,
  Home,
  Assessment,
  Tune,
  CloudUpload,
  Description,
  Settings,
  FileUpload
} from '@mui/icons-material'
import Link from 'next/link'

interface DashboardSidebarProps {
  onClose?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  disabled?: boolean
}

const navigation: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: 'Bibliothèque',
    href: '/library',
    icon: <Home />,
  },
  {
    title: 'Importer',
    href: '/import',
    icon: <FileUpload />,
  },
  {
    title: 'Évaluations',
    href: '/appraisals',
    icon: <Assessment />,
  },
  {
    title: 'Ajustements',
    href: '/adjustments',
    icon: <Tune />,
    disabled: true,
  },
  {
    title: 'Stockage',
    href: '/storage',
    icon: <CloudUpload />,
    disabled: true,
  },
  {
    title: 'Rapports',
    href: '/reports',
    icon: <Description />,
    disabled: true,
  },
]

const bottomNavigation: NavItem[] = [
  {
    title: 'Paramètres',
    href: '/settings',
    icon: <Settings />,
  },
]

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleItemClick = () => {
    onClose?.()
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Vallea Max
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Plateforme d'évaluation
        </Typography>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 2 }}>
          {navigation.map((item) => (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={item.disabled ? 'div' : Link}
                href={item.disabled ? undefined : item.href}
                onClick={handleItemClick}
                disabled={item.disabled}
                selected={isActive(item.href)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.href) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.href) ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
                {item.disabled && (
                  <Chip
                    label="Bientôt"
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.6rem' }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Navigation */}
      <Box>
        <Divider />
        <List sx={{ px: 2, py: 1 }}>
          {bottomNavigation.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={handleItemClick}
                selected={isActive(item.href)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.href) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.href) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}