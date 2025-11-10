'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert
} from '@mui/material'
import { createClient } from '@/lib/supabase/client'

interface EditUserModalProps {
  open: boolean
  onClose: () => void
  user: {
    id: string
    full_name: string | null
    email: string
    organization_id: string | null
    organization?: { id: string; name: string } | null
  } | null
  onUserUpdated: () => void
  locale: string
}

interface Organization {
  id: string
  name: string
}

export default function EditUserModal({ open, onClose, user, onUserUpdated, locale }: EditUserModalProps) {
  const [fullName, setFullName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  // Load organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoadingOrgs(true)
        const supabase = createClient()
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name')

        if (error) throw error
        setOrganizations(data || [])
      } catch (err: any) {
        console.error('Error fetching organizations:', err)
        setError(locale === 'fr' ? 'Erreur lors du chargement des organisations' : 'Error loading organizations')
      } finally {
        setLoadingOrgs(false)
      }
    }

    if (open) {
      fetchOrganizations()
    }
  }, [open, locale])

  // Set form values when user changes
  useEffect(() => {
    if (user) {
      console.log('[EditUserModal] Setting form values for user:', user)
      setFullName(user.full_name || '')
      setOrganizationId(user.organization_id || '')
      console.log('[EditUserModal] Form values set:', {
        fullName: user.full_name || '',
        organizationId: user.organization_id || ''
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No session found')
      }

      const updatePayload = {
        userId: user.id,
        full_name: fullName.trim() || null,
        organization_id: organizationId || null
      }

      console.log('[EditUserModal] Sending update:', updatePayload)

      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updatePayload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      await onUserUpdated()
      onClose()
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError(err.message || (locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating user'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {locale === 'fr' ? 'Modifier l\'utilisateur' : 'Edit User'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            label={locale === 'fr' ? 'Email' : 'Email'}
            value={user?.email || ''}
            disabled
            fullWidth
            size="small"
          />

          <TextField
            label={locale === 'fr' ? 'Nom complet' : 'Full Name'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            size="small"
            placeholder={locale === 'fr' ? 'Entrez le nom' : 'Enter name'}
          />

          <TextField
            select
            label={locale === 'fr' ? 'Organisation' : 'Organization'}
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            fullWidth
            size="small"
            disabled={loadingOrgs}
            helperText={loadingOrgs ? (locale === 'fr' ? 'Chargement...' : 'Loading...') : ''}
          >
            <MenuItem value="">
              {locale === 'fr' ? 'Aucune organisation' : 'No organization'}
            </MenuItem>
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...') : (locale === 'fr' ? 'Enregistrer' : 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
