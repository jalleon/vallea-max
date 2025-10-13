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
  Stack,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { CheckCircle, ArrowBack, Language as LanguageIcon } from '@mui/icons-material'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { STRIPE_PLANS } from '@/lib/stripe/client-config'
import Image from 'next/image'

export default function PricingPage() {
  const t = useTranslations('pricing')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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
          userId: user.id,
        }),
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

  const handleLanguageChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  const plans = [
    {
      id: 'monthly',
      ...STRIPE_PLANS.monthly,
      popular: false,
    },
    {
      id: 'annual',
      ...STRIPE_PLANS.annual,
      popular: true,
    },
  ]

  const benefits = [
    t('benefits.unlimited') || 'Unlimited properties',
    t('benefits.reporting') || 'Advanced reporting',
    t('benefits.support') || '24/7 support',
    t('benefits.mobile') || 'Mobile access',
    t('benefits.export') || 'Export capabilities',
    t('benefits.updates') || 'Regular updates',
  ]

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid rgba(26, 31, 54, 0.1)`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1, gap: 1.5 }}>
              <Image
                src="/logo.png"
                alt="Valea Max"
                width={40}
                height={40}
                style={{ borderRadius: '8px', marginTop: '-4px' }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'var(--font-montserrat)',
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2,
                  }}
                >
                  Valea Max
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    color: '#4A5568',
                    fontSize: '0.7rem',
                    letterSpacing: '0.03em',
                    display: 'block',
                    mt: -0.5,
                  }}
                >
                  {locale === 'fr' ? 'Évaluation immobilière' : 'Real Estate Valuation'}
                </Typography>
              </Box>
            </Box>

            {/* Back to Home Button */}
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: '#1A1F36',
                color: '#1A1F36',
                '&:hover': {
                  borderColor: '#10B981',
                  bgcolor: 'rgba(16, 185, 129, 0.05)',
                },
              }}
            >
              {locale === 'fr' ? 'Retour' : 'Back'}
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          background: 'linear-gradient(to bottom, #E8E2D5 0%, #F5F3EE 50%, #E8E2D5 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.04) 0%, transparent 45%),
              radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.04) 0%, transparent 45%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                color: '#1A1F36',
                fontFamily: 'var(--font-fraunces)',
                letterSpacing: '-0.01em',
              }}
            >
              {t('title') || 'Choose Your Plan'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                color: '#4A5568',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
              }}
            >
              {t('subtitle') || 'Select the perfect plan for your real estate appraisal needs'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Pricing Cards */}
          <Grid container spacing={4} justifyContent="center">
            {/* Monthly Plan */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  borderRadius: '16px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)',
                    border: '1px solid rgba(26, 31, 54, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    gutterBottom
                    align="center"
                    sx={{ color: '#1A1F36', mb: 3 }}
                  >
                    {t('monthly')}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography variant="h2" fontWeight={600} component="span" sx={{ color: '#1A1F36' }}>
                      {STRIPE_PLANS.monthly.price}$
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4A5568' }} component="span">
                      {' '}
                      / {t('month')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                      CAD
                    </Typography>
                  </Box>
                  <Stack spacing={2.5} sx={{ my: 4 }}>
                    {benefits.map((benefit, index) => (
                      <Stack direction="row" spacing={2} key={index}>
                        <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                        <Typography variant="body2" sx={{ color: '#4A5568', lineHeight: 1.7 }}>
                          {benefit}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loading === 'monthly'}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      borderColor: '#1A1F36',
                      color: '#1A1F36',
                      '&:hover': {
                        borderColor: '#10B981',
                        bgcolor: 'rgba(16, 185, 129, 0.05)',
                      },
                    }}
                  >
                    {loading === 'monthly' ? (
                      <CircularProgress size={24} />
                    ) : (
                      t('getStarted') || 'Get Started'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Annual Plan */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(16, 185, 129, 0.2)',
                    border: '1.5px solid rgba(16, 185, 129, 0.5)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    px: 3,
                    py: 0.75,
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    zIndex: 1,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {t('popular')}
                </Box>
                <CardContent sx={{ p: 5 }}>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    gutterBottom
                    align="center"
                    sx={{ color: '#1A1F36', mb: 3 }}
                  >
                    {t('annual')}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography variant="h2" fontWeight={600} component="span" sx={{ color: '#10B981' }}>
                      {STRIPE_PLANS.annual.price}$
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4A5568' }} component="span">
                      {' '}
                      / {t('month')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, mt: 1 }}>
                      {STRIPE_PLANS.annual.displayPrice}$ {t('billedAnnually')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      CAD
                    </Typography>
                  </Box>
                  <Stack spacing={2.5} sx={{ my: 4 }}>
                    {benefits.map((benefit, index) => (
                      <Stack direction="row" spacing={2} key={index}>
                        <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                        <Typography variant="body2" sx={{ color: '#4A5568', lineHeight: 1.7 }}>
                          {benefit}
                        </Typography>
                      </Stack>
                    ))}
                    <Stack direction="row" spacing={2}>
                      <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#10B981', lineHeight: 1.7 }}>
                        {t('save240')}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe('annual')}
                    disabled={loading === 'annual'}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
                      },
                    }}
                  >
                    {loading === 'annual' ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('getStarted') || 'Get Started'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Footer Note */}
          <Typography variant="body2" align="center" sx={{ mt: 6, color: '#4A5568' }}>
            {t('footer') || 'All plans include a 14-day free trial. Cancel anytime.'}
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#0F1419',
          color: '#E8E2D5',
          pt: 6,
          pb: 3,
          borderTop: '1px solid rgba(232, 226, 213, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Brand Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="Valea Max"
                    width={44}
                    height={44}
                    style={{ borderRadius: '8px', position: 'relative', zIndex: 1 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-montserrat)',
                      fontWeight: 700,
                      color: '#E8E2D5',
                      fontSize: '1.1rem',
                      lineHeight: 1.2,
                    }}
                  >
                    Valea Max
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(232, 226, 213, 0.6)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.03em',
                      display: 'block',
                    }}
                  >
                    {locale === 'fr' ? 'Évaluation immobilière' : 'Real Estate Valuation'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Language Toggle */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() => handleLanguageChange('fr')}
                  variant={locale === 'fr' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<LanguageIcon />}
                  sx={{
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    ...(locale === 'fr'
                      ? {
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                          },
                        }
                      : {
                          borderColor: 'rgba(232, 226, 213, 0.3)',
                          color: 'rgba(232, 226, 213, 0.6)',
                          '&:hover': {
                            borderColor: '#10B981',
                            color: '#10B981',
                            bgcolor: 'rgba(16, 185, 129, 0.05)',
                          },
                        }),
                  }}
                >
                  Français
                </Button>
                <Button
                  onClick={() => handleLanguageChange('en')}
                  variant={locale === 'en' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<LanguageIcon />}
                  sx={{
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    ...(locale === 'en'
                      ? {
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                          },
                        }
                      : {
                          borderColor: 'rgba(232, 226, 213, 0.3)',
                          color: 'rgba(232, 226, 213, 0.6)',
                          '&:hover': {
                            borderColor: '#10B981',
                            color: '#10B981',
                            bgcolor: 'rgba(16, 185, 129, 0.05)',
                          },
                        }),
                  }}
                >
                  English
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Bottom Bar */}
          <Box
            sx={{
              pt: 3,
              borderTop: '1px solid rgba(232, 226, 213, 0.1)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(232, 226, 213, 0.5)',
                fontSize: '0.8rem',
                letterSpacing: '0.02em',
              }}
            >
              © {new Date().getFullYear()} Valea Max.{' '}
              {locale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
