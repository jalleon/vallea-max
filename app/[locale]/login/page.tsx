'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar,
  Stack,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Apple,
  Language as LanguageIcon,
  ArrowBack,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { t, locale } = useTranslation('auth.login')
  const { t: tCommon } = useTranslation('common')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        console.error('Login error:', error)
        setError(t('error'))
        setLoading(false)
      } else {
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push(`/${locale}/dashboard`)
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login exception:', err)
      setError(err.message || t('error'))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLocale: string) => {
    const newPathname = window.location.pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                flexGrow: 1,
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
                transition: 'opacity 0.2s',
              }}
              onClick={() => router.push(`/${locale}`)}
            >
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1A1F36 0%, #232A44 50%, #2D3561 100%)',
          position: 'relative',
          py: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(90deg, rgba(232, 226, 213, 0.08) 0px, transparent 1px, transparent 40px, rgba(232, 226, 213, 0.08) 41px),
              repeating-linear-gradient(0deg, rgba(232, 226, 213, 0.08) 0px, transparent 1px, transparent 40px, rgba(232, 226, 213, 0.08) 41px),
              radial-gradient(ellipse at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 60%)
            `,
            pointerEvents: 'none',
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
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mb: 3, gap: 2.5 }}>
                  <Image
                    src="/logo.png"
                    alt="Valea Max Logo"
                    width={100}
                    height={100}
                    style={{ borderRadius: '16px' }}
                  />
                  <Box sx={{ textAlign: 'left', mt: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'var(--font-montserrat)',
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        lineHeight: 1.1,
                        letterSpacing: '-0.5px',
                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                      }}
                    >
                      {tCommon('appName')}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'var(--font-inter)',
                        fontWeight: 400,
                        color: '#4A5568',
                        fontSize: '0.8rem',
                        letterSpacing: '0.15em',
                        display: 'block',
                        mt: 0.5,
                        textAlign: 'center',
                      }}
                    >
                      {locale === 'fr' ? 'Évaluation immobilière' : 'Real Estate Valuation'}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ color: '#4A5568', fontWeight: 300, mt: 2 }}>
                  {t('subtitle')}
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                  {error}
                </Alert>
              )}

              {/* OAuth Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  sx={{
                    borderRadius: '8px',
                    borderColor: 'rgba(26, 31, 54, 0.2)',
                    color: '#1A1F36',
                    textTransform: 'none',
                    fontSize: '15px',
                    py: 1.5,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#4285F4',
                      bgcolor: 'rgba(66, 133, 244, 0.04)',
                      color: '#4285F4',
                    },
                  }}
                >
                  {t('continueWithGoogle') || 'Continue with Google'}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Apple />}
                  onClick={handleAppleLogin}
                  disabled={loading}
                  sx={{
                    borderRadius: '8px',
                    borderColor: 'rgba(26, 31, 54, 0.2)',
                    color: '#1A1F36',
                    textTransform: 'none',
                    fontSize: '15px',
                    py: 1.5,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#000',
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: '#000',
                    },
                  }}
                >
                  {t('continueWithApple') || 'Continue with Apple'}
                </Button>
              </Box>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  {t('orContinueWith') || 'or'}
                </Typography>
              </Divider>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label={t('email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label={t('password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '16px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('submit')}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    {t('noAccount')}{' '}
                    <Link
                      href={`/${locale}/signup`}
                      sx={{
                        fontWeight: 600,
                        color: '#10B981',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {t('createAccount')}
                    </Link>
                  </Typography>
                </Box>
              </form>
            </CardContent>
          </Card>
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
