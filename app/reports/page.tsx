'use client'

import React, { useState } from 'react'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  Chip,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  LinearProgress,
  Divider,
  Fab,
  Tooltip,
  Badge
} from '@mui/material'
import {
  Add,
  Description,
  FileDownload,
  Email,
  Print,
  Share,
  Visibility,
  Edit,
  Delete,
  Assessment,
  Business,
  Speed,
  Settings,
  CalendarToday,
  LocationOn,
  CheckCircle,
  Schedule,
  AttachMoney,
  TrendingUp,
  FolderOpen,
  CloudDownload
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../components/layout/MaterialDashboardLayout'

// Données factices pour les rapports
const reportTemplates = [
  {
    id: 'rps',
    name: 'Rapport RPS Standard',
    description: 'Rapport d\'évaluation selon les normes RPS du Québec',
    icon: Assessment,
    color: 'primary',
    pages: '12-15 pages',
    estimatedTime: '2-3 heures',
    format: 'DOCX, PDF'
  },
  {
    id: 'nas',
    name: 'Rapport NAS Complet',
    description: 'Rapport détaillé selon les normes d\'approbation spécialisées',
    icon: Business,
    color: 'success',
    pages: '20-25 pages',
    estimatedTime: '4-6 heures',
    format: 'DOCX, PDF'
  },
  {
    id: 'express',
    name: 'Rapport Express',
    description: 'Rapport simplifié pour évaluations rapides',
    icon: Speed,
    color: 'warning',
    pages: '6-8 pages',
    estimatedTime: '1-2 heures',
    format: 'DOCX, PDF'
  },
  {
    id: 'custom',
    name: 'Rapport Personnalisé',
    description: 'Modèle configurable selon vos besoins spécifiques',
    icon: Settings,
    color: 'info',
    pages: 'Variable',
    estimatedTime: 'Variable',
    format: 'Tous formats'
  }
]

const recentReports = [
  {
    id: 1,
    name: 'Rapport_RPS_123_Rue_Principale.docx',
    property: '123 Rue Principale',
    city: 'Montréal',
    type: 'RPS Standard',
    status: 'completed',
    date: '2024-03-15',
    size: '2.4 MB',
    progress: 100,
    client: 'Banque Nationale',
    value: 485000
  },
  {
    id: 2,
    name: 'Rapport_NAS_456_Avenue_Erables.docx',
    property: '456 Avenue des Érables',
    city: 'Laval',
    type: 'NAS Complet',
    status: 'in_progress',
    date: '2024-03-22',
    size: '3.1 MB',
    progress: 75,
    client: 'Desjardins',
    value: 620000
  },
  {
    id: 3,
    name: 'Rapport_Express_789_Boulevard.docx',
    property: '789 Boulevard St-Laurent',
    city: 'Québec',
    type: 'Express',
    status: 'draft',
    date: '2024-03-08',
    size: '1.8 MB',
    progress: 25,
    client: 'Investisseur privé',
    value: 1250000
  },
  {
    id: 4,
    name: 'Rapport_Personnalise_555_Chemin.docx',
    property: '555 Chemin des Prairies',
    city: 'Gatineau',
    type: 'Personnalisé',
    status: 'pending',
    date: '2024-03-28',
    size: '2.8 MB',
    progress: 0,
    client: 'BMO',
    value: 890000
  }
]

const stats = [
  {
    title: 'Rapports ce mois',
    value: '14',
    change: '+20%',
    icon: Description,
    color: 'primary'
  },
  {
    title: 'Temps moyen',
    value: '3.2h',
    change: '-15%',
    icon: Schedule,
    color: 'success'
  },
  {
    title: 'Rapports finalisés',
    value: '89%',
    change: '+5%',
    icon: CheckCircle,
    color: 'info'
  },
  {
    title: 'Valeur totale',
    value: '2.8M $',
    change: '+12%',
    icon: AttachMoney,
    color: 'warning'
  }
]

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('')

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
      case 'completed': return 'Finalisé'
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
                Rapports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Générez et gérez vos rapports d'évaluation professionnels
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                sx={{ borderRadius: 3 }}
              >
                Modèles
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ borderRadius: 3 }}
              >
                Nouveau Rapport
              </Button>
            </Box>
          </Box>
        </Box>


        {/* Report Templates */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Modèles de Rapports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sélectionnez un modèle pour commencer votre rapport d'évaluation
            </Typography>

            <Grid container spacing={3}>
              {reportTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <Grid item xs={12} sm={6} lg={3} key={template.id}>
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
                              bgcolor: `${template.color}.main`,
                              width: 48,
                              height: 48
                            }}
                          >
                            <IconComponent />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {template.name}
                            </Typography>
                            <Chip
                              label={template.pages}
                              size="small"
                              variant="outlined"
                              color={template.color}
                            />
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {template.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Temps estimé: {template.estimatedTime}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Formats: {template.format}
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ mt: 2, borderRadius: 2 }}
                          startIcon={<Add />}
                        >
                          Utiliser ce modèle
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Rapports Récents
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="completed">Finalisé</MenuItem>
                  <MenuItem value="in_progress">En cours</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="draft">Brouillon</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentReports.map((report) => (
                <Paper
                  key={report.id}
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
                        {getStatusIcon(report.status)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600} gutterBottom>
                          {report.name.replace('.docx', '')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {report.property}, {report.city}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {report.client} • {report.type} • {report.size}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" fontWeight={600} color="success.main">
                          {report.value.toLocaleString('fr-CA', {
                            style: 'currency',
                            currency: 'CAD',
                            minimumFractionDigits: 0
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(report.date).toLocaleDateString('fr-CA')}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(report.status)}
                        color={getStatusColor(report.status) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir le rapport">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger">
                          <IconButton size="small" color="success">
                            <FileDownload />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Envoyer par email">
                          <IconButton size="small" color="info">
                            <Email />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimer">
                          <IconButton size="small" color="action">
                            <Print />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  {report.status === 'in_progress' && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progression du rapport
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={report.progress}
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
          aria-label="add report"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          }}
        >
          <Description />
        </Fab>
      </Box>
    </MaterialDashboardLayout>
  )
}