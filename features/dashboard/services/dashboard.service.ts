import { supabase } from '@/lib/supabase/client'

export interface UserDashboardStats {
  myPropertiesCount: number
  myAppraisalsCount: number
  myReportsCount: number
  orgPropertiesCount: number
  recentActivities: Array<{
    id: string
    type: string
    title: string
    subtitle: string
    time: string
    created_at: Date
  }>
}

export class DashboardService {
  async getUserDashboardStats(userId: string, organizationId: string): Promise<UserDashboardStats> {
    // Get properties created by this user
    const { count: myPropertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    // Get all org properties count
    const { count: orgPropertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Get appraisals created by this user
    const { count: myAppraisalsCount } = await supabase
      .from('appraisals')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    // Get reports created by this user
    const { count: myReportsCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    // Get recent activity from activity_log
    const { data: activities } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentActivities = (activities || []).map(activity => ({
      id: activity.id,
      type: activity.action,
      title: this.formatActivityTitle(activity.action),
      subtitle: activity.entity_id || '',
      time: this.formatTimeAgo(new Date(activity.created_at!)),
      created_at: new Date(activity.created_at!)
    }))

    return {
      myPropertiesCount: myPropertiesCount || 0,
      myAppraisalsCount: myAppraisalsCount || 0,
      myReportsCount: myReportsCount || 0,
      orgPropertiesCount: orgPropertiesCount || 0,
      recentActivities
    }
  }

  private formatActivityTitle(action: string): string {
    const titles: Record<string, string> = {
      'property_created': 'Propriété ajoutée',
      'property_updated': 'Propriété modifiée',
      'property_deleted': 'Propriété supprimée',
      'appraisal_created': 'Évaluation créée',
      'appraisal_updated': 'Évaluation modifiée',
      'report_generated': 'Rapport généré'
    }
    return titles[action] || action
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 1) return 'À l\'instant'
    if (diffInMins < 60) return `Il y a ${diffInMins} min`
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInDays === 1) return 'Hier'
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    return date.toLocaleDateString('fr-CA')
  }
}

export const dashboardService = new DashboardService()
