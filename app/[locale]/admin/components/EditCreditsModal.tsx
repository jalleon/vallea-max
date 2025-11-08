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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import { Close, Add, Remove } from '@mui/icons-material'

interface EditCreditsModalProps {
  open: boolean
  onClose: () => void
  user: any
  locale: string
  onSuccess: (message: string) => void
}

export default function EditCreditsModal({ open, onClose, user, locale, onSuccess }: EditCreditsModalProps) {
  const [operation, setOperation] = useState<'add' | 'set'>('add')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const handleSave = async () => {
    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      setError(locale === 'fr' ? 'Veuillez entrer un nombre valide' : 'Please enter a valid number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const authData = localStorage.getItem('supabase.auth.token')
      const token = authData ? JSON.parse(authData).access_token : null

      const response = await fetch('/api/admin/update-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          operation,
          amount: numAmount
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update credits')
      }

      const successMessage = locale === 'fr'
        ? `Crédits mis à jour avec succès`
        : `Credits updated successfully`

      onSuccess(successMessage)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update credits')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setOperation('add')
    setError('')
    onClose()
  }

  const currentCredits = user.ai_credits_balance || 0
  const newCredits = operation === 'add'
    ? currentCredits + (parseInt(amount) || 0)
    : parseInt(amount) || 0

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {locale === 'fr' ? 'Modifier les crédits' : 'Edit Credits'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#6B7280' }}>
            {locale === 'fr' ? 'Utilisateur:' : 'User:'}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {user.full_name || user.email}
          </Typography>
        </Box>

        <Box sx={{ mb: 3, p: 2, bgcolor: '#F3F4F6', borderRadius: '12px' }}>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
            {locale === 'fr' ? 'Crédits actuels:' : 'Current Credits:'}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            {currentCredits}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            {locale === 'fr' ? 'Opération:' : 'Operation:'}
          </FormLabel>
          <RadioGroup
            value={operation}
            onChange={(e) => setOperation(e.target.value as 'add' | 'set')}
            row
          >
            <FormControlLabel
              value="add"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Add fontSize="small" />
                  {locale === 'fr' ? 'Ajouter' : 'Add'}
                </Box>
              }
            />
            <FormControlLabel
              value="set"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Remove fontSize="small" />
                  {locale === 'fr' ? 'Définir' : 'Set'}
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          label={locale === 'fr' ? 'Montant' : 'Amount'}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputProps={{
            inputProps: { min: 0 }
          }}
          helperText={
            operation === 'add'
              ? locale === 'fr'
                ? 'Nombre de crédits à ajouter'
                : 'Number of credits to add'
              : locale === 'fr'
                ? 'Nouveau nombre total de crédits'
                : 'New total number of credits'
          }
          sx={{ mb: 3 }}
        />

        {amount && !isNaN(parseInt(amount)) && (
          <Box sx={{ p: 2, bgcolor: newCredits >= currentCredits ? '#ECFDF5' : '#FEF2F2', borderRadius: '12px', border: `1px solid ${newCredits >= currentCredits ? '#10B981' : '#EF4444'}` }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#6B7280' }}>
              {locale === 'fr' ? 'Nouveaux crédits:' : 'New Credits:'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: newCredits >= currentCredits ? '#10B981' : '#EF4444' }}>
                {newCredits}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                ({newCredits >= currentCredits ? '+' : ''}{newCredits - currentCredits})
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none' }}>
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !amount}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
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
