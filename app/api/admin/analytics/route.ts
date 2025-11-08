import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean } | null; error: any }

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get users data
    const { data: users } = await supabase.from('profiles').select('*') as { data: any[] | null; error: any }

    // Get subscriptions data
    const { data: subscriptions } = await supabase.from('user_subscriptions').select('*') as { data: any[] | null; error: any }

    // Get usage tracking data
    const { data: usageData } = await supabase.from('usage_tracking').select('*') as { data: any[] | null; error: any }

    // Get demo requests
    const { data: demoRequests } = await supabase.from('demo_requests').select('*') as { data: any[] | null; error: any }

    // Get waitlist
    const { data: waitlist } = await supabase.from('waitlist').select('*') as { data: any[] | null; error: any }

    // Calculate metrics
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const newUsersThisWeek = users?.filter(u => new Date(u.created_at) >= oneWeekAgo).length || 0
    const newUsersLastWeek = users?.filter(u => {
      const created = new Date(u.created_at)
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      return created >= twoWeeksAgo && created < oneWeekAgo
    }).length || 0

    const userGrowthPercent = newUsersLastWeek > 0
      ? Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100)
      : 0

    // Subscription metrics
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0
    const trialingSubscriptions = subscriptions?.filter(s => s.status === 'trialing').length || 0
    const pastDueSubscriptions = subscriptions?.filter(s => s.status === 'past_due').length || 0

    // MRR calculation (simplified - assumes monthly price)
    const monthlyPrice = 49 // Base monthly price
    const yearlyPrice = 499 // Base yearly price

    const mrr = subscriptions?.reduce((sum, sub) => {
      if (sub.status === 'active' || sub.status === 'trialing') {
        if (sub.plan_type === 'yearly') {
          return sum + (yearlyPrice / 12)
        } else {
          return sum + monthlyPrice
        }
      }
      return sum
    }, 0) || 0

    // Credits usage
    const totalCreditsUsed = usageData?.reduce((sum, usage) => sum + (usage.credits_used || 0), 0) || 0
    const creditsUsedToday = usageData?.filter(u => new Date(u.created_at).toDateString() === now.toDateString())
      .reduce((sum, usage) => sum + (usage.credits_used || 0), 0) || 0
    const creditsUsedThisWeek = usageData?.filter(u => new Date(u.created_at) >= oneWeekAgo)
      .reduce((sum, usage) => sum + (usage.credits_used || 0), 0) || 0

    // Recent signups (last 10)
    const recentSignups = users?.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 10) || []

    // Upcoming renewals (next 30 days)
    const upcomingRenewals = subscriptions?.filter(sub => {
      if (!sub.current_period_end) return false
      const endDate = new Date(sub.current_period_end)
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      return endDate >= now && endDate <= thirtyDaysFromNow && sub.status === 'active'
    }) || []

    return NextResponse.json({
      overview: {
        totalUsers: users?.length || 0,
        newUsersThisWeek,
        userGrowthPercent,
        mrr: Math.round(mrr),
        activeSubscriptions,
        trialingSubscriptions,
        pastDueSubscriptions,
        totalCreditsUsed,
        creditsUsedToday,
        creditsUsedThisWeek,
        demoRequestsCount: demoRequests?.length || 0,
        waitlistCount: waitlist?.length || 0
      },
      recentSignups,
      upcomingRenewals,
      failedPayments: pastDueSubscriptions
    })
  } catch (error: any) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
