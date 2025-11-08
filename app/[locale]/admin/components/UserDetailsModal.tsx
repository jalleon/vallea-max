'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Close,
  Email,
  Business,
  CalendarToday,
  CreditCard,
  TrendingUp,
  Link as LinkIcon
} from '@mui/icons-material'

interface UserDetailsModalProps {
  open: boolean
  onClose: () => void
  user: any
  locale: string
}

export default function UserDetailsModal({ open, onClose, user, locale }: UserDetailsModalProps) {
  if (!user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fr' ? 'fr-CA' : 'en-CA')
  }

  const getSubscriptionStatus = (status: string) => {
    const statusColors: any = {
      active: 'success',
      trialing: 'info',
      past_due: 'warning',
      canceled: 'error',
      incomplete: 'warning',
    }
    return (
      <Chip
        label={status?.toUpperCase()}
        size="small"
        color={statusColors[status] || 'default'}
      />
    )
  }

  const subscription = user.user_subscriptions?.[0]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {locale === 'fr' ? 'Détails de l\'utilisateur' : 'User Details'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Basic Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {locale === 'fr' ? 'Informations de base' : 'Basic Information'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" sx={{ color: '#6B7280' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Email:</Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 4 }}>{user.email}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business fontSize="small" sx={{ color: '#6B7280' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {locale === 'fr' ? 'Organisation:' : 'Organization:'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 4 }}>
                {user.organization_name || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday fontSize="small" sx={{ color: '#6B7280' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {locale === 'fr' ? 'Inscrit le:' : 'Joined:'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 4 }}>
                {formatDate(user.created_at)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp fontSize="small" sx={{ color: '#6B7280' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {locale === 'fr' ? 'Crédits:' : 'Credits:'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 4, fontWeight: 600, color: '#10B981' }}>
                {user.ai_credits_balance || 0}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Subscription Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {locale === 'fr' ? 'Abonnement' : 'Subscription'}
          </Typography>
          {subscription ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {locale === 'fr' ? 'Statut:' : 'Status:'}
                </Typography>
                {getSubscriptionStatus(subscription.status)}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {locale === 'fr' ? 'Type de plan:' : 'Plan Type:'}
                </Typography>
                <Typography variant="body2">
                  {subscription.plan_type === 'yearly'
                    ? locale === 'fr' ? 'Annuel' : 'Yearly'
                    : locale === 'fr' ? 'Mensuel' : 'Monthly'}
                </Typography>
              </Grid>

              {subscription.current_period_end && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {locale === 'fr' ? 'Fin de période:' : 'Period Ends:'}
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(subscription.current_period_end)}
                  </Typography>
                </Grid>
              )}

              {subscription.stripe_customer_id && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Stripe Customer ID:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {subscription.stripe_customer_id}
                    </Typography>
                    <Tooltip title="View in Stripe">
                      <IconButton
                        size="small"
                        onClick={() => window.open(`https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`, '_blank')}
                      >
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {locale === 'fr' ? 'Aucun abonnement actif' : 'No active subscription'}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Quick Stats */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {locale === 'fr' ? 'Statistiques rapides' : 'Quick Stats'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F3F4F6', borderRadius: '12px' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {user.ai_credits_balance || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {locale === 'fr' ? 'Crédits restants' : 'Credits Left'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F3F4F6', borderRadius: '12px' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                  0
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {locale === 'fr' ? 'Propriétés' : 'Properties'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F3F4F6', borderRadius: '12px' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                  0
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {locale === 'fr' ? 'Évaluations' : 'Appraisals'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F3F4F6', borderRadius: '12px' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                  0
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {locale === 'fr' ? 'Scans AI' : 'AI Scans'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {locale === 'fr' ? 'Fermer' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
