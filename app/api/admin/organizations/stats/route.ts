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

    console.log('[Admin Organizations Stats] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('[Admin Organizations Stats] Unauthorized - no user found')
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

    console.log('[Admin Organizations Stats] Profile check:', {
      profile,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin
    })

    if (profileError || !profile?.is_admin) {
      console.log('[Admin Organizations Stats] Forbidden - not admin')
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get all organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .order('name')

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }


    // Get user counts per organization
    const { data: userCounts, error: userCountsError } = await supabase
      .from('profiles')
      .select('organization_id')
      .not('organization_id', 'is', null)

    if (userCountsError) {
      console.error('Error fetching user counts:', userCountsError)
    }


    // Get library record counts per organization
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('organization_id')

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
    }


    // Create maps for counts
    const userCountMap = new Map<string, number>()
    const propertyCountMap = new Map<string, number>()

    // Count users per organization
    if (userCounts) {
      userCounts.forEach((user: any) => {
        if (user.organization_id) {
          const count = userCountMap.get(user.organization_id) || 0
          userCountMap.set(user.organization_id, count + 1)
        }
      })
    }

    // Count properties per organization
    if (properties) {
      properties.forEach((property: any) => {
        if (property.organization_id) {
          const count = propertyCountMap.get(property.organization_id) || 0
          propertyCountMap.set(property.organization_id, count + 1)
        }
      })
    }

    // Build the response with organization stats
    const organizationStats = (organizations || []).map((org: any) => ({
      id: org.id,
      name: org.name,
      created_at: org.created_at,
      user_count: userCountMap.get(org.id) || 0,
      property_count: propertyCountMap.get(org.id) || 0
    }))

    // Calculate totals
    const totalUsers = Array.from(userCountMap.values()).reduce((sum, count) => sum + count, 0)
    const totalProperties = Array.from(propertyCountMap.values()).reduce((sum, count) => sum + count, 0)

    // Count users without organization
    const usersWithoutOrg = (userCounts?.length || 0) === 0 ? 0 :
      await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .is('organization_id', null)
        .then(({ count }) => count || 0)

    return NextResponse.json({
      organizations: organizationStats,
      totals: {
        total_organizations: organizations?.length || 0,
        total_users: totalUsers,
        total_properties: totalProperties,
        users_without_org: usersWithoutOrg
      }
    })
  } catch (error: any) {
    console.error('Admin organizations stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}