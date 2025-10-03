'use client'

import React, { useEffect, useState } from 'react'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  Paper,
  LinearProgress,
  IconButton,
  Button,
  alpha,
  CircularProgress
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Home,
  Assessment,
  Description,
  AttachMoney,
  Timeline,
  CalendarToday,
  MoreVert,
  Add,
  Business
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../components/layout/MaterialDashboardLayout'
import { FinancialCharts } from '../../components/dashboard/FinancialCharts'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService, UserDashboardStats } from '@/features/dashboard/services/dashboard.service'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.user_metadata?.organization_id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await dashboardService.getUserDashboardStats(
        user.id,
        user.user_metadata.organization_id
      )
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MaterialDashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MaterialDashboardLayout>
    )
  }

  const kpiData = [
    {
      title: 'Mes Propriétés',
      value: stats?.myPropertiesCount.toString() || '0',
      icon: Home,
      color: 'primary'
    },
    {
      title: 'Mes Évaluations',
      value: stats?.myAppraisalsCount.toString() || '0',
      icon: Assessment,
      color: 'success'
    },
    {
      title: 'Mes Rapports',
      value: stats?.myReportsCount.toString() || '0',
      icon: Description,
      color: 'info'
    },
    {
      title: 'Propriétés de l\'Organisation',
      value: stats?.orgPropertiesCount.toString() || '0',
      icon: Business,
      color: 'warning'
    }
  ]

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Mon Tableau de bord
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bonjour {user?.user_metadata?.full_name || user?.email} - Vue de votre activité personnelle
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CalendarToday />}
                sx={{ borderRadius: 3 }}
              >
                Cette semaine
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ borderRadius: 3 }}
              >
                Nouvelle évaluation
              </Button>
            </Box>
          </Box>

          {/* Quick Stats Banner */}
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    85
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Évaluations cette année
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    3.2M $
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Valeur totale évaluée
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    98.5%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Taux de satisfaction
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    4.8
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Note moyenne client
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpiData.map((kpi, index) => {
            const IconComponent = kpi.icon
            return (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${kpi.color}.main`,
                          width: 48,
                          height: 48
                        }}
                      >
                        <IconComponent />
                      </Avatar>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {kpi.value}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {kpi.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={kpi.trend === 'up' ? 'success.main' : 'error.main'}
                      >
                        {kpi.change}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        vs mois dernier
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Charts Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Analytiques Financières
          </Typography>
          <FinancialCharts />
        </Box>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Activités Récentes
                  </Typography>
                  <Button size="small" endIcon={<Timeline />}>
                    Voir tout
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stats?.recentActivities.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Aucune activité récente
                    </Typography>
                  )}
                  {stats?.recentActivities.map((activity) => (
                    <Paper
                      key={activity.id}
                      sx={{
                        p: 2,
                        bgcolor: alpha('#1e3a8a', 0.02),
                        border: '1px solid',
                        borderColor: alpha('#1e3a8a', 0.1),
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha('#1e3a8a', 0.05),
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem'
                          }}
                        >
                          {activity.type[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.subtitle}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress & Goals */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Objectifs du Mois
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Évaluations</Typography>
                    <Typography variant="body2" fontWeight={600}>22/25</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={88}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Revenus</Typography>
                    <Typography variant="body2" fontWeight={600}>66K$/75K$</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={88}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Satisfaction Client</Typography>
                    <Typography variant="body2" fontWeight={600}>98.5%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={98.5}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Paper
                  sx={{
                    p: 2,
                    bgcolor: alpha('#059669', 0.1),
                    border: '1px solid',
                    borderColor: alpha('#059669', 0.2),
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    🎯 Excellente performance ce mois!
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vous êtes en avance sur vos objectifs
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MaterialDashboardLayout>
  )
}