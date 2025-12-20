'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  useTheme,
} from '@mui/material'
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material'

export default function VerifyEmailPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme()
  const locale = params.locale

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verifiedData, setVerifiedData] = useState<any>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError(locale === 'fr' ? 'Token de vérification manquant' : 'Verification token missing')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed')
        }

        setVerifiedData(data)
        setError('')

        // After 2 seconds, redirect to checkout with verified user data
        setTimeout(() => {
          const params = new URLSearchParams({
            email: data.email,
            name: data.fullName,
            temp: data.tempPassword,
            verified: 'true',
          })
          router.push(`/${locale}/signup-checkout?${params.toString()}`)
        }, 2000)
      } catch (err: any) {
        setError(err.message || (locale === 'fr' ? 'Échec de la vérification' : 'Verification failed'))
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, locale, router])

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
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          py: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/backgrounds/bg9.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.6)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(232, 226, 213, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              {loading && (
                <>
                  <CircularProgress size={60} sx={{ mb: 3, color: '#10B981' }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {locale === 'fr' ? 'Vérification en cours...' : 'Verifying...'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    {locale === 'fr'
                      ? 'Veuillez patienter pendant que nous vérifions votre adresse e-mail.'
                      : 'Please wait while we verify your email address.'}
                  </Typography>
                </>
              )}

              {!loading && error && (
                <>
                  <ErrorIcon sx={{ fontSize: 80, color: '#EF4444', mb: 3 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#EF4444' }}>
                    {locale === 'fr' ? 'Échec de la vérification' : 'Verification Failed'}
                  </Typography>
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', textAlign: 'left' }}>
                    {error}
                  </Alert>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                    {locale === 'fr'
                      ? 'Le lien de vérification peut avoir expiré (30 minutes) ou être invalide.'
                      : 'The verification link may have expired (30 minutes) or be invalid.'}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push(`/${locale}/signup`)}
                    sx={{
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                      },
                    }}
                  >
                    {locale === 'fr' ? 'Retour à l\'inscription' : 'Back to Signup'}
                  </Button>
                </>
              )}

              {!loading && verifiedData && !error && (
                <>
                  <CheckCircle sx={{ fontSize: 80, color: '#10B981', mb: 3 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#10B981' }}>
                    {locale === 'fr' ? 'Email vérifié avec succès!' : 'Email Verified Successfully!'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
                    {locale === 'fr'
                      ? 'Redirection vers la page de paiement...'
                      : 'Redirecting to checkout...'}
                  </Typography>
                  <CircularProgress size={40} sx={{ color: '#10B981' }} />
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  )
}
