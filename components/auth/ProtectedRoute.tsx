'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Box, CircularProgress, Typography } from '@mui/material'

const PUBLIC_ROUTES = ['/login', '/signup']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const locale = pathname?.split('/')[1] || 'en'

  // Check if current path (without locale) is a public route
  const pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/'
  const isPublicRoute = PUBLIC_ROUTES.includes(pathWithoutLocale)

  useEffect(() => {
    // Only redirect if not on a public route
    if (!loading && !user && !isPublicRoute) {
      router.push(`/${locale}/login`)
    }
  }, [user, loading, isPublicRoute, locale, router])

  // Show loading spinner while checking auth (but not on public routes)
  if (loading && !isPublicRoute) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    )
  }

  // If no user and not on public route, don't render (will redirect)
  if (!user && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}
