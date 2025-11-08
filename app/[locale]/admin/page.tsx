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
  Snackbar
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
  FilterList
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import AdminSidebar from './components/AdminSidebar'
import MetricCard from './components/MetricCard'

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

  // Search & filter state
  const [userSearch, setUserSearch] = useState('')
  const [demoSearch, setDemoSearch] = useState('')
  const [waitlistSearch, setWaitlistSearch] = useState('')

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

      const [usersRes, demoRes, waitlistRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/demo-requests', { headers }),
        fetch('/api/admin/waitlist', { headers }),
        fetch('/api/admin/analytics', { headers })
      ])

      if (!usersRes.ok || !demoRes.ok || !waitlistRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [usersData, demoData, waitlistData, analyticsData] = await Promise.all([
        usersRes.json(),
        demoRes.json(),
        waitlistRes.json(),
        analyticsRes.ok ? analyticsRes.json() : null
      ])

      setUsers(usersData.users || [])
      setDemoRequests(demoData.demoRequests || [])
      setWaitlist(waitlistData.waitlist || [])
      setAnalytics(analyticsData)
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

  // Filter functions
  const filteredUsers = users.filter(u =>
    userSearch === '' ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.organization_name?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredDemos = demoRequests.filter(d =>
    demoSearch === '' ||
    d.email?.toLowerCase().includes(demoSearch.toLowerCase()) ||
    d.name?.toLowerCase().includes(demoSearch.toLowerCase()) ||
    d.company?.toLowerCase().includes(demoSearch.toLowerCase())
  )

  const filteredWaitlist = waitlist.filter(w =>
    waitlistSearch === '' ||
    w.email?.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
    w.name?.toLowerCase().includes(waitlistSearch.toLowerCase())
  )

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} locale={locale} />

      <Box sx={{ flexGrow: 1, p: 4, marginLeft: '280px' }}>
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
                <TextField
                  fullWidth
                  size="small"
                  placeholder={locale === 'fr' ? 'Rechercher par nom, email, organisation...' : 'Search by name, email, organization...'}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Organisation' : 'Organization'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Abonnement' : 'Subscription'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Crédits' : 'Credits'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Inscrit le' : 'Created'}</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>{user.full_name || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.organization_name || '-'}</TableCell>
                          <TableCell>{getSubscriptionStatus(user.user_subscriptions)}</TableCell>
                          <TableCell>{user.ai_credits_balance || 0}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={locale === 'fr' ? 'Voir détails' : 'View details'}>
                              <IconButton size="small" color="primary">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={locale === 'fr' ? 'Modifier crédits' : 'Edit credits'}>
                              <IconButton size="small" color="success">
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            {locale === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
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

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Entreprise' : 'Company'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Téléphone' : 'Phone'}</strong></TableCell>
                        <TableCell><strong>Message</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Date' : 'Date'}</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDemos.map((request) => (
                        <TableRow key={request.id} hover>
                          <TableCell>{request.name}</TableCell>
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
                            <Tooltip title={locale === 'fr' ? 'Contacter' : 'Contact'}>
                              <IconButton size="small" color="primary">
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredDemos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            {locale === 'fr' ? 'Aucune demande trouvée' : 'No requests found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
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

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Langue' : 'Language'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Notifié' : 'Notified'}</strong></TableCell>
                        <TableCell><strong>{locale === 'fr' ? 'Inscrit le' : 'Joined'}</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredWaitlist.map((entry) => (
                        <TableRow key={entry.id} hover>
                          <TableCell>{entry.name}</TableCell>
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
                            <Tooltip title={locale === 'fr' ? 'Notifier' : 'Notify'}>
                              <IconButton size="small" color="primary" disabled={entry.notified}>
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={locale === 'fr' ? 'Promouvoir' : 'Promote to user'}>
                              <IconButton size="small" color="success">
                                <PersonAdd fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredWaitlist.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            {locale === 'fr' ? 'Aucune inscription trouvée' : 'No entries found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
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
            <Card sx={{ borderRadius: '16px', p: 4, textAlign: 'center' }}>
              <CreditCard sx={{ fontSize: 80, color: '#9CA3AF', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6B7280' }}>
                {locale === 'fr' ? 'Section en développement' : 'Coming soon'}
              </Typography>
            </Card>
          </Box>
        )}

        {activeSection === 'analytics' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {locale === 'fr' ? 'Analytique avancée' : 'Advanced Analytics'}
            </Typography>
            <Card sx={{ borderRadius: '16px', p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#6B7280' }}>
                {locale === 'fr' ? 'Graphiques et analyses à venir' : 'Charts and insights coming soon'}
              </Typography>
            </Card>
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
