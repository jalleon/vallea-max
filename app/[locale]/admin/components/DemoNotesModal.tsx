'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material'
import { Close, Check } from '@mui/icons-material'

interface DemoNotesModalProps {
  open: boolean
  onClose: () => void
  demo: any
  locale: string
  onSuccess: (message: string) => void
}

export default function DemoNotesModal({ open, onClose, demo, locale, onSuccess }: DemoNotesModalProps) {
  const [notes, setNotes] = useState(demo?.admin_notes || '')
  const [contacted, setContacted] = useState(demo?.contacted || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!demo) return null

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      const response = await fetch('/api/admin/demo-requests/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          demoId: demo.id,
          admin_notes: notes,
          contacted
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update demo request')
      }

      const successMessage = locale === 'fr'
        ? 'Demande de démo mise à jour avec succès'
        : 'Demo request updated successfully'

      onSuccess(successMessage)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update demo request')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNotes(demo?.admin_notes || '')
    setContacted(demo?.contacted || false)
    setError('')
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fr' ? 'fr-CA' : 'en-CA')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {locale === 'fr' ? 'Détails de la demande de démo' : 'Demo Request Details'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Contact Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {locale === 'fr' ? 'Informations de contact' : 'Contact Information'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                {locale === 'fr' ? 'Nom:' : 'Name:'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {demo.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                Email:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {demo.email}
              </Typography>
            </Box>
            {demo.company && (
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                  {locale === 'fr' ? 'Entreprise:' : 'Company:'}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {demo.company}
                </Typography>
              </Box>
            )}
            {demo.phone && (
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                  {locale === 'fr' ? 'Téléphone:' : 'Phone:'}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {demo.phone}
                </Typography>
              </Box>
            )}
            {demo.message && (
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                  Message:
                </Typography>
                <Typography variant="body1">
                  {demo.message}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                {locale === 'fr' ? 'Date de demande:' : 'Request Date:'}
              </Typography>
              <Typography variant="body1">
                {formatDate(demo.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
            {locale === 'fr' ? 'Statut:' : 'Status:'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={contacted ? (locale === 'fr' ? 'Contacté' : 'Contacted') : (locale === 'fr' ? 'Non contacté' : 'Not Contacted')}
              color={contacted ? 'success' : 'default'}
              onClick={() => setContacted(!contacted)}
              icon={contacted ? <Check /> : undefined}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>

        {/* Notes */}
        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={locale === 'fr' ? 'Notes administrateur' : 'Admin Notes'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={locale === 'fr' ? 'Ajouter des notes...' : 'Add notes...'}
            helperText={locale === 'fr' ? 'Notes internes visibles uniquement par les administrateurs' : 'Internal notes visible only to administrators'}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none' }}>
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#FFF' }} />
          ) : locale === 'fr' ? (
            'Enregistrer'
          ) : (
            'Save'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
