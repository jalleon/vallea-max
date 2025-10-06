'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  const router = useRouter()
  const { t, locale } = useTranslation('common')

  useEffect(() => {
    // Always include locale prefix with 'always' mode
    const path = `/${locale}/dashboard`
    router.push(path)
  }, [router, locale])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      {t('redirecting')}
    </div>
  )
}
