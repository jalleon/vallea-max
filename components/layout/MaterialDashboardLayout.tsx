'use client'

import React, { useState, useEffect } from 'react'
import { Box, Toolbar } from '@mui/material'
import { MaterialHeader } from './MaterialHeader'
import { MaterialSidebar } from './MaterialSidebar'

const drawerWidth = 280
const miniDrawerWidth = 80

interface MaterialDashboardLayoutProps {
  children: React.ReactNode
}

export function MaterialDashboardLayout({ children }: MaterialDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  // Load saved preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('sidebarCollapsed')
    if (savedPreference !== null) {
      setDesktopCollapsed(savedPreference === 'true')
    }
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleDesktopToggle = () => {
    const newState = !desktopCollapsed
    setDesktopCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const currentDrawerWidth = desktopCollapsed ? miniDrawerWidth : drawerWidth

  return (
    <Box sx={{ display: 'flex' }}>
      <MaterialHeader
        onMenuClick={handleDrawerToggle}
        drawerWidth={currentDrawerWidth}
        mobileOpen={mobileOpen}
      />

      <MaterialSidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
        drawerWidth={drawerWidth}
        miniDrawerWidth={miniDrawerWidth}
        desktopCollapsed={desktopCollapsed}
        onDesktopToggle={handleDesktopToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: 'width 0.3s ease-in-out'
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}