'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { AuthContextType, AuthUser, SignUpCredentials, SignInCredentials, ResetPasswordCredentials, UpdatePasswordCredentials, UpdateProfileData } from '../types/auth.types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (credentials: SignUpCredentials) => {
    // Mock implementation for demo
    setLoading(true)
    setTimeout(() => {
      setUser({
        id: '1',
        email: credentials.email,
        full_name: credentials.full_name,
        organization_id: '1',
        role: 'admin',
        preferences: { language: 'fr', currency: 'CAD', theme: 'light' },
        created_at: new Date().toISOString()
      })
      setLoading(false)
    }, 1000)
  }

  const signIn = async (credentials: SignInCredentials) => {
    // Mock implementation for demo
    setLoading(true)
    setTimeout(() => {
      setUser({
        id: '1',
        email: credentials.email,
        full_name: 'Utilisateur Demo',
        organization_id: '1',
        role: 'admin',
        preferences: { language: 'fr', currency: 'CAD', theme: 'light' },
        created_at: new Date().toISOString()
      })
      setLoading(false)
    }, 1000)
  }

  const signOut = async () => {
    setUser(null)
  }

  const resetPassword = async (credentials: ResetPasswordCredentials) => {
    // Mock implementation
  }

  const updatePassword = async (credentials: UpdatePasswordCredentials) => {
    // Mock implementation
  }

  const updateProfile = async (data: UpdateProfileData) => {
    // Mock implementation
    if (user) {
      setUser({ ...user, ...data })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Convenience hooks
export function useUser() {
  const { user } = useAuth()
  return user
}

export function useSession() {
  const { user, loading } = useAuth()
  return { user, loading, isAuthenticated: !!user }
}