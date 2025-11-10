import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Create Supabase client with the token
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('[Admin API] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('[Admin API] Unauthorized - no user found')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError} = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean } | null; error: any }

    console.log('[Admin API] Profile check:', {
      profile,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin
    })

    if (profileError || !profile?.is_admin) {
      console.log('[Admin API] Forbidden - not admin')
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching users:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get all organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
    }

    // Create a map of organization IDs to names
    const orgMap = new Map(
      (organizations || []).map((org: any) => [org.id, org.name])
    )

    // Add organization names to profiles
    const usersWithOrgNames = (profiles || []).map((profile: any) => ({
      ...profile,
      organization_name: profile.organization_id ? orgMap.get(profile.organization_id) || null : null
    }))

    return NextResponse.json({ users: usersWithOrgNames })
  } catch (error: any) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
