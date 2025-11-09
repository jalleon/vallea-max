'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  const [profileFetchPromise, setProfileFetchPromise] = useState<Promise<UserProfile | null> | null>(null)
  const currentUserIdRef = useRef<string | null>(null)

  // Function to fetch user profile from database with deduplication
  const fetchProfile = async (userId: string) => {
    // If profile already exists and matches the userId, return it
    if (profile?.id === userId) {
      return profile
    }

    // If there's already a fetch in progress for this user, return that promise
    if (profileFetchPromise) {
      return profileFetchPromise
    }

    // Create and store the promise to prevent duplicate fetches
    const promise = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, organization_id, is_admin')
          .eq('id', userId)
          .single()

        if (!error && data) {
          const profileData = data as UserProfile
          setProfile(profileData)
          setProfileFetchPromise(null) // Clear the promise after completion
          return profileData
        }
      } catch (err) {
        console.error('[AuthContext] Error fetching profile:', err)
      }
      setProfileFetchPromise(null) // Clear the promise on error
      return null
    })()

    setProfileFetchPromise(promise)
    return promise
  }

  // Function to refresh the current user's profile
  const refreshProfile = async () => {
    if (user?.id) {
      // Clear the cached profile to force a fresh fetch
      setProfile(null)
      setProfileFetchPromise(null)
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
        currentUserIdRef.current = session.user.id
        await fetchProfile(session.user.id)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const prevUserId = currentUserIdRef.current
      const newUserId = session?.user?.id

      setSession(session)
      setUser(session?.user ?? null)

      // Only fetch profile if user ID has changed
      if (newUserId && newUserId !== prevUserId) {
        currentUserIdRef.current = newUserId
        await fetchProfile(newUserId)
      } else if (!newUserId) {
        currentUserIdRef.current = null
        setProfile(null)
        setProfileFetchPromise(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Explicitly fetch profile to ensure it's ready before navigation
      // The deduplication logic will prevent duplicate fetches if onAuthStateChange also triggers
      if (data.user?.id) {
        currentUserIdRef.current = data.user.id
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
