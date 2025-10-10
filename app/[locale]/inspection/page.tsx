'use client'

import React, { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  alpha
} from '@mui/material'
import {
  Add,
  Delete,
  ArrowForward
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service'
import { Property } from '@/features/library/types/property.types'
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout'

export default function InspectionPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all properties and filter client-side for inspections
      const { items } = await propertiesSupabaseService.getProperties({ limit: 1000 })

      // Filter for properties with in_progress or completed inspections from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const inspections = items.filter(prop => {
        if (!prop.inspection_status) return false

        const hasActiveStatus =
          prop.inspection_status === 'in_progress' ||
          prop.inspection_status === 'completed'

        if (!hasActiveStatus) return false

        // If completed, only show if within last 7 days
        if (prop.inspection_status === 'completed' && prop.updated_at) {
          return prop.updated_at >= sevenDaysAgo
        }

        return true
      })

      // Sort by most recently updated first
      inspections.sort((a, b) => {
        const dateA = a.updated_at?.getTime() || 0
        const dateB = b.updated_at?.getTime() || 0
        return dateB - dateA
      })

      setProperties(inspections)
    } catch (err) {
      console.error('Error loading inspections:', err)
      setError('Failed to load inspections')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    router.push(`/${locale}/inspection/create`)
  }

  const handleContinue = (propertyId: string) => {
    router.push(`/${locale}/inspection/${propertyId}/categories`)
  }

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return

    try {
      await propertiesSupabaseService.delete(propertyToDelete.id)
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
      loadInspections()
    } catch (err) {
      console.error('Error deleting property:', err)
      setError('Failed to delete inspection')
    }
  }

  const getProgressColor = (progress: number = 0) => {
    if (progress <= 33) return 'error'
    if (progress <= 66) return 'warning'
    return 'success'
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {t('inspection.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateNew}
            sx={{
              bgcolor: '#16a34a',
              '&:hover': {
                bgcolor: '#15803d'
              }
            }}
          >
            {t('inspection.createNew')}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : properties.length === 0 ? (
          /* Empty State */
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('inspection.empty')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('inspection.emptyDescription')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleCreateNew}
            >
              {t('inspection.createNew')}
            </Button>
          </Paper>
        ) : (
          /* Table */
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('inspection.table.address')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('inspection.table.city')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('inspection.table.type')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('inspection.table.progress')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('inspection.table.lastUpdated')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    {t('inspection.table.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} hover>
                    <TableCell>{property.adresse}</TableCell>
                    <TableCell>{property.ville || 'N/A'}</TableCell>
                    <TableCell>{property.type_propriete || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${property.inspection_completion || 0}%`}
                        color={getProgressColor(property.inspection_completion)}
                        size="small"
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(property.updated_at)}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => handleContinue(property.id)}
                        sx={{ mr: 1 }}
                      >
                        {t('inspection.continue')}
                      </Button>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(property)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>{t('inspection.confirmDelete')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('inspection.deleteMessage')}
              {propertyToDelete && (
                <Box sx={{ mt: 2 }}>
                  <strong>{propertyToDelete.adresse}</strong>
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MaterialDashboardLayout>
  )
}
