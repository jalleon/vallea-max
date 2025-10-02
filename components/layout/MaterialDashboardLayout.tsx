'use client'

import React, { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { MaterialHeader } from './MaterialHeader'
import { MaterialSidebar } from './MaterialSidebar'

const drawerWidth = 280

interface MaterialDashboardLayoutProps {
  children: React.ReactNode
}

export function MaterialDashboardLayout({ children }: MaterialDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <MaterialHeader
        onMenuClick={handleDrawerToggle}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
      />

      <MaterialSidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
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