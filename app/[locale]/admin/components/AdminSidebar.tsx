'use client'

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider
} from '@mui/material'
import {
  Dashboard,
  People,
  CreditCard,
  RequestPage,
  Mail,
  Analytics,
  HealthAndSafety,
  Settings
} from '@mui/icons-material'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  locale: string
}

const SIDEBAR_WIDTH = 280

export default function AdminSidebar({ activeSection, onSectionChange, locale }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: Dashboard, labelFr: 'Tableau de bord', labelEn: 'Dashboard' },
    { id: 'users', icon: People, labelFr: 'Utilisateurs', labelEn: 'Users' },
    { id: 'subscriptions', icon: CreditCard, labelFr: 'Abonnements', labelEn: 'Subscriptions' },
    { id: 'demos', icon: RequestPage, labelFr: 'Demandes démo', labelEn: 'Demo Requests' },
    { id: 'waitlist', icon: Mail, labelFr: 'Liste d\'attente', labelEn: 'Waitlist' },
    { id: 'analytics', icon: Analytics, labelFr: 'Analytique', labelEn: 'Analytics' },
    { id: 'health', icon: HealthAndSafety, labelFr: 'Santé système', labelEn: 'System Health' },
    { id: 'settings', icon: Settings, labelFr: 'Paramètres', labelEn: 'Settings' }
  ]

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0,0,0,0.12)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
          Valea Max
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          Admin Panel
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => onSectionChange(item.id)}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    '& .MuiListItemIcon-root': {
                      color: '#FFFFFF'
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#FFFFFF' : '#6B7280' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={locale === 'fr' ? item.labelFr : item.labelEn}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Drawer>
  )
}
