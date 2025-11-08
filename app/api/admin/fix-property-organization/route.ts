import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function POST(request: Request) {
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

    // Create regular client to check admin status
    const supabase = createClient<Database>(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Check if user is authenticated and admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean } | null; error: any }

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get the body to see which user we're fixing
    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    console.log(`[Fix Property Organization] Processing user: ${userEmail}`)

    // Get the user's profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, organization_id, email')
      .eq('email', userEmail)
      .single()

    if (userError || !userProfile) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`[Fix Property Organization] User ${userEmail}:`)
    console.log(`  - ID: ${userProfile.id}`)
    console.log(`  - Current Organization: ${userProfile.organization_id}`)

    if (!userProfile.organization_id) {
      return NextResponse.json(
        { error: 'User has no organization assigned' },
        { status: 400 }
      )
    }

    // Get all properties created by this user
    // Note: Using the authenticated client with the admin's token
    const { data: userProperties, error: propError } = await supabase
      .from('properties')
      .select('id, address, organization_id, created_by')
      .eq('created_by', userProfile.id)

    if (propError) {
      console.error('[Fix Property Organization] Error fetching properties:', propError)
      console.error('[Fix Property Organization] Error details:', {
        message: propError.message,
        code: propError.code,
        details: propError.details,
        hint: propError.hint
      })
      return NextResponse.json(
        { error: `Failed to fetch user properties: ${propError.message}` },
        { status: 500 }
      )
    }

    console.log(`[Fix Property Organization] Found ${userProperties?.length || 0} properties created by ${userEmail}`)

    if (!userProperties || userProperties.length === 0) {
      return NextResponse.json({
        message: 'No properties found for this user',
        updated: 0
      })
    }

    // Find properties that don't match the user's current organization
    const mismatchedProperties = userProperties.filter(p =>
      p.organization_id !== userProfile.organization_id
    )

    console.log(`[Fix Property Organization] ${mismatchedProperties.length} properties need updating`)

    if (mismatchedProperties.length === 0) {
      return NextResponse.json({
        message: 'All properties already correctly assigned',
        total: userProperties.length,
        updated: 0
      })
    }

    // Update the mismatched properties
    const propertyIds = mismatchedProperties.map(p => p.id)

    const { error: updateError } = await supabase
      .from('properties')
      .update({ organization_id: userProfile.organization_id })
      .in('id', propertyIds)

    if (updateError) {
      console.error('[Fix Property Organization] Error updating properties:', updateError)
      console.error('[Fix Property Organization] Update error details:', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      })
      return NextResponse.json(
        { error: `Failed to update properties: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log(`[Fix Property Organization] Successfully updated ${mismatchedProperties.length} properties`)

    return NextResponse.json({
      message: `Successfully updated organization for ${mismatchedProperties.length} properties`,
      total: userProperties.length,
      updated: mismatchedProperties.length,
      userOrganization: userProfile.organization_id
    })

  } catch (error: any) {
    console.error('Fix property organization error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}