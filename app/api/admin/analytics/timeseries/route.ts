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

    // Get all data
    const { data: users } = await supabase.from('profiles').select('*') as { data: any[] | null; error: any }
    const { data: subscriptions } = await supabase.from('user_subscriptions').select('*') as { data: any[] | null; error: any }
    const { data: usageData } = await supabase.from('usage_tracking').select('*') as { data: any[] | null; error: any }

    // Generate last 12 months of data
    const now = new Date()
    const monthlyData = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      // Users created this month
      const newUsers = users?.filter(u => {
        const created = new Date(u.created_at)
        return created >= date && created < nextDate
      }).length || 0

      // Total users up to this month
      const totalUsers = users?.filter(u => {
        const created = new Date(u.created_at)
        return created < nextDate
      }).length || 0

      // Active subscriptions this month
      const activeSubs = subscriptions?.filter(s => {
        const created = new Date(s.created_at)
        const ended = s.canceled_at ? new Date(s.canceled_at) : null
        return created < nextDate && (!ended || ended >= date)
      }) || []

      // Calculate MRR for this month
      const monthlyPrice = 49
      const yearlyPrice = 499
      const mrr = activeSubs.reduce((sum, sub) => {
        if (sub.status === 'active' || sub.status === 'trialing') {
          if (sub.plan_type === 'yearly') {
            return sum + (yearlyPrice / 12)
          } else {
            return sum + monthlyPrice
          }
        }
        return sum
      }, 0)

      // Credits used this month
      const creditsUsed = usageData?.filter(u => {
        const created = new Date(u.created_at)
        return created >= date && created < nextDate
      }).reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0

      monthlyData.push({
        month: monthName,
        newUsers,
        totalUsers,
        activeSubscriptions: activeSubs.length,
        mrr: Math.round(mrr),
        creditsUsed
      })
    }

    // Revenue by plan type
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active' || s.status === 'trialing') || []
    const monthlyRevenue = activeSubscriptions.filter(s => s.plan_type === 'monthly').length * 49
    const yearlyRevenue = activeSubscriptions.filter(s => s.plan_type === 'yearly').length * (499 / 12)

    const revenueByPlan = [
      { name: 'Monthly', value: Math.round(monthlyRevenue), count: activeSubscriptions.filter(s => s.plan_type === 'monthly').length },
      { name: 'Yearly', value: Math.round(yearlyRevenue), count: activeSubscriptions.filter(s => s.plan_type === 'yearly').length }
    ]

    // Conversion funnel
    const totalSignups = users?.length || 0
    const totalSubscriptions = subscriptions?.length || 0
    const activeSubscriptionsCount = activeSubscriptions.length
    const paidUsers = subscriptions?.filter(s => s.stripe_subscription_id).length || 0

    const conversionFunnel = [
      { stage: 'Signups', count: totalSignups, percentage: 100 },
      { stage: 'Started Trial', count: totalSubscriptions, percentage: totalSignups > 0 ? Math.round((totalSubscriptions / totalSignups) * 100) : 0 },
      { stage: 'Active', count: activeSubscriptionsCount, percentage: totalSignups > 0 ? Math.round((activeSubscriptionsCount / totalSignups) * 100) : 0 },
      { stage: 'Paid', count: paidUsers, percentage: totalSignups > 0 ? Math.round((paidUsers / totalSignups) * 100) : 0 }
    ]

    // Credits usage by day (last 30 days)
    const dailyCredits = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
      const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      const creditsUsed = usageData?.filter(u => {
        const created = new Date(u.created_at)
        return created >= date && created < nextDate
      }).reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0

      dailyCredits.push({
        day: dayName,
        credits: creditsUsed
      })
    }

    return NextResponse.json({
      monthlyData,
      revenueByPlan,
      conversionFunnel,
      dailyCredits
    })
  } catch (error: any) {
    console.error('Admin analytics timeseries error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
