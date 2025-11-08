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

    // Debug: Log organization data
    console.log('[Organization Stats] Organizations found:', organizations?.length || 0)
    if (organizations) {
      organizations.forEach((org: any) => {
        console.log(`[Organization Stats] Org: ${org.name} (ID: ${org.id})`)
      })
    }

    // Get user counts per organization (with email and id for debugging)
    const { data: userCounts, error: userCountsError } = await supabase
      .from('profiles')
      .select('id, organization_id, email')
      .not('organization_id', 'is', null)

    if (userCountsError) {
      console.error('Error fetching user counts:', userCountsError)
    }

    // Debug: Log demo@valeamax.com organization
    const demoUser = userCounts?.find((u: any) => u.email === 'demo@valeamax.com')
    if (demoUser) {
      console.log(`[Organization Stats] demo@valeamax.com belongs to org: ${demoUser.organization_id}`)

      // Find the organization name for demo user
      const demoOrgName = organizations?.find((o: any) => o.id === demoUser.organization_id)?.name
      console.log(`[Organization Stats] demo@valeamax.com organization name: ${demoOrgName}`)
    }

    // Get library record counts per organization (with created_by for debugging)
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('organization_id, created_by')

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
    }

    // Debug: Log property data
    console.log('[Organization Stats] Total properties fetched:', properties?.length || 0)
    if (properties && properties.length > 0) {
      const propertiesWithOrg = properties.filter((p: any) => p.organization_id !== null)
      const propertiesWithoutOrg = properties.filter((p: any) => p.organization_id === null)
      console.log('[Organization Stats] Properties with organization:', propertiesWithOrg.length)
      console.log('[Organization Stats] Properties without organization:', propertiesWithoutOrg.length)

      // Log unique organization IDs from properties
      const uniqueOrgIds = new Set(propertiesWithOrg.map((p: any) => p.organization_id))
      console.log('[Organization Stats] Unique organization IDs in properties:', Array.from(uniqueOrgIds))

      // Check properties created by demo user
      const demoUserId = userCounts?.find((u: any) => u.email === 'demo@valeamax.com')?.id
      if (demoUserId) {
        const demoUserProperties = properties.filter((p: any) => p.created_by === demoUserId)
        console.log(`[Organization Stats] Properties created by demo@valeamax.com: ${demoUserProperties.length}`)
        if (demoUserProperties.length > 0) {
          const demoUserOrgIds = new Set(demoUserProperties.map((p: any) => p.organization_id))
          console.log(`[Organization Stats] Org IDs for demo user properties:`, Array.from(demoUserOrgIds))

          // Show org names for demo user's properties
          demoUserOrgIds.forEach(orgId => {
            const orgName = organizations?.find((o: any) => o.id === orgId)?.name || 'Unknown'
            const propCount = demoUserProperties.filter((p: any) => p.organization_id === orgId).length
            console.log(`[Organization Stats]   - ${propCount} properties in org: ${orgName} (${orgId})`)
          })
        }
      }
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
    const organizationStats = (organizations || []).map((org: any) => {
      const userCount = userCountMap.get(org.id) || 0
      const propertyCount = propertyCountMap.get(org.id) || 0

      // Debug logging for each organization
      if (userCount > 0 || propertyCount > 0) {
        console.log(`[Organization Stats] ${org.name}: ${userCount} users, ${propertyCount} properties`)
      }

      return {
        id: org.id,
        name: org.name,
        created_at: org.created_at,
        user_count: userCount,
        property_count: propertyCount
      }
    })

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