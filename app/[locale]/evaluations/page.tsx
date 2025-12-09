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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import {
  Add,
  Assessment,
  Business,
  Settings,
  Description,
  TrendingUp,
  CheckCircle,
  Schedule,
  Edit,
  Visibility,
  LocationOn,
  PlayArrow,
  Delete
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../../components/layout/MaterialDashboardLayout'
import { appraisalsService } from '@/features/evaluations/_api/appraisals.service'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { useParams } from 'next/navigation'

export default function EvaluationsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { user, loading: authLoading } = useAuth()
  const t = useTranslations('evaluations')
  const tTemplates = useTranslations('evaluations.templates')
  const tDetail = useTranslations('evaluations.detail')
  const tCommon = useTranslations('common')
  const tPropertyTypes = useTranslations('evaluations.propertyTypes')

  const [appraisals, setAppraisals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appraisalToDelete, setAppraisalToDelete] = useState<any>(null)

  // Auth protection - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`)
    }
  }, [user, authLoading, router, locale])

  useEffect(() => {
    if (user) {
      loadAppraisals()
    }
  }, [user])

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

  const handleDeleteClick = (appraisal: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setAppraisalToDelete(appraisal)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!appraisalToDelete) return

    try {
      await appraisalsService.delete(appraisalToDelete.id)
      setAppraisals(appraisals.filter(a => a.id !== appraisalToDelete.id))
      setDeleteDialogOpen(false)
      setAppraisalToDelete(null)
    } catch (error) {
      console.error('Error deleting appraisal:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setAppraisalToDelete(null)
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
      id: 'AIC_FORM',
      title: tTemplates('aic_form.title'),
      subtitle: tTemplates('aic_form.subtitle'),
      description: tTemplates('aic_form.description'),
      icon: Description,
      color: 'info',
      count: appraisals.filter(a => a.template_type === 'AIC_FORM').length
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

  const getPropertyTypeLabel = (propertyType: string) => {
    if (!propertyType) return ''
    return tPropertyTypes(propertyType) || propertyType
  }

  const getTemplateLabel = (templateType: string) => {
    switch (templateType) {
      case 'RPS': return tTemplates('rps.subtitle')
      case 'NAS': return tTemplates('nas.subtitle')
      case 'CUSTOM': return tTemplates('custom.subtitle')
      default: return templateType
    }
  }

  const getTemplateChipStyles = (templateType: string) => {
    switch (templateType) {
      case 'RPS':
        return {
          bgcolor: '#1976D2',
          color: '#fff',
          border: 'none',
          fontWeight: 600
        }
      case 'NAS':
        return {
          bgcolor: '#4CAF50',
          color: '#fff',
          border: 'none',
          fontWeight: 600
        }
      case 'CUSTOM':
        return {
          bgcolor: '#FF9800',
          color: '#fff',
          border: 'none',
          fontWeight: 600
        }
      default:
        return {}
    }
  }

  if (authLoading || loading || (!user && !authLoading)) {
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
                            {appraisal.property_type && (
                              <>
                                <Typography variant="body2" color="text.secondary">•</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {getPropertyTypeLabel(appraisal.property_type)}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={getTemplateLabel(appraisal.template_type)}
                            size="small"
                            sx={{
                              mb: 0.5,
                              ...getTemplateChipStyles(appraisal.template_type)
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(appraisal.created_at).toLocaleDateString('fr-CA')}
                          </Typography>
                        </Box>
                        <Chip
                          label={tDetail(`status.${appraisal.status}`)}
                          color={appraisal.status === 'draft' ? undefined : getStatusColor(appraisal.status)}
                          size="small"
                          variant="outlined"
                          sx={appraisal.status === 'draft' ? {
                            bgcolor: '#FCE4EC',
                            color: '#C62828',
                            border: '1px solid #C62828',
                            fontWeight: 600
                          } : {}}
                        />
                        <IconButton size="small" color="primary" onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/evaluations/${appraisal.id}`)
                        }}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(appraisal, e)}>
                          <Delete />
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{tCommon('confirmDelete')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('deleteConfirmMessage', {
                name: appraisalToDelete?.appraisal_number || appraisalToDelete?.client_name || t('untitled')
              })}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDeleteCancel} sx={{ textTransform: 'none' }}>
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              {tCommon('delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MaterialDashboardLayout>
  )
}