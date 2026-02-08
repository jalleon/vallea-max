import { supabase } from '@/lib/supabase/client'

export interface UserDashboardStats {
  myPropertiesCount: number
  myAppraisalsCount: number
  myComparablesCount: number
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
    try {
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

      // Get appraisals created by this user (gracefully handle if table doesn't exist)
      let myAppraisalsCount = 0
      const appraisalsResult = await supabase
        .from('appraisals')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)

      if (!appraisalsResult.error) {
        myAppraisalsCount = appraisalsResult.count || 0
      } else {
        console.warn('Appraisals table error (table may not exist):', appraisalsResult.error.message)
      }

      // Get comparable lists created by this user
      let myComparablesCount = 0
      const comparablesResult = await supabase
        .from('comparable_lists')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)

      if (!comparablesResult.error) {
        myComparablesCount = comparablesResult.count || 0
      } else {
        console.warn('Comparable lists table error:', comparablesResult.error.message)
      }

      // Get recent activity from activity_log (gracefully handle if table doesn't exist)
      let recentActivities: any[] = []
      const { data: activities, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!activityError && activities) {
        recentActivities = activities.map(activity => ({
          id: activity.id,
          type: activity.action,
          title: this.formatActivityTitle(activity.action),
          subtitle: activity.entity_id || '',
          time: this.formatTimeAgo(new Date(activity.created_at!)),
          created_at: new Date(activity.created_at!)
        }))
      } else if (activityError) {
        console.warn('Activity log error (table may not exist):', activityError.message)
      }

      return {
        myPropertiesCount: myPropertiesCount || 0,
        myAppraisalsCount,
        myComparablesCount,
        orgPropertiesCount: orgPropertiesCount || 0,
        recentActivities
      }
    } catch (error) {
      console.error('Error in getUserDashboardStats:', error)
      // Return empty stats on error
      return {
        myPropertiesCount: 0,
        myAppraisalsCount: 0,
        myComparablesCount: 0,
        orgPropertiesCount: 0,
        recentActivities: []
      }
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
