'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  alpha,
} from '@mui/material'
import { Email, CheckCircle } from '@mui/icons-material'

export default function WaitlistForm() {
  const t = useTranslations('landing.waitlist')
  const locale = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, locale }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError(t('alreadyExists'))
        } else {
          setError(t('error'))
        }
      } else {
        setSuccess(true)
        setName('')
        setEmail('')
      }
    } catch (err) {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card
        sx={{
          maxWidth: 500,
          mx: 'auto',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          border: '2px solid',
          borderColor: 'success.main',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle
            sx={{
              fontSize: 64,
              color: 'success.main',
              mb: 2,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1A1F36' }}>
            {t('success')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: 500,
        mx: 'auto',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Email
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
            size="small"
          />

          <TextField
            fullWidth
            label={t('emailPlaceholder')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
            size="small"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('submitButton')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
