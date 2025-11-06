'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  CheckCircle,
  ArrowBack,
  Language as LanguageIcon,
  AutoAwesome,
} from '@mui/icons-material'
import { STRIPE_PLANS, CREDITS_BUNDLES, PlanType, CreditsBundleType } from '@/lib/stripe/client-config'

export default function SignupCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations('landing')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Get user info from URL params (passed from signup form)
  const email = searchParams.get('email') || ''
  const fullName = searchParams.get('name') || ''
  const organizationName = searchParams.get('organization') || ''
  const tempPassword = searchParams.get('temp') || ''
  const verified = searchParams.get('verified') === 'true'

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly')
  const [selectedCredits, setSelectedCredits] = useState<CreditsBundleType | null>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = window.location.pathname
    const searchParamsStr = window.location.search
    const newPathname = currentPath.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname + searchParamsStr)
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/signup-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          organizationName,
          tempPassword,
          planType: selectedPlan,
          creditsBundle: selectedCredits,
          locale
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
      setLoading(false)
    }
  }

  const plan = STRIPE_PLANS[selectedPlan]
  const creditsBundle = selectedCredits ? CREDITS_BUNDLES[selectedCredits] : null
  const totalPrice = plan.price + (creditsBundle?.price || 0)

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Redirect if missing required params, invalid email, or not verified
  if (!email || !fullName || !tempPassword || !isValidEmail(email) || !verified) {
    router.push(`/${locale}/signup`)
    return null
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          zIndex: 1100,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid rgba(26, 31, 54, 0.1)`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
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

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push(`/${locale}/signup`)}
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
          position: 'relative',
          flexGrow: 1,
          py: { xs: 2, md: 3 },
          px: { xs: 2, sm: 3, md: 0 },
          backgroundImage: 'url(/backgrounds/bg9.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 0,
          },
        }}
      >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3, mt: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-montserrat)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            {locale === 'fr' ? 'Choisissez votre plan' : 'Choose Your Plan'}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            }}
          >
            {locale === 'fr'
              ? `Bienvenue, ${fullName}! Sélectionnez votre abonnement pour commencer.`
              : `Welcome, ${fullName}! Select your subscription to get started.`}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ px: { xs: 0, md: 8, lg: 16 } }}>
          {/* Left: Plan Selection */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '16px', mb: 2, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 4, height: 20, bgcolor: '#10B981', borderRadius: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1F36' }}>
                    {locale === 'fr' ? 'Abonnement (Requis)' : 'Subscription (Required)'}
                  </Typography>
                </Box>

                <RadioGroup
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as PlanType)}
                >
                  <Stack spacing={1.5}>
                    {Object.entries(STRIPE_PLANS).map(([key, planData]) => (
                      <Box
                        key={key}
                        sx={{
                          p: 2,
                          border: selectedPlan === key ? '2px solid #10B981' : '2px solid #E5E7EB',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          bgcolor: selectedPlan === key ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                          boxShadow: selectedPlan === key ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                          '&:hover': {
                            borderColor: '#10B981',
                            bgcolor: 'rgba(16, 185, 129, 0.03)',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
                          },
                        }}
                        onClick={() => setSelectedPlan(key as PlanType)}
                      >
                        <FormControlLabel
                          value={key}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1, width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {planData.name}
                                </Typography>
                                {key === 'annual' && (
                                  <Chip
                                    label={locale === 'fr' ? 'Économisez 20%' : 'Save 20%'}
                                    size="small"
                                    sx={{
                                      bgcolor: '#10B981',
                                      color: 'white',
                                      fontWeight: 600,
                                      height: '20px',
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981', mb: 0.5 }}>
                                ${planData.price}
                                <Typography component="span" variant="body2" sx={{ color: '#6B7280', ml: 1 }}>
                                  CAD/{locale === 'fr' ? 'mois' : 'month'}
                                </Typography>
                              </Typography>
                              {key === 'annual' && 'savings' in planData && planData.savings && (
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                  {locale === 'fr'
                                    ? `Économisez $${planData.savings}/année`
                                    : `Save $${planData.savings}/year`}
                                </Typography>
                              )}
                            </Box>
                          }
                          sx={{ margin: 0, width: '100%' }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* AI Credits (Optional) */}
            <Card sx={{ borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                    <AutoAwesome sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1F36' }}>
                    {locale === 'fr' ? 'Crédits IA (Optionnel)' : 'AI Credits (Optional)'}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#6B7280', mb: 2, display: 'block' }}>
                  {locale === 'fr'
                    ? 'Ajoutez des crédits pour utiliser les fonctionnalités IA. Vous pouvez aussi en acheter plus tard.'
                    : 'Add credits to use AI features. You can also purchase more later.'}
                </Typography>

                <RadioGroup
                  value={selectedCredits || ''}
                  onChange={(e) => setSelectedCredits(e.target.value as CreditsBundleType || null)}
                >
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        p: 1.5,
                        border: selectedCredits === null ? '2px solid #10B981' : '2px solid #E5E7EB',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#10B981',
                          bgcolor: 'rgba(16, 185, 129, 0.02)',
                        },
                      }}
                      onClick={() => setSelectedCredits(null)}
                    >
                      <FormControlLabel
                        value=""
                        control={<Radio />}
                        label={
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {locale === 'fr' ? 'Pas maintenant' : 'Not now'}
                          </Typography>
                        }
                      />
                    </Box>

                    {Object.entries(CREDITS_BUNDLES).map(([key, bundle]) => (
                      <Box
                        key={key}
                        sx={{
                          p: 1.5,
                          border: selectedCredits === key ? '2px solid #10B981' : '2px solid #E5E7EB',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#10B981',
                            bgcolor: 'rgba(16, 185, 129, 0.02)',
                          },
                        }}
                        onClick={() => setSelectedCredits(key as CreditsBundleType)}
                      >
                        <FormControlLabel
                          value={key}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {bundle.credits} {locale === 'fr' ? 'crédits' : 'credits'}
                                  </Typography>
                                  {bundle.popular && (
                                    <Chip
                                      label={locale === 'fr' ? 'Populaire' : 'Popular'}
                                      size="small"
                                      sx={{ bgcolor: '#FFA500', color: 'white', fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                                {'savings' in bundle && bundle.savings && (
                                  <Typography variant="caption" sx={{ color: '#10B981' }}>
                                    {locale === 'fr' ? 'Économisez' : 'Save'} ${bundle.savings}
                                  </Typography>
                                )}
                              </Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                ${bundle.price} CAD
                              </Typography>
                            </Box>
                          }
                          sx={{ margin: 0, width: '100%' }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Order Summary */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: '16px',
                position: 'sticky',
                top: 100,
                bgcolor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: '2px solid #10B981',
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 16px 48px rgba(16, 185, 129, 0.25)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#10B981', borderRadius: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1F36' }}>
                    {locale === 'fr' ? 'Résumé de la commande' : 'Order Summary'}
                  </Typography>
                </Box>

                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{plan.name} {locale === 'fr' ? 'Abonnement' : 'Subscription'}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>${plan.price} CAD</Typography>
                  </Box>

                  {creditsBundle && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {creditsBundle.credits} {locale === 'fr' ? 'crédits IA' : 'AI credits'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${creditsBundle.price} CAD</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#10B981' }}>
                    ${totalPrice} CAD
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  onClick={handleCheckout}
                  sx={{
                    py: 1.5,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '16px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    locale === 'fr' ? 'Procéder au paiement' : 'Proceed to Payment'
                  )}
                </Button>

                <Typography
                  variant="caption"
                  sx={{ display: 'block', textAlign: 'center', color: '#6B7280', mt: 2 }}
                >
                  {locale === 'fr'
                    ? 'Paiement sécurisé par Stripe'
                    : 'Secure payment powered by Stripe'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}>
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
                fontSize: '0.85rem',
                letterSpacing: '0.02em',
              }}
            >
              © {new Date().getFullYear()} Valea Max. {t('footer.rights')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
