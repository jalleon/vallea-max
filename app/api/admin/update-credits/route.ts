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
    const { userId, operation, amount } = body

    if (!userId || !operation || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    // Use service role to update credits
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get current credits
    const { data: currentUser } = await supabaseAdmin
      .from('profiles')
      .select('ai_credits_balance')
      .eq('id', userId)
      .single() as { data: { ai_credits_balance: number } | null; error: any }

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentCredits = currentUser.ai_credits_balance || 0
    let newCredits = 0

    if (operation === 'add') {
      newCredits = currentCredits + amount
    } else if (operation === 'set') {
      newCredits = amount
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    // Update credits
    const creditsData: any = {
      ai_credits_balance: newCredits,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(creditsData)
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating credits:', updateError)
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      previousCredits: currentCredits,
      newCredits,
      operation,
      amount
    })
  } catch (error: any) {
    console.error('Update credits error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
