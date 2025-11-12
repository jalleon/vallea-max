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
    const { waitlistId, action } = body

    if (!waitlistId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service role to perform actions
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

    if (action === 'notify') {
      // Mark as notified
      const notifyData: any = {
        notified: true,
        notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await (supabaseAdmin
        .from('waitlist') as any)
        .update(notifyData)
        .eq('id', waitlistId)

      if (updateError) {
        console.error('Error marking waitlist as notified:', updateError)
        return NextResponse.json({ error: 'Failed to mark as notified' }, { status: 500 })
      }

      // TODO: Send actual notification email here
      // This would integrate with your email service (Mailjet, etc.)

      return NextResponse.json({
        success: true,
        message: 'Marked as notified successfully'
      })
    } else if (action === 'promote') {
      // Get waitlist entry
      const { data: waitlistEntry } = await (supabaseAdmin
        .from('waitlist') as any)
        .select('*')
        .eq('id', waitlistId)
        .single() as { data: any | null; error: any }

      if (!waitlistEntry) {
        return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', waitlistEntry.email)
        .single() as { data: any | null; error: any }

      if (existingUser) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
      }

      // Create user via Supabase Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: waitlistEntry.email,
        email_confirm: false, // Require email verification
        user_metadata: {
          full_name: waitlistEntry.name,
          locale: waitlistEntry.locale || 'en'
        }
      })

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }

      // Update waitlist entry
      const promoteData: any = {
        promoted: true,
        promoted_at: new Date().toISOString(),
        promoted_user_id: newUser.user.id,
        updated_at: new Date().toISOString()
      }

      await (supabaseAdmin
        .from('waitlist') as any)
        .update(promoteData)
        .eq('id', waitlistId)

      // TODO: Send welcome email with password setup link

      return NextResponse.json({
        success: true,
        message: 'User promoted successfully',
        userId: newUser.user.id
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Waitlist action error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
