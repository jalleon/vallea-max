'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { Box, CircularProgress, Typography } from '@mui/material'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requiredRole?: 'admin' | 'appraiser' | 'viewer'
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If auth is required but user is not authenticated
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // If user is authenticated but shouldn't be (login/signup pages)
    if (!requireAuth && user) {
      router.push('/dashboard')
      return
    }

    // Check role requirements
    if (user && requiredRole) {
      const roleHierarchy = {
        admin: 3,
        appraiser: 2,
        viewer: 1
      }

      const userRoleLevel = roleHierarchy[user.role]
      const requiredRoleLevel = roleHierarchy[requiredRole]

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, requireAuth, requiredRole, redirectTo, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    )
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null
  }

  // If auth is not required but user is authenticated, don't render children
  if (!requireAuth && user) {
    return null
  }

  // If role is required but user doesn't have sufficient permissions
  if (user && requiredRole) {
    const roleHierarchy = {
      admin: 3,
      appraiser: 2,
      viewer: 1
    }

    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
        >
          <Typography variant="h6" color="error">
            Accès non autorisé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </Typography>
        </Box>
      )
    }
  }

  return <>{children}</>
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}