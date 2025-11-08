'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  TableSortLabel,
  Checkbox
} from '@mui/material'
import {
  People,
  Mail,
  RequestPage,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  CreditCard,
  MonetizationOn,
  Search,
  Download,
  Edit,
  Visibility,
  Delete,
  PersonAdd,
  Send,
  FilterList,
  Check,
  Note
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import AdminSidebar from './components/AdminSidebar'
import MetricCard from './components/MetricCard'
import UserDetailsModal from './components/UserDetailsModal'
import EditCreditsModal from './components/EditCreditsModal'
import DemoNotesModal from './components/DemoNotesModal'
import BulkActionToolbar from './components/BulkActionToolbar'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  overview: {
    totalUsers: number
    newUsersThisWeek: number
    userGrowthPercent: number
    mrr: number
    activeSubscriptions: number
    trialingSubscriptions: number
    pastDueSubscriptions: number
    totalCreditsUsed: number
    creditsUsedToday: number
    creditsUsedThisWeek: number
    demoRequestsCount: number
    waitlistCount: number
  }
  recentSignups: any[]
  upcomingRenewals: any[]
  failedPayments: number
}

export default function AdminPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const locale = params.locale

  // State management
  const [activeSection, setActiveSection] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Data state
  const [users, setUsers] = useState<any[]>([])
  const [demoRequests, setDemoRequests] = useState<any[]>([])
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeseriesData, setTimeseriesData] = useState<any>(null)

  // Search & filter state
  const [userSearch, setUserSearch] = useState('')
  const [demoSearch, setDemoSearch] = useState('')
  const [waitlistSearch, setWaitlistSearch] = useState('')

  // Modal state
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [editCreditsOpen, setEditCreditsOpen] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<any>(null)
  const [demoNotesOpen, setDemoNotesOpen] = useState(false)

  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedDemos, setSelectedDemos] = useState<string[]>([])
  const [selectedWaitlist, setSelectedWaitlist] = useState<string[]>([])

  // Advanced filtering, sorting, and pagination state (Users)
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all')
  const [planTypeFilter, setPlanTypeFilter] = useState<string>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Demo Requests sorting and pagination
  const [demoSortBy, setDemoSortBy] = useState<string>('created_at')
  const [demoSortOrder, setDemoSortOrder] = useState<'asc' | 'desc'>('desc')
  const [demoPage, setDemoPage] = useState(0)
  const [demoRowsPerPage, setDemoRowsPerPage] = useState(25)

  // Waitlist sorting and pagination
  const [waitlistSortBy, setWaitlistSortBy] = useState<string>('created_at')
  const [waitlistSortOrder, setWaitlistSortOrder] = useState<'asc' | 'desc'>('desc')
  const [waitlistPage, setWaitlistPage] = useState(0)
  const [waitlistRowsPerPage, setWaitlistRowsPerPage] = useState(25)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchAllData()
    }
  }, [isAdmin])

  const checkAdminAccess = async () => {
    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      if (!token) {
        router.push(`/${locale}/login?redirect=admin`)
        return
      }

      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        router.push(`/${locale}/login?redirect=admin`)
        return
      }

      if (response.status === 403) {
        setError(locale === 'fr'
          ? 'Accès refusé. Vous devez être administrateur.'
          : 'Access denied. Admin access required.')
        setLoading(false)
        return
      }

      setIsAdmin(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to verify admin access')
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}

      const [usersRes, demoRes, waitlistRes, analyticsRes, timeseriesRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/demo-requests', { headers }),
        fetch('/api/admin/waitlist', { headers }),
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/admin/analytics/timeseries', { headers })
      ])

      if (!usersRes.ok || !demoRes.ok || !waitlistRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [usersData, demoData, waitlistData, analyticsData, timeseriesData] = await Promise.all([
        usersRes.json(),
        demoRes.json(),
        waitlistRes.json(),
        analyticsRes.ok ? analyticsRes.json() : null,
        timeseriesRes.ok ? timeseriesRes.json() : null
      ])

      setUsers(usersData.users || [])
      setDemoRequests(demoData.demoRequests || [])
      setWaitlist(waitlistData.waitlist || [])
      setAnalytics(analyticsData)
      setTimeseriesData(timeseriesData)
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fr' ? 'fr-CA' : 'en-CA')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  const getSubscriptionStatus = (userSub: any) => {
    if (!userSub || userSub.length === 0) {
      return <Chip label="No Subscription" size="small" color="default" />
    }
    const sub = userSub[0]
    const statusColors: any = {
      active: 'success',
      trialing: 'info',
      past_due: 'warning',
      canceled: 'error',
      incomplete: 'warning',
    }
    return (
      <Chip
        label={sub.status?.toUpperCase()}
        size="small"
        color={statusColors[sub.status] || 'default'}
      />
    )
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      showSnackbar('No data to export', 'error')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    showSnackbar('Exported successfully', 'success')
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setUserDetailsOpen(true)
  }

  const handleEditCredits = (user: any) => {
    setSelectedUser(user)
    setEditCreditsOpen(true)
  }

  const handleCreditsUpdated = (message: string) => {
    showSnackbar(message, 'success')
    fetchAllData() // Refresh data
  }

  const handleDemoNotes = (demo: any) => {
    setSelectedDemo(demo)
    setDemoNotesOpen(true)
  }

  const handleDemoUpdated = (message: string) => {
    showSnackbar(message, 'success')
    fetchAllData() // Refresh data
  }

  const handleMarkContacted = async (demo: any) => {
    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      const response = await fetch('/api/admin/demo-requests/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          demoId: demo.id,
          contacted: !demo.contacted,
          admin_notes: demo.admin_notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update demo request')
      }

      showSnackbar(
        locale === 'fr'
          ? 'Statut mis à jour avec succès'
          : 'Status updated successfully',
        'success'
      )
      fetchAllData()
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update status', 'error')
    }
  }

  const handleNotifyWaitlist = async (waitlistEntry: any) => {
    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      const response = await fetch('/api/admin/waitlist/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          waitlistId: waitlistEntry.id,
          action: 'notify'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to notify user')
      }

      showSnackbar(
        locale === 'fr'
          ? 'Utilisateur notifié avec succès'
          : 'User notified successfully',
        'success'
      )
      fetchAllData()
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to notify user', 'error')
    }
  }

  const handlePromoteWaitlist = async (waitlistEntry: any) => {
    if (!confirm(
      locale === 'fr'
        ? `Êtes-vous sûr de vouloir promouvoir ${waitlistEntry.name} en utilisateur? Un compte sera créé et un email de bienvenue sera envoyé.`
        : `Are you sure you want to promote ${waitlistEntry.name} to user? An account will be created and a welcome email will be sent.`
    )) {
      return
    }

    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      const response = await fetch('/api/admin/waitlist/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          waitlistId: waitlistEntry.id,
          action: 'promote'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to promote user')
      }

      showSnackbar(
        locale === 'fr'
          ? 'Utilisateur promu avec succès'
          : 'User promoted successfully',
        'success'
      )
      fetchAllData()
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to promote user', 'error')
    }
  }

  // Bulk selection handlers
  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAllDemos = (checked: boolean) => {
    if (checked) {
      setSelectedDemos(paginatedDemos.map(d => d.id))
    } else {
      setSelectedDemos([])
    }
  }

  const handleSelectDemo = (demoId: string) => {
    setSelectedDemos(prev =>
      prev.includes(demoId)
        ? prev.filter(id => id !== demoId)
        : [...prev, demoId]
    )
  }

  const handleSelectAllWaitlist = (checked: boolean) => {
    if (checked) {
      setSelectedWaitlist(paginatedWaitlist.map(w => w.id))
    } else {
      setSelectedWaitlist([])
    }
  }

  const handleSelectWaitlist = (waitlistId: string) => {
    setSelectedWaitlist(prev =>
      prev.includes(waitlistId)
        ? prev.filter(id => id !== waitlistId)
        : [...prev, waitlistId]
    )
  }

  const handleBulkExport = (data: any[], filename: string) => {
    exportToCSV(data, filename)
    showSnackbar(
      locale === 'fr' ? 'Export réussi' : 'Export successful',
      'success'
    )
  }

  // Advanced filter, sort, and pagination functions
  const handleSort = (column: string) => {
    const isAsc = sortBy === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortBy(column)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Demo Requests sort and pagination handlers
  const handleDemoSort = (column: string) => {
    const isAsc = demoSortBy === column && demoSortOrder === 'asc'
    setDemoSortOrder(isAsc ? 'desc' : 'asc')
    setDemoSortBy(column)
  }

  const handleDemoChangePage = (event: unknown, newPage: number) => {
    setDemoPage(newPage)
  }

  const handleDemoChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDemoRowsPerPage(parseInt(event.target.value, 10))
    setDemoPage(0)
  }

  // Waitlist sort and pagination handlers
  const handleWaitlistSort = (column: string) => {
    const isAsc = waitlistSortBy === column && waitlistSortOrder === 'asc'
    setWaitlistSortOrder(isAsc ? 'desc' : 'asc')
    setWaitlistSortBy(column)
  }

  const handleWaitlistChangePage = (event: unknown, newPage: number) => {
    setWaitlistPage(newPage)
  }

  const handleWaitlistChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWaitlistRowsPerPage(parseInt(event.target.value, 10))
    setWaitlistPage(0)
  }

  // Filter functions
  const filteredUsers = users
    .filter(u => {
      // Search filter
      const matchesSearch = userSearch === '' ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.organization_name?.toLowerCase().includes(userSearch.toLowerCase())

      // Subscription status filter
      const subscription = u.user_subscriptions?.[0]
      const matchesSubscription = subscriptionFilter === 'all' ||
        (subscriptionFilter === 'none' && !subscription) ||
        subscription?.status === subscriptionFilter

      // Plan type filter
      const matchesPlanType = planTypeFilter === 'all' ||
        subscription?.plan_type === planTypeFilter

      // Date range filter
      let matchesDateRange = true
      if (dateRangeFilter !== 'all') {
        const now = new Date()
        const createdAt = new Date(u.created_at)

        if (dateRangeFilter === 'today') {
          matchesDateRange = createdAt.toDateString() === now.toDateString()
        } else if (dateRangeFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDateRange = createdAt >= weekAgo
        } else if (dateRangeFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDateRange = createdAt >= monthAgo
        } else if (dateRangeFilter === 'year') {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          matchesDateRange = createdAt >= yearAgo
        }
      }

      return matchesSearch && matchesSubscription && matchesPlanType && matchesDateRange
    })
    .sort((a, b) => {
      let aVal: any
      let bVal: any

      if (sortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (sortBy === 'email') {
        aVal = a.email || ''
        bVal = b.email || ''
      } else if (sortBy === 'full_name') {
        aVal = a.full_name || ''
        bVal = b.full_name || ''
      } else if (sortBy === 'organization_name') {
        aVal = a.organization_name || ''
        bVal = b.organization_name || ''
      } else if (sortBy === 'credits') {
        aVal = a.ai_credits_balance || 0
        bVal = b.ai_credits_balance || 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  // Paginated users
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Filtered and sorted demo requests
  const filteredDemos = demoRequests
    .filter(d =>
      demoSearch === '' ||
      d.email?.toLowerCase().includes(demoSearch.toLowerCase()) ||
      d.name?.toLowerCase().includes(demoSearch.toLowerCase()) ||
      d.company?.toLowerCase().includes(demoSearch.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any, bVal: any

      if (demoSortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (demoSortBy === 'name') {
        aVal = (a.name || '').toLowerCase()
        bVal = (b.name || '').toLowerCase()
      } else if (demoSortBy === 'email') {
        aVal = (a.email || '').toLowerCase()
        bVal = (b.email || '').toLowerCase()
      } else if (demoSortBy === 'company') {
        aVal = (a.company || '').toLowerCase()
        bVal = (b.company || '').toLowerCase()
      }

      if (demoSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  // Paginated demo requests
  const paginatedDemos = filteredDemos.slice(demoPage * demoRowsPerPage, demoPage * demoRowsPerPage + demoRowsPerPage)

  // Filtered and sorted waitlist
  const filteredWaitlist = waitlist
    .filter(w =>
      waitlistSearch === '' ||
      w.email?.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
      w.name?.toLowerCase().includes(waitlistSearch.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any, bVal: any

      if (waitlistSortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (waitlistSortBy === 'name') {
        aVal = (a.name || '').toLowerCase()
        bVal = (b.name || '').toLowerCase()
      } else if (waitlistSortBy === 'email') {
        aVal = (a.email || '').toLowerCase()
        bVal = (b.email || '').toLowerCase()
      }

      if (waitlistSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  // Paginated waitlist
  const paginatedWaitlist = filteredWaitlist.slice(waitlistPage * waitlistRowsPerPage, waitlistPage * waitlistRowsPerPage + waitlistRowsPerPage)

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (!isAdmin && error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F9FAFB' }}>
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Cancel sx={{ fontSize: 80, color: '#EF4444', mb: 2 }} />
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                {locale === 'fr' ? 'Accès refusé' : 'Access Denied'}
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              <Button
                variant="contained"
                onClick={() => router.push(`/${locale}/dashboard`)}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                }}
              >
                {locale === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard'}
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#F9FAFB',
      backgroundImage: 'url(/backgrounds/bg9.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} locale={locale} />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        {/* Dashboard Overview Section */}
        {activeSection === 'dashboard' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {locale === 'fr' ? 'Vue d\'ensemble' : 'Dashboard Overview'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Key Metrics Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <MetricCard
                  title={locale === 'fr' ? 'Utilisateurs' : 'Total Users'}
                  value={analytics?.overview.totalUsers || 0}
                  icon={<People />}
                  color="#3B82F6"
                  trend={{
                    value: analytics?.overview.userGrowthPercent || 0,
                    label: locale === 'fr' ? 'vs semaine dernière' : 'vs last week'
                  }}
                  subtitle={`${analytics?.overview.newUsersThisWeek || 0} ${locale === 'fr' ? 'cette semaine' : 'this week'}`}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <MetricCard
                  title={locale === 'fr' ? 'MRR' : 'Monthly Recurring Revenue'}
                  value={formatCurrency(analytics?.overview.mrr || 0)}
                  icon={<MonetizationOn />}
                  color="#10B981"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <MetricCard
                  title={locale === 'fr' ? 'Abonnements actifs' : 'Active Subscriptions'}
                  value={analytics?.overview.activeSubscriptions || 0}
                  icon={<CreditCard />}
                  color="#8B5CF6"
                  subtitle={`${analytics?.overview.trialingSubscriptions || 0} ${locale === 'fr' ? 'en période d\'essai' : 'trialing'}`}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <MetricCard
                  title={locale === 'fr' ? 'Crédits utilisés' : 'Credits Used'}
                  value={analytics?.overview.totalCreditsUsed || 0}
                  icon={<TrendingUp />}
                  color="#F59E0B"
                  subtitle={`${analytics?.overview.creditsUsedToday || 0} ${locale === 'fr' ? 'aujourd\'hui' : 'today'}`}
                />
              </Grid>
            </Grid>

            {/* Secondary Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {locale === 'fr' ? 'Demandes de démo' : 'Demo Requests'}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                      {analytics?.overview.demoRequestsCount || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {locale === 'fr' ? 'Liste d\'attente' : 'Waitlist'}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                      {analytics?.overview.waitlistCount || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '16px', border: analytics?.overview.pastDueSubscriptions && analytics.overview.pastDueSubscriptions > 0 ? '2px solid #EF4444' : 'none' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {locale === 'fr' ? 'Paiements échoués' : 'Failed Payments'}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
                      {analytics?.overview.pastDueSubscriptions || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activity Tables */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {locale === 'fr' ? 'Inscriptions récentes' : 'Recent Signups'}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>{locale === 'fr' ? 'Date' : 'Date'}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analytics?.recentSignups.slice(0, 5).map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.full_name || '-'}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{formatDate(user.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {locale === 'fr' ? 'Renouvellements à venir' : 'Upcoming Renewals'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {locale === 'fr' ? 'Prochains 30 jours' : 'Next 30 days'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                        {analytics?.upcomingRenewals.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                        {locale === 'fr' ? 'abonnements à renouveler' : 'subscriptions to renew'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {locale === 'fr' ? 'Utilisateurs' : 'Users'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportToCSV(filteredUsers, 'users')}
                sx={{ textTransform: 'none' }}
              >
                {locale === 'fr' ? 'Exporter CSV' : 'Export CSV'}
              </Button>
            </Box>

            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                {/* Search and Filters Row */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{locale === 'fr' ? 'Statut' : 'Status'}</InputLabel>
                      <Select
                        value={subscriptionFilter}
                        onChange={(e) => setSubscriptionFilter(e.target.value)}
                        label={locale === 'fr' ? 'Statut' : 'Status'}
                      >
                        <MenuItem value="all">{locale === 'fr' ? 'Tous' : 'All'}</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="trialing">Trialing</MenuItem>
                        <MenuItem value="past_due">Past Due</MenuItem>
                        <MenuItem value="canceled">Canceled</MenuItem>
                        <MenuItem value="none">{locale === 'fr' ? 'Aucun' : 'None'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{locale === 'fr' ? 'Plan' : 'Plan'}</InputLabel>
                      <Select
                        value={planTypeFilter}
                        onChange={(e) => setPlanTypeFilter(e.target.value)}
                        label={locale === 'fr' ? 'Plan' : 'Plan'}
                      >
                        <MenuItem value="all">{locale === 'fr' ? 'Tous' : 'All'}</MenuItem>
                        <MenuItem value="monthly">{locale === 'fr' ? 'Mensuel' : 'Monthly'}</MenuItem>
                        <MenuItem value="yearly">{locale === 'fr' ? 'Annuel' : 'Yearly'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{locale === 'fr' ? 'Période' : 'Period'}</InputLabel>
                      <Select
                        value={dateRangeFilter}
                        onChange={(e) => setDateRangeFilter(e.target.value)}
                        label={locale === 'fr' ? 'Période' : 'Period'}
                      >
                        <MenuItem value="all">{locale === 'fr' ? 'Tous' : 'All Time'}</MenuItem>
                        <MenuItem value="today">{locale === 'fr' ? 'Aujourd\'hui' : 'Today'}</MenuItem>
                        <MenuItem value="week">{locale === 'fr' ? 'Cette semaine' : 'This Week'}</MenuItem>
                        <MenuItem value="month">{locale === 'fr' ? 'Ce mois' : 'This Month'}</MenuItem>
                        <MenuItem value="year">{locale === 'fr' ? 'Cette année' : 'This Year'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'right', mt: 1 }}>
                      {filteredUsers.length} {locale === 'fr' ? 'résultats' : 'results'}
                    </Typography>
                  </Grid>
                </Grid>

                <BulkActionToolbar
                  selectedCount={selectedUsers.length}
                  onClearSelection={() => setSelectedUsers([])}
                  locale={locale}
                  actions={[
                    {
                      label: locale === 'fr' ? 'Exporter sélection' : 'Export selected',
                      icon: <Download fontSize="small" />,
                      onClick: () => handleBulkExport(
                        users.filter(u => selectedUsers.includes(u.id)),
                        'selected-users'
                      )
                    }
                  ]}
                />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length}
                            checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                            onChange={(e) => handleSelectAllUsers(e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'full_name'}
                            direction={sortBy === 'full_name' ? sortOrder : 'asc'}
                            onClick={() => handleSort('full_name')}
                          >
                            <strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'email'}
                            direction={sortBy === 'email' ? sortOrder : 'asc'}
                            onClick={() => handleSort('email')}
                          >
                            <strong>Email</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'organization_name'}
                            direction={sortBy === 'organization_name' ? sortOrder : 'asc'}
                            onClick={() => handleSort('organization_name')}
                          >
                            <strong>{locale === 'fr' ? 'Organisation' : 'Organization'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Abonnement' : 'Subscription'}</strong></TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'credits'}
                            direction={sortBy === 'credits' ? sortOrder : 'asc'}
                            onClick={() => handleSort('credits')}
                          >
                            <strong>{locale === 'fr' ? 'Crédits' : 'Credits'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'created_at'}
                            direction={sortBy === 'created_at' ? sortOrder : 'asc'}
                            onClick={() => handleSort('created_at')}
                          >
                            <strong>{locale === 'fr' ? 'Inscrit le' : 'Created'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id} hover selected={selectedUsers.includes(user.id)}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </TableCell>
                          <TableCell>{user.full_name || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.organization_name || '-'}</TableCell>
                          <TableCell>{getSubscriptionStatus(user.user_subscriptions)}</TableCell>
                          <TableCell>{user.ai_credits_balance || 0}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={locale === 'fr' ? 'Voir détails' : 'View details'}>
                              <IconButton size="small" color="primary" onClick={() => handleViewUser(user)}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={locale === 'fr' ? 'Modifier crédits' : 'Edit credits'}>
                              <IconButton size="small" color="success" onClick={() => handleEditCredits(user)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            {locale === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[25, 50, 100]}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={locale === 'fr' ? 'Lignes par page:' : 'Rows per page:'}
                  labelDisplayedRows={({ from, to, count }) =>
                    locale === 'fr'
                      ? `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                      : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
                  }
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Demo Requests Section */}
        {activeSection === 'demos' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {locale === 'fr' ? 'Demandes de démo' : 'Demo Requests'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportToCSV(filteredDemos, 'demo-requests')}
                sx={{ textTransform: 'none' }}
              >
                {locale === 'fr' ? 'Exporter CSV' : 'Export CSV'}
              </Button>
            </Box>

            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
                  value={demoSearch}
                  onChange={(e) => setDemoSearch(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />

                <BulkActionToolbar
                  selectedCount={selectedDemos.length}
                  onClearSelection={() => setSelectedDemos([])}
                  locale={locale}
                  actions={[
                    {
                      label: locale === 'fr' ? 'Exporter sélection' : 'Export selected',
                      icon: <Download fontSize="small" />,
                      onClick: () => handleBulkExport(
                        demoRequests.filter(d => selectedDemos.includes(d.id)),
                        'selected-demos'
                      )
                    }
                  ]}
                />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedDemos.length > 0 && selectedDemos.length < paginatedDemos.length}
                            checked={paginatedDemos.length > 0 && selectedDemos.length === paginatedDemos.length}
                            onChange={(e) => handleSelectAllDemos(e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={demoSortBy === 'name'}
                            direction={demoSortBy === 'name' ? demoSortOrder : 'asc'}
                            onClick={() => handleDemoSort('name')}
                          >
                            <strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={demoSortBy === 'email'}
                            direction={demoSortBy === 'email' ? demoSortOrder : 'asc'}
                            onClick={() => handleDemoSort('email')}
                          >
                            <strong>Email</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={demoSortBy === 'company'}
                            direction={demoSortBy === 'company' ? demoSortOrder : 'asc'}
                            onClick={() => handleDemoSort('company')}
                          >
                            <strong>{locale === 'fr' ? 'Entreprise' : 'Company'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Téléphone' : 'Phone'}</strong></TableCell>
                        <TableCell><strong>Message</strong></TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={demoSortBy === 'created_at'}
                            direction={demoSortBy === 'created_at' ? demoSortOrder : 'asc'}
                            onClick={() => handleDemoSort('created_at')}
                          >
                            <strong>{locale === 'fr' ? 'Date' : 'Date'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDemos.map((request) => (
                        <TableRow key={request.id} hover selected={selectedDemos.includes(request.id)}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedDemos.includes(request.id)}
                              onChange={() => handleSelectDemo(request.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {request.name}
                              {request.contacted && (
                                <Chip
                                  label={locale === 'fr' ? 'Contacté' : 'Contacted'}
                                  size="small"
                                  color="success"
                                  icon={<CheckCircle />}
                                  sx={{ fontSize: '10px', height: '20px' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>{request.company || '-'}</TableCell>
                          <TableCell>{request.phone || '-'}</TableCell>
                          <TableCell sx={{ maxWidth: 250 }}>
                            <Typography variant="body2" noWrap>
                              {request.message || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(request.created_at)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={request.contacted ? (locale === 'fr' ? 'Marquer comme non contacté' : 'Mark as not contacted') : (locale === 'fr' ? 'Marquer comme contacté' : 'Mark as contacted')}>
                              <IconButton
                                size="small"
                                color={request.contacted ? 'success' : 'default'}
                                onClick={() => handleMarkContacted(request)}
                              >
                                <Check fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={locale === 'fr' ? 'Ajouter/Voir notes' : 'Add/View notes'}>
                              <IconButton size="small" color="primary" onClick={() => handleDemoNotes(request)}>
                                <Note fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={locale === 'fr' ? 'Envoyer email' : 'Send email'}>
                              <IconButton
                                size="small"
                                color="primary"
                                component="a"
                                href={`mailto:${request.email}`}
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedDemos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            {locale === 'fr' ? 'Aucune demande trouvée' : 'No requests found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[25, 50, 100]}
                  component="div"
                  count={filteredDemos.length}
                  rowsPerPage={demoRowsPerPage}
                  page={demoPage}
                  onPageChange={handleDemoChangePage}
                  onRowsPerPageChange={handleDemoChangeRowsPerPage}
                  labelRowsPerPage={locale === 'fr' ? 'Lignes par page:' : 'Rows per page:'}
                  labelDisplayedRows={({ from, to, count }) =>
                    locale === 'fr'
                      ? `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                      : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
                  }
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Waitlist Section */}
        {activeSection === 'waitlist' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {locale === 'fr' ? 'Liste d\'attente' : 'Waitlist'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportToCSV(filteredWaitlist, 'waitlist')}
                sx={{ textTransform: 'none' }}
              >
                {locale === 'fr' ? 'Exporter CSV' : 'Export CSV'}
              </Button>
            </Box>

            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
                  value={waitlistSearch}
                  onChange={(e) => setWaitlistSearch(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />

                <BulkActionToolbar
                  selectedCount={selectedWaitlist.length}
                  onClearSelection={() => setSelectedWaitlist([])}
                  locale={locale}
                  actions={[
                    {
                      label: locale === 'fr' ? 'Exporter sélection' : 'Export selected',
                      icon: <Download fontSize="small" />,
                      onClick: () => handleBulkExport(
                        waitlist.filter(w => selectedWaitlist.includes(w.id)),
                        'selected-waitlist'
                      )
                    }
                  ]}
                />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedWaitlist.length > 0 && selectedWaitlist.length < paginatedWaitlist.length}
                            checked={paginatedWaitlist.length > 0 && selectedWaitlist.length === paginatedWaitlist.length}
                            onChange={(e) => handleSelectAllWaitlist(e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={waitlistSortBy === 'name'}
                            direction={waitlistSortBy === 'name' ? waitlistSortOrder : 'asc'}
                            onClick={() => handleWaitlistSort('name')}
                          >
                            <strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={waitlistSortBy === 'email'}
                            direction={waitlistSortBy === 'email' ? waitlistSortOrder : 'asc'}
                            onClick={() => handleWaitlistSort('email')}
                          >
                            <strong>Email</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Langue' : 'Language'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Notifié' : 'Notified'}</strong></TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={waitlistSortBy === 'created_at'}
                            direction={waitlistSortBy === 'created_at' ? waitlistSortOrder : 'asc'}
                            onClick={() => handleWaitlistSort('created_at')}
                          >
                            <strong>{locale === 'fr' ? 'Inscrit le' : 'Joined'}</strong>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedWaitlist.map((entry) => (
                        <TableRow key={entry.id} hover selected={selectedWaitlist.includes(entry.id)}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedWaitlist.includes(entry.id)}
                              onChange={() => handleSelectWaitlist(entry.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {entry.name}
                              {entry.promoted && (
                                <Chip
                                  label={locale === 'fr' ? 'Promu' : 'Promoted'}
                                  size="small"
                                  color="success"
                                  icon={<CheckCircle />}
                                  sx={{ fontSize: '10px', height: '20px' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{entry.email}</TableCell>
                          <TableCell>{entry.locale?.toUpperCase()}</TableCell>
                          <TableCell>
                            {entry.notified ? (
                              <Chip icon={<CheckCircle />} label={locale === 'fr' ? 'Oui' : 'Yes'} size="small" color="success" />
                            ) : (
                              <Chip icon={<Schedule />} label={locale === 'fr' ? 'Non' : 'No'} size="small" color="default" />
                            )}
                          </TableCell>
                          <TableCell>{formatDate(entry.created_at)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={entry.notified ? (locale === 'fr' ? 'Déjà notifié' : 'Already notified') : (locale === 'fr' ? 'Envoyer notification' : 'Send notification')}>
                              <span>
                                <IconButton
                                  size="small"
                                  color={entry.notified ? 'success' : 'primary'}
                                  disabled={entry.notified}
                                  onClick={() => handleNotifyWaitlist(entry)}
                                >
                                  <Send fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={entry.promoted ? (locale === 'fr' ? 'Déjà promu' : 'Already promoted') : (locale === 'fr' ? 'Promouvoir en utilisateur' : 'Promote to user')}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={entry.promoted}
                                  onClick={() => handlePromoteWaitlist(entry)}
                                >
                                  <PersonAdd fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={locale === 'fr' ? 'Envoyer email' : 'Send email'}>
                              <IconButton
                                size="small"
                                color="primary"
                                component="a"
                                href={`mailto:${entry.email}`}
                              >
                                <Mail fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedWaitlist.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            {locale === 'fr' ? 'Aucune inscription trouvée' : 'No entries found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[25, 50, 100]}
                  component="div"
                  count={filteredWaitlist.length}
                  rowsPerPage={waitlistRowsPerPage}
                  page={waitlistPage}
                  onPageChange={handleWaitlistChangePage}
                  onRowsPerPageChange={handleWaitlistChangeRowsPerPage}
                  labelRowsPerPage={locale === 'fr' ? 'Lignes par page:' : 'Rows per page:'}
                  labelDisplayedRows={({ from, to, count }) =>
                    locale === 'fr'
                      ? `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                      : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
                  }
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Placeholder sections for other tabs */}
        {activeSection === 'subscriptions' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {locale === 'fr' ? 'Gestion des abonnements' : 'Subscription Management'}
            </Typography>

            {!analytics ? (
              <Card sx={{ borderRadius: '16px', p: 4, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ color: '#6B7280', mt: 2 }}>
                  {locale === 'fr' ? 'Chargement des données...' : 'Loading data...'}
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} md={3}>
                  <Card sx={{ borderRadius: '16px', p: 3, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {locale === 'fr' ? 'Abonnements actifs' : 'Active Subscriptions'}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {analytics.overview.activeSubscriptions}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={{ borderRadius: '16px', p: 3, background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: '#FFF' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {locale === 'fr' ? 'En période d\'essai' : 'Trialing'}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {analytics.overview.trialingSubscriptions}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={{ borderRadius: '16px', p: 3, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFF' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {locale === 'fr' ? 'Renouvellements à venir' : 'Upcoming Renewals'}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {analytics.upcomingRenewals?.length || 0}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={{ borderRadius: '16px', p: 3, background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#FFF' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {locale === 'fr' ? 'Paiements échoués' : 'Failed Payments'}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {analytics.failedPayments || 0}
                    </Typography>
                  </Card>
                </Grid>

                {/* Upcoming Renewals Table */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: '16px' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {locale === 'fr' ? 'Renouvellements à venir (30 prochains jours)' : 'Upcoming Renewals (Next 30 Days)'}
                        </Typography>
                        <Chip
                          label={`${analytics.upcomingRenewals?.length || 0} ${locale === 'fr' ? 'renouvellements' : 'renewals'}`}
                          color="warning"
                          size="small"
                        />
                      </Box>

                      {analytics.upcomingRenewals && analytics.upcomingRenewals.length > 0 ? (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>{locale === 'fr' ? 'Utilisateur' : 'User'}</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>{locale === 'fr' ? 'Type de plan' : 'Plan Type'}</strong></TableCell>
                                <TableCell><strong>{locale === 'fr' ? 'Fin de période' : 'Period Ends'}</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {analytics.upcomingRenewals.map((renewal: any) => {
                                const user = users.find(u => u.id === renewal.user_id)
                                const daysUntilRenewal = Math.ceil((new Date(renewal.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                return (
                                  <TableRow key={renewal.id} hover>
                                    <TableCell>{user?.full_name || '-'}</TableCell>
                                    <TableCell>{user?.email || '-'}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={renewal.plan_type === 'yearly' ? (locale === 'fr' ? 'Annuel' : 'Yearly') : (locale === 'fr' ? 'Mensuel' : 'Monthly')}
                                        size="small"
                                        color={renewal.plan_type === 'yearly' ? 'primary' : 'default'}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(renewal.current_period_end)}
                                      <Typography variant="caption" display="block" sx={{ color: '#6B7280' }}>
                                        {locale === 'fr' ? `Dans ${daysUntilRenewal} jours` : `In ${daysUntilRenewal} days`}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip label={renewal.status?.toUpperCase()} size="small" color="success" />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Tooltip title={locale === 'fr' ? 'Envoyer un rappel' : 'Send reminder'}>
                                        <IconButton size="small" color="primary">
                                          <Send fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <CheckCircle sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: '#6B7280' }}>
                            {locale === 'fr' ? 'Aucun renouvellement prévu dans les 30 prochains jours' : 'No renewals scheduled in the next 30 days'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Trial Expirations */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '16px' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {locale === 'fr' ? 'Essais se terminant bientôt' : 'Trials Ending Soon'}
                        </Typography>
                        <Chip
                          label={analytics.overview.trialingSubscriptions}
                          color="info"
                          size="small"
                        />
                      </Box>

                      {analytics.overview.trialingSubscriptions > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>{locale === 'fr' ? 'Utilisateur' : 'User'}</strong></TableCell>
                                <TableCell><strong>{locale === 'fr' ? 'Fin d\'essai' : 'Trial Ends'}</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {users.filter(u => u.user_subscriptions?.[0]?.status === 'trialing').slice(0, 5).map((user: any) => (
                                <TableRow key={user.id} hover>
                                  <TableCell>{user.full_name || user.email}</TableCell>
                                  <TableCell>{formatDate(user.user_subscriptions[0].current_period_end)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {locale === 'fr' ? 'Aucun essai en cours' : 'No active trials'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Failed Payments */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '16px' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {locale === 'fr' ? 'Paiements échoués' : 'Failed Payments'}
                        </Typography>
                        <Chip
                          label={analytics.failedPayments || 0}
                          color="error"
                          size="small"
                        />
                      </Box>

                      {analytics.failedPayments > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>{locale === 'fr' ? 'Utilisateur' : 'User'}</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {users.filter(u => u.user_subscriptions?.[0]?.status === 'past_due').slice(0, 5).map((user: any) => (
                                <TableRow key={user.id} hover>
                                  <TableCell>{user.full_name || user.email}</TableCell>
                                  <TableCell align="right">
                                    <Tooltip title={locale === 'fr' ? 'Relancer le paiement' : 'Retry payment'}>
                                      <IconButton size="small" color="error">
                                        <Send fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <CheckCircle sx={{ fontSize: 40, color: '#10B981', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {locale === 'fr' ? 'Aucun paiement échoué' : 'No failed payments'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {activeSection === 'analytics' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {locale === 'fr' ? 'Analytique avancée' : 'Advanced Analytics'}
            </Typography>

            {!timeseriesData ? (
              <Card sx={{ borderRadius: '16px', p: 4, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ color: '#6B7280', mt: 2 }}>
                  {locale === 'fr' ? 'Chargement des données...' : 'Loading data...'}
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {/* MRR Over Time Chart */}
                <Grid item xs={12} lg={8}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Revenus récurrents mensuels (MRR)' : 'Monthly Recurring Revenue (MRR)'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeseriesData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <RechartsTooltip
                          formatter={(value: any) => [`$${value}`, 'MRR']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={3} name="MRR ($)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* Revenue by Plan Type (Pie Chart) */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Revenus par type de plan' : 'Revenue by Plan Type'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={timeseriesData.revenueByPlan}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: $${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {timeseriesData.revenueByPlan.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#3B82F6'} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: any, name: any, props: any) => [`$${value} (${props.payload.count} ${locale === 'fr' ? 'abonnements' : 'subscriptions'})`, name]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* User Growth Chart */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Croissance des utilisateurs' : 'User Growth'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeseriesData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                        <Legend />
                        <Line type="monotone" dataKey="newUsers" stroke="#8B5CF6" strokeWidth={2} name={locale === 'fr' ? 'Nouveaux' : 'New Users'} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="totalUsers" stroke="#3B82F6" strokeWidth={2} name={locale === 'fr' ? 'Total' : 'Total Users'} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* Conversion Funnel */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Tunnel de conversion' : 'Conversion Funnel'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timeseriesData.conversionFunnel} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" style={{ fontSize: '12px' }} />
                        <YAxis dataKey="stage" type="category" width={100} style={{ fontSize: '12px' }} />
                        <RechartsTooltip
                          formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percentage}%)`, locale === 'fr' ? 'Utilisateurs' : 'Users']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Bar dataKey="count" fill="#10B981" radius={[0, 8, 8, 0]}>
                          {timeseriesData.conversionFunnel.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : index === 2 ? '#8B5CF6' : '#F59E0B'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* Credits Consumption (Last 30 Days) */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Consommation de crédits (30 derniers jours)' : 'Credits Consumption (Last 30 Days)'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeseriesData.dailyCredits}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value}`, locale === 'fr' ? 'Crédits' : 'Credits']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="credits" stroke="#F59E0B" strokeWidth={2} name={locale === 'fr' ? 'Crédits utilisés' : 'Credits Used'} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* Active Subscriptions Over Time */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Abonnements actifs' : 'Active Subscriptions'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeseriesData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                        <Legend />
                        <Line type="monotone" dataKey="activeSubscriptions" stroke="#10B981" strokeWidth={3} name={locale === 'fr' ? 'Actifs' : 'Active'} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* Credits Used by Month */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '16px', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {locale === 'fr' ? 'Crédits utilisés par mois' : 'Credits Used by Month'}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timeseriesData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value}`, locale === 'fr' ? 'Crédits' : 'Credits']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Bar dataKey="creditsUsed" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {activeSection === 'health' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {locale === 'fr' ? 'Santé du système' : 'System Health'}
            </Typography>
            <Card sx={{ borderRadius: '16px', p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#6B7280' }}>
                {locale === 'fr' ? 'Monitoring en développement' : 'Monitoring coming soon'}
              </Typography>
            </Card>
          </Box>
        )}

        {activeSection === 'settings' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {locale === 'fr' ? 'Paramètres' : 'Settings'}
            </Typography>
            <Card sx={{ borderRadius: '16px', p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#6B7280' }}>
                {locale === 'fr' ? 'Paramètres à venir' : 'Settings coming soon'}
              </Typography>
            </Card>
          </Box>
        )}
      </Box>

      {/* Modals */}
      <UserDetailsModal
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        user={selectedUser}
        locale={locale}
      />

      <EditCreditsModal
        open={editCreditsOpen}
        onClose={() => setEditCreditsOpen(false)}
        user={selectedUser}
        locale={locale}
        onSuccess={handleCreditsUpdated}
      />

      <DemoNotesModal
        open={demoNotesOpen}
        onClose={() => setDemoNotesOpen(false)}
        demo={selectedDemo}
        locale={locale}
        onSuccess={handleDemoUpdated}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  )
}
