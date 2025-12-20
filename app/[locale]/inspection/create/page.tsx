'use client'

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'
import type { PropertyType } from '@/features/library/types/property.types'

const provinces = [
  'QC', 'ON', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'
]

const propertyTypes = [
  'Condo',
  'Unifamiliale',
  'Duplex',
  'Triplex',
  'Quadriplex+',
  'Appartement',
  'Semi-commercial',
  'Terrain',
  'Commercial',
  'Autre'
]

export default function CreateInspectionPage() {
  const t = useTranslations('inspection.form')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    province: 'QC',
    propertyType: 'Unifamiliale'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.address.trim()) {
      newErrors.address = t('required')
    }
    if (!formData.city.trim()) {
      newErrors.city = t('required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const property = await propertiesSupabaseService.createProperty({
        adresse: formData.address,
        ville: formData.city,
        province: formData.province,
        type_propriete: formData.propertyType as PropertyType,
        status: 'Sujet', // Automatically assign Sujet status for inspection properties
        source: 'Inspection',
        inspection_status: 'in_progress',
        inspection_completion: 0,
        inspection_date: new Date().toISOString()
      })

      router.push(`/${locale}/inspection/${property.id}/categories`)
    } catch (err) {
      console.error('Error creating inspection:', err)
      setError(tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/${locale}/inspection`)
  }

  return (
    <MaterialDashboardLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header with gradient */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            p: 4,
            mb: 3,
            borderRadius: 2
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {t('subtitle')}
          </Typography>
        </Paper>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                label={t('address')}
                placeholder={t('addressPlaceholder')}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                required
                fullWidth
                disabled={loading}
              />

              <TextField
                label={t('city')}
                placeholder={t('cityPlaceholder')}
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                required
                fullWidth
                disabled={loading}
              />

              <FormControl fullWidth disabled={loading}>
                <InputLabel>{t('province')}</InputLabel>
                <Select
                  value={formData.province}
                  label={t('province')}
                  onChange={(e) => handleChange('province', e.target.value)}
                >
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={loading}>
                <InputLabel>{t('propertyType')}</InputLabel>
                <Select
                  value={formData.propertyType}
                  label={t('propertyType')}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                  size="large"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{
                    bgcolor: '#16a34a',
                    '&:hover': {
                      bgcolor: '#15803d'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      {t('creating')}
                    </>
                  ) : (
                    t('create')
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </MaterialDashboardLayout>
  )
}
