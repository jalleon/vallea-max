'use client'

import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { theme } from '../theme/theme'

export function ValleaThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}