'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Add,
  Assessment,
  Business,
  Settings,
  TrendingUp,
  CheckCircle,
  Schedule,
  Edit,
  Visibility,
  LocationOn,
  PlayArrow
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../../components/layout/MaterialDashboardLayout'
import { appraisalsService } from '@/features/evaluations/_api/appraisals.service'
import { useTranslations } from 'next-intl'

export default function EvaluationsPage() {
  const router = useRouter()
  const t = useTranslations('evaluations')
  const tTemplates = useTranslations('evaluations.templates')
  const tDetail = useTranslations('evaluations.detail')

  const [appraisals, setAppraisals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppraisals()
  }, [])

  const loadAppraisals = async () => {
    try {
      const data = await appraisalsService.getAll()
      setAppraisals(data)
    } catch (error) {
      console.error('Error loading appraisals:', error)
    } finally {
      setLoading(false)
    }
  }

  const evaluationTypes = [
    {
      id: 'RPS',
      title: tTemplates('rps.title'),
      subtitle: tTemplates('rps.subtitle'),
      description: tTemplates('rps.description'),
      icon: Business,
      color: 'primary',
      count: appraisals.filter(a => a.template_type === 'RPS').length
    },
    {
      id: 'NAS',
      title: tTemplates('nas.title'),
      subtitle: tTemplates('nas.subtitle'),
      description: tTemplates('nas.description'),
      icon: Assessment,
      color: 'success',
      count: appraisals.filter(a => a.template_type === 'NAS').length
    },
    {
      id: 'CUSTOM',
      title: tTemplates('custom.title'),
      subtitle: tTemplates('custom.subtitle'),
      description: tTemplates('custom.description'),
      icon: Settings,
      color: 'warning',
      count: appraisals.filter(a => a.template_type === 'CUSTOM').length
    }
  ]

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'info'
      case 'review': return 'warning'
      case 'draft': return 'default'
      case 'archived': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />
      case 'in_progress': return <TrendingUp />
      case 'review': return <Schedule />
      case 'draft': return <Edit />
      default: return <Edit />
    }
  }

  const getTemplateLabel = (templateType: string) => {
    switch (templateType) {
      case 'RPS': return tTemplates('rps.subtitle')
      case 'NAS': return tTemplates('nas.subtitle')
      case 'CUSTOM': return tTemplates('custom.subtitle')
      default: return templateType
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

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {t('title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('subtitle')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/evaluations/new')}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              {t('createNew')}
            </Button>
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
                  onClick={() => router.push(`/evaluations/new?template=${type.id}`)}
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
                      <Typography variant="body2" color="text.secondary">
                        {type.count} {t('appraisals')}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrow />}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        {t('start')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Recent Appraisals */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                {t('recentAppraisals')}
              </Typography>
            </Box>

            {appraisals.length === 0 ? (
              <Alert severity="info">
                {t('noAppraisals')}
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {appraisals.map((appraisal) => (
                  <Paper
                    key={appraisal.id}
                    sx={{
                      p: 3,
                      bgcolor: alpha('#1e3a8a', 0.02),
                      border: '1px solid',
                      borderColor: alpha('#1e3a8a', 0.1),
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha('#1e3a8a', 0.05),
                        transform: 'translateY(-1px)'
                      }
                    }}
                    onClick={() => router.push(`/evaluations/${appraisal.id}`)}
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
                          {getStatusIcon(appraisal.status)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {appraisal.appraisal_number || t('untitled')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {appraisal.address || appraisal.city || t('noAddress')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">•</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {appraisal.client_name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={getTemplateLabel(appraisal.template_type)}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(appraisal.created_at).toLocaleDateString('fr-CA')}
                          </Typography>
                        </Box>
                        <Chip
                          label={tDetail(`status.${appraisal.status}`)}
                          color={getStatusColor(appraisal.status)}
                          size="small"
                          variant="outlined"
                        />
                        <IconButton size="small" color="primary" onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/evaluations/${appraisal.id}`)
                        }}>
                          <Edit />
                        </IconButton>
                      </Box>
                    </Box>

                    {(appraisal.status === 'in_progress' || appraisal.status === 'draft') && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {tDetail('progress')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {appraisal.completion_percentage || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={appraisal.completion_percentage || 0}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </MaterialDashboardLayout>
  )
}