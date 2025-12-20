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
  Grid,
} from '@mui/material'
import { CalendarMonth, CheckCircle } from '@mui/icons-material'

export default function DemoRequestForm() {
  const t = useTranslations('landing.demo')
  const locale = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          company,
          phone,
          message,
          locale
        }),
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
        setCompany('')
        setPhone('')
        setMessage('')
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
          maxWidth: 600,
          mx: 'auto',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle
            sx={{
              fontSize: 64,
              color: 'primary.main',
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
        maxWidth: 600,
        mx: 'auto',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('emailPlaceholder')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('companyPlaceholder')}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('phonePlaceholder')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                multiline
                rows={3}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={!loading && <CalendarMonth />}
                sx={{
                  py: 1.5,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b3f8f 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('submitButton')
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}
