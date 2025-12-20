'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material'
import { CheckCircle, ErrorOutline } from '@mui/icons-material'
import Image from 'next/image'

export default function SignupSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push(`/${locale}/signup`)
      return
    }

    // Poll for account creation (webhook creates account)
    const checkAccountStatus = async () => {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check if user is authenticated
      if (user) {
        setStatus('success')
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/dashboard`)
        }, 2000)
      } else if (!authLoading) {
        // If not loading and no user, try to auto-login
        // User should refresh or manually login if webhook hasn't completed yet
        setStatus('success')
        setTimeout(() => {
          router.push(`/${locale}/login?message=account_created`)
        }, 3000)
      }
    }

    checkAccountStatus()
  }, [sessionId, user, authLoading, router, locale])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/backgrounds/bg7.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Image
                src="/logo.png"
                alt="Valea Max"
                width={100}
                height={100}
                style={{ borderRadius: '16px' }}
              />
            </Box>

            {status === 'processing' && (
              <Stack spacing={3} alignItems="center">
                <CircularProgress size={60} sx={{ color: '#10B981' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {locale === 'fr' ? 'Création de votre compte...' : 'Creating your account...'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  {locale === 'fr'
                    ? 'Veuillez patienter quelques instants.'
                    : 'Please wait a moment.'}
                </Typography>
              </Stack>
            )}

            {status === 'success' && (
              <Stack spacing={3} alignItems="center">
                <CheckCircle sx={{ fontSize: 80, color: '#10B981' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {locale === 'fr' ? 'Paiement réussi!' : 'Payment Successful!'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  {locale === 'fr'
                    ? 'Votre compte a été créé avec succès.'
                    : 'Your account has been created successfully.'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {user
                    ? locale === 'fr'
                      ? 'Redirection vers le tableau de bord...'
                      : 'Redirecting to dashboard...'
                    : locale === 'fr'
                    ? 'Redirection vers la page de connexion...'
                    : 'Redirecting to login page...'}
                </Typography>
              </Stack>
            )}

            {status === 'error' && (
              <Stack spacing={3} alignItems="center">
                <ErrorOutline sx={{ fontSize: 80, color: '#EF4444' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#EF4444' }}>
                  {locale === 'fr' ? 'Une erreur est survenue' : 'An error occurred'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  {locale === 'fr'
                    ? 'Veuillez contacter le support si le problème persiste.'
                    : 'Please contact support if the problem persists.'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/${locale}/login`)}
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {locale === 'fr' ? 'Aller à la connexion' : 'Go to Login'}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
