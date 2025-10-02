export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  organization_id: string | null
  role: 'admin' | 'appraiser' | 'viewer'
  preferences: UserPreferences
  created_at: string
}

export interface UserPreferences {
  language: 'fr' | 'en'
  currency: 'CAD' | 'USD'
  theme: 'light' | 'dark'
}

export interface SignUpCredentials {
  email: string
  password: string
  full_name: string
  organization_name: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface UpdatePasswordCredentials {
  password: string
  confirmPassword: string
}

export interface UpdateProfileData {
  full_name?: string
  preferences?: Partial<UserPreferences>
}

export interface AuthSession {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthSession {
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<void>
}

export interface OrganizationData {
  id: string
  name: string
  subscription_tier: string
  settings: {
    language: 'fr' | 'en'
    currency: 'CAD' | 'USD'
  }
  created_at: string
  updated_at: string
}