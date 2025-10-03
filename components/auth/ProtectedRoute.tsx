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

  useEffect(() => {
    // Only redirect if not on a public route
    if (!loading && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  // Show loading spinner while checking auth (but not on public routes)
  if (loading && !PUBLIC_ROUTES.includes(pathname)) {
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
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
