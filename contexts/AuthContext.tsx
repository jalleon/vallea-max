'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  organization_id: string | null
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string, organizationId?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, organization_id, is_admin')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data as UserProfile)
        return data as UserProfile
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching profile:', err)
    }
    return null
  }

  // Function to refresh the current user's profile
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Fetch profile from database
      if (session?.user?.id) {
        await fetchProfile(session.user.id)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Fetch profile when user changes
      if (session?.user?.id) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[AuthContext] Sign in error:', error)
        return { error }
      }

      console.log('[AuthContext] Sign in successful:', data.user?.email)
      console.log('[AuthContext] Session:', data.session ? 'established' : 'none')

      // Fetch profile after successful sign in
      if (data.user?.id) {
        await fetchProfile(data.user.id)
      }

      return { error: null }
    } catch (err: any) {
      console.error('[AuthContext] Sign in exception:', err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string, organizationId?: string) => {
    // Use provided organizationId or get default organization
    let finalOrgId = organizationId

    if (!finalOrgId) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'Default Organization')
        .single()

      finalOrgId = (orgData as { id: string } | null)?.id
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_id: finalOrgId,
        },
      },
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
