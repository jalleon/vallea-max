'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const { t, locale } = useTranslation('common')
  const router = useRouter()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('notFound.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('notFound.description')}
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push(`/${locale}/dashboard`)}
        sx={{ mt: 2 }}
      >
        {t('notFound.goHome')}
      </Button>
    </Box>
  )
}