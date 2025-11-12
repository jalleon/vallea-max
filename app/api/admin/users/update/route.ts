import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin access
    const supabase = createClient<Database>(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authUser.id)
      .single() as { data: { is_admin: boolean } | null; error: any }

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { userId, full_name, organization_id } = body

    console.log('[Update User] Request body:', { userId, full_name, organization_id })

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Use service role to update user profile
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Build update data (only include fields that are provided)
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Convert empty strings to null for database
    if (full_name !== undefined) {
      updateData.full_name = full_name === '' ? null : full_name
    }

    if (organization_id !== undefined) {
      updateData.organization_id = organization_id === '' ? null : organization_id
    }

    console.log('[Update User] Update data:', JSON.stringify(updateData, null, 2))

    // Update user profile
    const { error: updateError } = (await (supabaseAdmin as any)
      .from('profiles')
      .update(updateData)
      .eq('id', userId)) as any

    console.log('[Update User] Update complete, error:', updateError)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
    }

    // Also update the user's auth metadata if full_name was provided
    if (full_name !== undefined) {
      try {
        console.log('[Update User] Updating auth metadata for user:', userId)
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              full_name: full_name === '' ? null : full_name
            }
          }
        )

        if (authUpdateError) {
          console.error('[Update User] Error updating auth metadata:', authUpdateError)
          // Don't fail the whole request if metadata update fails
          // The profile table is the source of truth
        } else {
          console.log('[Update User] Auth metadata updated successfully')
        }
      } catch (authError) {
        console.error('[Update User] Exception updating auth metadata:', authError)
        // Continue even if auth metadata update fails
      }
    }

    // Verify the update by fetching the user
    const { data: verifyData } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, organization_id')
      .eq('id', userId)
      .single()

    console.log('[Update User] Verified data after update:', JSON.stringify(verifyData, null, 2))

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
