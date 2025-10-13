'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRandomBackground } from '@/hooks/useRandomBackground'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSwitcherCompact } from '@/components/ui/LanguageSwitcher'
import {
  Box,
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
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Google, Apple } from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { Divider } from '@mui/material'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const backgroundImage = useRandomBackground()
  const { t, locale } = useTranslation('auth.login')
  const { t: tCommon } = useTranslation('common')
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Clear any existing session first to avoid conflicts
    await supabase.auth.signOut()

    const { error } = await signIn(email, password)

    if (error) {
      setError(t('error'))
      setLoading(false)
    } else {
      router.push(`/${locale}/dashboard`)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
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
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7)',
          zIndex: 0,
        },
      }}
    >
      {/* Language Switcher in top right */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
        }}
      >
        <LanguageSwitcherCompact />
      </Box>

      <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 24, position: 'relative', zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Image
                src="/logo.png"
                alt="Valea Max Logo"
                width={100}
                height={100}
                style={{ borderRadius: '12px' }}
              />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {tCommon('appName')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('subtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
                borderColor: '#4285F4',
                color: '#4285F4',
                textTransform: 'none',
                fontSize: '15px',
                py: 1.5,
                '&:hover': {
                  borderColor: '#357ae8',
                  bgcolor: 'rgba(66, 133, 244, 0.04)'
                }
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
                borderColor: '#000',
                color: '#000',
                textTransform: 'none',
                fontSize: '15px',
                py: 1.5,
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {t('continueWithApple') || 'Continue with Apple'}
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
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
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
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
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
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
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {loading ? <CircularProgress size={24} /> : t('submit')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('noAccount')}{' '}
                <Link
                  href={`/${locale === 'fr' ? '' : locale + '/'}signup`}
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('createAccount')}
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}