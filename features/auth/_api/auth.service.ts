import { supabase } from '@/lib/supabase/client'
import {
  SignUpCredentials,
  SignInCredentials,
  ResetPasswordCredentials,
  UpdatePasswordCredentials,
  UpdateProfileData,
  AuthUser
} from '../types/auth.types'

export class AuthService {
  async signUp(credentials: SignUpCredentials) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.full_name
        }
      }
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Erreur lors de la création du compte')
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: credentials.organization_name,
        settings: { language: 'fr', currency: 'CAD' }
      })
      .select()
      .single()

    if (orgError) throw orgError

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: credentials.email,
        full_name: credentials.full_name,
        organization_id: org.id,
        role: 'admin',
        preferences: { language: 'fr', currency: 'CAD', theme: 'light' }
      })

    if (profileError) throw profileError

    return authData.user
  }

  async signIn(credentials: SignInCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(credentials: ResetPasswordCredentials) {
    const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  }

  async updatePassword(credentials: UpdatePasswordCredentials) {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas')
    }

    const { error } = await supabase.auth.updateUser({
      password: credentials.password
    })

    if (error) throw error
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    // Update auth user metadata if full_name changed
    if (data.full_name) {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: data.full_name }
      })
      if (authError) throw authError
    }

    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...(data.full_name && { full_name: data.full_name }),
        ...(data.preferences && {
          preferences: {
            ...data.preferences
          }
        })
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single()

    if (error) throw error
    return user as AuthUser
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return null

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', authUser.id)
      .single()

    if (error) throw error
    return user as AuthUser
  }

  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()