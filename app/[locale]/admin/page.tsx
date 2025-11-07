'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Paper,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import {
  People,
  Mail,
  RequestPage,
  CheckCircle,
  Cancel,
  Schedule,
  ArrowBack,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AdminPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const locale = params.locale

  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const [users, setUsers] = useState<any[]>([])
  const [demoRequests, setDemoRequests] = useState<any[]>([])
  const [waitlist, setWaitlist] = useState<any[]>([])

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // Get access token from localStorage
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      if (!token) {
        router.push(`/${locale}/login?redirect=admin`)
        return
      }

      // Check if user is admin via API call
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        // Not authenticated
        router.push(`/${locale}/login?redirect=admin`)
        return
      }

      if (response.status === 403) {
        // Authenticated but not admin
        setError(locale === 'fr'
          ? 'Accès refusé. Vous devez être administrateur pour accéder à cette page.'
          : 'Access denied. You must be an administrator to access this page.')
        setLoading(false)
        return
      }

      setIsAdmin(true)
      fetchAllData()
    } catch (err: any) {
      setError(err.message || 'Failed to verify admin access')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchAllData()
    }
  }, [isAdmin])

  const fetchAllData = async () => {
    setLoading(true)
    setError('')

    try {
      // Get access token from localStorage
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}

      const [usersRes, demoRes, waitlistRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/demo-requests', { headers }),
        fetch('/api/admin/waitlist', { headers }),
      ])

      // Check each response individually for better error messages
      if (!usersRes.ok) {
        const errorData = await usersRes.json()
        console.error('Users API error:', errorData)
        throw new Error(`Failed to fetch users: ${errorData.error || usersRes.statusText}`)
      }

      if (!demoRes.ok) {
        const errorData = await demoRes.json()
        console.error('Demo requests API error:', errorData)
        throw new Error(`Failed to fetch demo requests: ${errorData.error || demoRes.statusText}`)
      }

      if (!waitlistRes.ok) {
        const errorData = await waitlistRes.json()
        console.error('Waitlist API error:', errorData)
        throw new Error(`Failed to fetch waitlist: ${errorData.error || waitlistRes.statusText}`)
      }

      const usersData = await usersRes.json()
      const demoData = await demoRes.json()
      const waitlistData = await waitlistRes.json()

      console.log('Admin data loaded:', {
        usersCount: usersData.users?.length,
        demoCount: demoData.demoRequests?.length,
        waitlistCount: waitlistData.waitlist?.length
      })

      setUsers(usersData.users || [])
      setDemoRequests(demoData.demoRequests || [])
      setWaitlist(waitlistData.waitlist || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fr' ? 'fr-CA' : 'en-CA')
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // Access denied screen
  if (!isAdmin && error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F9FAFB',
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Cancel sx={{ fontSize: 80, color: '#EF4444', mb: 2 }} />
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                {locale === 'fr' ? 'Accès refusé' : 'Access Denied'}
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
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
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/${locale}/dashboard`)}
            sx={{ textTransform: 'none' }}
          >
            {locale === 'fr' ? 'Retour' : 'Back'}
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {locale === 'fr' ? 'Tableau de bord administrateur' : 'Admin Dashboard'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People sx={{ fontSize: 40, color: '#10B981' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {users.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {locale === 'fr' ? 'Utilisateurs inscrits' : 'Registered Users'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RequestPage sx={{ fontSize: 40, color: '#3B82F6' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {demoRequests.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {locale === 'fr' ? 'Demandes de démo' : 'Demo Requests'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Mail sx={{ fontSize: 40, color: '#F59E0B' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {waitlist.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {locale === 'fr' ? 'Liste d\'attente' : 'Waitlist'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab
                icon={<People />}
                label={locale === 'fr' ? 'Utilisateurs' : 'Users'}
                iconPosition="start"
              />
              <Tab
                icon={<RequestPage />}
                label={locale === 'fr' ? 'Demandes de démo' : 'Demo Requests'}
                iconPosition="start"
              />
              <Tab
                icon={<Mail />}
                label={locale === 'fr' ? 'Liste d\'attente' : 'Waitlist'}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Users Tab */}
          <TabPanel value={activeTab} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Organisation' : 'Organization'}</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Abonnement' : 'Subscription'}</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Crédits' : 'Credits'}</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Inscrit le' : 'Created At'}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.organization_name || '-'}</TableCell>
                      <TableCell>{getSubscriptionStatus(user.user_subscriptions)}</TableCell>
                      <TableCell>{user.ai_credits_balance || 0}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {locale === 'fr' ? 'Aucun utilisateur' : 'No users'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Demo Requests Tab */}
          <TabPanel value={activeTab} index={1}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {demoRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.company || '-'}</TableCell>
                      <TableCell>{request.phone || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {request.message ? (
                          <Typography variant="body2" noWrap>
                            {request.message}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {demoRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {locale === 'fr' ? 'Aucune demande de démo' : 'No demo requests'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Waitlist Tab */}
          <TabPanel value={activeTab} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{locale === 'fr' ? 'Nom' : 'Name'}</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Langue' : 'Language'}</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Notifié' : 'Notified'}</strong></TableCell>
                    <TableCell><strong>{locale === 'fr' ? 'Inscrit le' : 'Joined At'}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {waitlist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell>{entry.locale?.toUpperCase()}</TableCell>
                      <TableCell>
                        {entry.notified ? (
                          <Chip
                            icon={<CheckCircle />}
                            label={locale === 'fr' ? 'Oui' : 'Yes'}
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip
                            icon={<Schedule />}
                            label={locale === 'fr' ? 'Non' : 'No'}
                            size="small"
                            color="default"
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(entry.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {waitlist.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {locale === 'fr' ? 'Aucune inscription' : 'No waitlist entries'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  )
}
