'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import { Check, Star } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { STRIPE_PLANS } from '@/lib/stripe/config'

export default function PricingPage() {
  const t = useTranslations('pricing')
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(planType)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          userId: user.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'starter',
      ...STRIPE_PLANS.starter,
      popular: false
    },
    {
      id: 'professional',
      ...STRIPE_PLANS.professional,
      popular: true
    },
    {
      id: 'enterprise',
      ...STRIPE_PLANS.enterprise,
      popular: false
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {t('title') || 'Choose Your Plan'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            {t('subtitle') || 'Select the perfect plan for your real estate appraisal needs'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Pricing Cards */}
        <Grid container spacing={4}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                elevation={plan.popular ? 8 : 2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '3px solid #667eea' : 'none',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s'
                }}
              >
                {plan.popular && (
                  <Chip
                    icon={<Star />}
                    label={t('popular') || 'Most Popular'}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, pt: plan.popular ? 4 : 2 }}>
                  {/* Plan Name */}
                  <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center">
                    {plan.name}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ textAlign: 'center', my: 3 }}>
                    <Typography variant="h3" fontWeight={700} component="span">
                      ${plan.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" component="span">
                      {' '}/ {t('month') || 'month'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.currency}
                    </Typography>
                  </Box>

                  {/* Features */}
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Check sx={{ color: '#4CAF50', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Subscribe Button */}
                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '16px',
                      fontWeight: 600,
                      ...(plan.popular && {
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5568d3' }
                      })
                    }}
                  >
                    {loading === plan.id ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('subscribe') || 'Subscribe Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" color="text.secondary">
            {t('footer') || 'All plans include a 14-day free trial. Cancel anytime.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
