'use client'

import React, { useState } from 'react'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Avatar,
  Paper,
  IconButton,
  LinearProgress,
  alpha,
  Divider,
  Fab,
  Tooltip
} from '@mui/material'
import {
  Add,
  Assessment,
  Business,
  Settings,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  Schedule,
  Edit,
  Visibility,
  Delete,
  AttachMoney,
  LocationOn,
  BarChart,
  PlayArrow
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../../components/layout/MaterialDashboardLayout'

// Données factices pour les évaluations
const evaluationTypes = [
  {
    id: 'rps',
    title: 'Évaluation RPS',
    subtitle: 'Rôle provincial standardisé',
    description: 'Évaluation municipale standardisée selon les normes provinciales du Québec',
    icon: Business,
    color: 'primary',
    count: 12,
    avgTime: '2-3 jours'
  },
  {
    id: 'nas',
    title: 'Évaluation NAS',
    subtitle: 'Normes d\'approbation spécialisées',
    description: 'Évaluation selon les normes d\'approbation spécialisées pour les institutions financières',
    icon: Assessment,
    color: 'success',
    count: 8,
    avgTime: '3-4 jours'
  },
  {
    id: 'custom',
    title: 'Évaluation personnalisée',
    subtitle: 'Paramètres sur mesure',
    description: 'Créez vos propres modèles d\'évaluation avec des critères personnalisés',
    icon: Settings,
    color: 'warning',
    count: 5,
    avgTime: '1-2 jours'
  }
]

const recentEvaluations = [
  {
    id: 1,
    property: '123 Rue Principale',
    city: 'Montréal',
    type: 'RPS',
    status: 'completed',
    date: '2024-03-15',
    value: 485000,
    progress: 100,
    client: 'Banque Nationale'
  },
  {
    id: 2,
    property: '456 Avenue des Érables',
    city: 'Laval',
    type: 'NAS',
    status: 'in_progress',
    date: '2024-03-22',
    value: 620000,
    progress: 75,
    client: 'Desjardins'
  },
  {
    id: 3,
    property: '789 Boulevard St-Laurent',
    city: 'Québec',
    type: 'Personnalisée',
    status: 'draft',
    date: '2024-03-08',
    value: 1250000,
    progress: 25,
    client: 'Investisseur privé'
  },
  {
    id: 4,
    property: '321 Rue Sherbrooke',
    city: 'Montréal',
    type: 'RPS',
    status: 'pending',
    date: '2024-03-28',
    value: 890000,
    progress: 0,
    client: 'BMO'
  }
]

const stats = [
  {
    title: 'Évaluations ce mois',
    value: '18',
    change: '+12%',
    icon: Assessment,
    color: 'primary'
  },
  {
    title: 'Valeur totale évaluée',
    value: '3.2M $',
    change: '+8.3%',
    icon: AttachMoney,
    color: 'success'
  },
  {
    title: 'Temps moyen',
    value: '2.8 jours',
    change: '-15%',
    icon: Schedule,
    color: 'info'
  },
  {
    title: 'Taux de complétion',
    value: '94%',
    change: '+5%',
    icon: CheckCircle,
    color: 'warning'
  }
]

export default function EvaluationsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'info'
      case 'pending': return 'warning'
      case 'draft': return 'default'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complétée'
      case 'in_progress': return 'En cours'
      case 'pending': return 'En attente'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />
      case 'in_progress': return <TrendingUp />
      case 'pending': return <Schedule />
      case 'draft': return <Edit />
      default: return <Edit />
    }
  }

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Évaluations
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Créez et gérez vos évaluations RPS, NAS et personnalisées
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BarChart />}
                sx={{ borderRadius: 3 }}
              >
                Statistiques
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ borderRadius: 3 }}
              >
                Nouvelle Évaluation
              </Button>
            </Box>
          </Box>
        </Box>


        {/* Evaluation Types */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {evaluationTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Grid item xs={12} md={4} key={type.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${type.color}.main`,
                          width: 56,
                          height: 56
                        }}
                      >
                        <IconComponent />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {type.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.subtitle}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {type.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {type.count} évaluations • {type.avgTime}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrow />}
                        sx={{ borderRadius: 2 }}
                      >
                        Commencer
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Recent Evaluations */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Évaluations Récentes
              </Typography>
              <Button size="small" endIcon={<Assessment />}>
                Voir toutes
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentEvaluations.map((evaluation) => (
                <Paper
                  key={evaluation.id}
                  sx={{
                    p: 3,
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        {getStatusIcon(evaluation.status)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {evaluation.property}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {evaluation.city}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">•</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {evaluation.client}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" fontWeight={600} color="success.main">
                          {evaluation.value.toLocaleString('fr-CA', {
                            style: 'currency',
                            currency: 'CAD',
                            minimumFractionDigits: 0
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(evaluation.date).toLocaleDateString('fr-CA')}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(evaluation.status)}
                        color={getStatusColor(evaluation.status) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir détails">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="info">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  {evaluation.status === 'in_progress' && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progression
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {evaluation.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={evaluation.progress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add evaluation"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          }}
        >
          <Add />
        </Fab>
      </Box>
    </MaterialDashboardLayout>
  )
}