'use client'

import Image from 'next/image'
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
  Settings,
  Extension
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
    { id: 'settings', icon: HealthAndSafety, labelFr: 'Santé système', labelEn: 'System Health' },
    { id: 'integrations', icon: Extension, labelFr: 'Intégrations', labelEn: 'Integrations' }
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
          borderRight: '1px solid rgba(148, 163, 184, 0.35)',
          backgroundImage: `
            linear-gradient(160deg, rgba(59, 130, 246, 0.96) 0%, rgba(37, 99, 235, 0.96) 50%, rgba(30, 64, 175, 0.94) 100%),
            repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0px, rgba(255, 255, 255, 0.08) 2px, transparent 2px, transparent 12px),
            radial-gradient(120% 140% at 100% 100%, rgba(14, 82, 200, 0.4) 0%, rgba(14, 82, 200, 0) 65%),
            radial-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: 'cover, 260px 260px, 120% 120%, 60px 60px',
          backgroundPosition: 'center, 0 0, 100% 100%, 14px 14px',
          backgroundBlendMode: 'overlay, overlay, normal, overlay',
          boxShadow: '4px 0 24px rgba(15, 23, 42, 0.08)',
          borderRadius: 0
        }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Image
          src="/logo.png"
          alt="Valea Max"
          width={48}
          height={48}
          style={{ borderRadius: '8px' }}
        />
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'var(--font-montserrat)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            Valea Max
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 400,
              color: '#4A5568',
              fontSize: '0.7rem',
              letterSpacing: '0.03em',
              display: 'block',
              mt: -0.5,
            }}
          >
            {locale === 'fr' ? 'Admin - Panneau de contrôle' : 'Admin - Control Panel'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          const texturedGradient = `
            linear-gradient(135deg, rgba(224, 242, 255, 0.75) 0%, rgba(191, 219, 254, 0.75) 100%),
            radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px),
            radial-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px)
          `
          const activeGradient = `
            linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%),
            radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            radial-gradient(rgba(30, 64, 175, 0.25) 1px, transparent 1px)
          `

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => onSectionChange(item.id)}
                sx={{
                  borderRadius: '12px',
                  px: 2,
                  py: 1.4,
                  color: '#1E293B',
                  backgroundImage: texturedGradient,
                  backgroundSize: 'cover, 24px 24px, 60px 60px',
                  backgroundPosition: 'center, 0 0, 12px 12px',
                  backgroundBlendMode: 'overlay',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.45)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 12px 20px rgba(30, 64, 175, 0.18)',
                    backgroundImage: `
                      linear-gradient(135deg, rgba(191, 219, 254, 0.95) 0%, rgba(147, 197, 253, 0.95) 100%),
                      radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px),
                      radial-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                    `
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#FFFFFF' : '#3B82F6',
                    transition: 'color 0.18s ease'
                  },
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    color: '#FFFFFF',
                    backgroundImage: activeGradient,
                    backgroundSize: 'cover, 24px 24px, 60px 60px',
                    backgroundPosition: 'center, 0 0, 12px 12px',
                    backgroundBlendMode: 'overlay',
                    boxShadow: '0 14px 26px rgba(30, 64, 175, 0.28)',
                    '& .MuiListItemIcon-root': {
                      color: '#FFFFFF'
                    },
                    '&:hover': {
                      backgroundImage: activeGradient
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#FFFFFF' : '#1D4ED8' }}>
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
