'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
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
  const t = useTranslations('signup')
  const tPricing = useTranslations('pricing')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Get user info from URL params (passed from signup form)
  const email = searchParams.get('email') || ''
  const fullName = searchParams.get('name') || ''
  const tempPassword = searchParams.get('temp') || ''

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly')
  const [selectedCredits, setSelectedCredits] = useState<CreditsBundleType | null>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if missing required params
  if (!email || !fullName || !tempPassword) {
    router.push(`/${locale}/signup`)
    return null
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

  const handleLanguageChange = (newLocale: string) => {
    const newPathname = window.location.pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname + window.location.search)
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'var(--font-montserrat)',
            fontWeight: 700,
            color: '#1A1F36',
            mb: 1,
            textAlign: 'center',
          }}
        >
          {locale === 'fr' ? 'Choisissez votre plan' : 'Choose Your Plan'}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#6B7280', textAlign: 'center', mb: 4 }}
        >
          {locale === 'fr'
            ? `Bienvenue, ${fullName}! Sélectionnez votre abonnement pour commencer.`
            : `Welcome, ${fullName}! Select your subscription to get started.`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left: Plan Selection */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: '16px', mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  {locale === 'fr' ? 'Abonnement (Requis)' : 'Subscription (Required)'}
                </Typography>

                <RadioGroup
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as PlanType)}
                >
                  <Stack spacing={2}>
                    {Object.entries(STRIPE_PLANS).map(([key, planData]) => (
                      <Box
                        key={key}
                        sx={{
                          p: 3,
                          border: selectedPlan === key ? '2px solid #10B981' : '2px solid #E5E7EB',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#10B981',
                            bgcolor: 'rgba(16, 185, 129, 0.02)',
                          },
                        }}
                        onClick={() => setSelectedPlan(key as PlanType)}
                      >
                        <FormControlLabel
                          value={key}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1, width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}>
                                ${planData.price}
                                <Typography component="span" variant="body2" sx={{ color: '#6B7280', ml: 1 }}>
                                  CAD/{locale === 'fr' ? 'mois' : 'month'}
                                </Typography>
                              </Typography>
                              {key === 'annual' && planData.savings && (
                                <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
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
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AutoAwesome sx={{ color: '#10B981' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {locale === 'fr' ? 'Crédits IA (Optionnel)' : 'AI Credits (Optional)'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                  {locale === 'fr'
                    ? 'Ajoutez des crédits pour utiliser les fonctionnalités IA. Vous pouvez aussi en acheter plus tard.'
                    : 'Add credits to use AI features. You can also purchase more later.'}
                </Typography>

                <RadioGroup
                  value={selectedCredits || ''}
                  onChange={(e) => setSelectedCredits(e.target.value as CreditsBundleType || null)}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 2,
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
                          <Typography sx={{ ml: 1 }}>
                            {locale === 'fr' ? 'Pas maintenant' : 'Not now'}
                          </Typography>
                        }
                      />
                    </Box>

                    {Object.entries(CREDITS_BUNDLES).map(([key, bundle]) => (
                      <Box
                        key={key}
                        sx={{
                          p: 2,
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
                                {bundle.savings && (
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
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: '16px',
                position: 'sticky',
                top: 100,
                bgcolor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid #10B981',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  {locale === 'fr' ? 'Résumé de la commande' : 'Order Summary'}
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{plan.name} {locale === 'fr' ? 'Abonnement' : 'Subscription'}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>${plan.price} CAD</Typography>
                  </Box>

                  {creditsBundle && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>
                        {creditsBundle.credits} {locale === 'fr' ? 'crédits IA' : 'AI credits'}
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>${creditsBundle.price} CAD</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
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
  )
}
