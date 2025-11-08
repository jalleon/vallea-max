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
    const { demoId, admin_notes, contacted } = body

    if (!demoId) {
      return NextResponse.json({ error: 'Missing demoId' }, { status: 400 })
    }

    // Use service role to update demo request
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Update demo request
    const updateData = {
      admin_notes,
      contacted,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = (await (supabaseAdmin as any)
      .from('demo_requests')
      .update(updateData)
      .eq('id', demoId)) as any

    if (updateError) {
      console.error('Error updating demo request:', updateError)
      return NextResponse.json({ error: 'Failed to update demo request' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      admin_notes,
      contacted
    })
  } catch (error: any) {
    console.error('Update demo request error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
