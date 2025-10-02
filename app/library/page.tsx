'use client'

import React, { useState, useEffect } from 'react'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Fab,
  Tooltip,
  alpha,
  InputAdornment,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Toolbar,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import {
  Add,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  Home,
  Business,
  Factory,
  Terrain,
  LocationOn,
  CalendarToday,
  AttachMoney,
  SquareFoot,
  TrendingUp,
  Download,
  Share,
  DeleteForever
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../components/layout/MaterialDashboardLayout'
import { PropertyView } from '../../features/library/components/PropertyView'
import { PropertyEdit } from '../../features/library/components/PropertyEdit'
import { Property, PropertyCreateInput } from '../../features/library/types/property.types'
import { propertiesService } from '../../features/library/_api/mock-properties.service'

// Mock organization ID - in a real app this would come from auth context
const MOCK_ORG_ID = 'mock-org-id'

const stats = [
  {
    title: 'Total Propriétés',
    value: '156',
    change: '+12',
    icon: Home,
    color: 'primary'
  },
  {
    title: 'Valeur Portfolio',
    value: '47.2M $',
    change: '+8.3%',
    icon: AttachMoney,
    color: 'success'
  },
  {
    title: 'Évaluations ce mois',
    value: '23',
    change: '+15%',
    icon: TrendingUp,
    color: 'info'
  },
  {
    title: 'Nouvelles propriétés',
    value: '8',
    change: '+2',
    icon: Add,
    color: 'warning'
  }
]

// Convert Property format to table format for display
const convertToTableFormat = (property: Property): any => ({
  id: property.id,
  idNo: `24-${property.id.slice(-4).padStart(4, '0')}`,
  address: property.adresse,
  city: property.ville || property.municipalite,
  soldDate: property.date_vente instanceof Date ?
    property.date_vente.toISOString().split('T')[0] :
    property.date_vente,
  soldPrice: property.prix_vente || 0,
  propertyType: property.genre_propriete || property.type_propriete || 'Résidentiel',
  constructionYear: property.annee_construction || 2000,
  source: property.source || 'Manual',
  matrixMls: property.numero_mls || ''
})

export default function LibraryPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [tableProperties, setTableProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewProperty, setViewProperty] = useState<Property | null>(null)
  const [viewPropertyIndex, setViewPropertyIndex] = useState(-1)
  const [editProperty, setEditProperty] = useState<Property | null>(null)
  const [isNewProperty, setIsNewProperty] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Load properties from database
  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the properties service to get all properties
      const result = await propertiesService.getProperties({
        limit: 1000, // Get all properties for now
        offset: 0
      })

      setProperties(result.items)
      setTableProperties(result.items.map(convertToTableFormat))
    } catch (err) {
      console.error('Error loading properties:', err)
      setError('Failed to load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = tableProperties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => p.id)
      setSelectedRows(allIds)
    } else {
      setSelectedRows([])
    }
  }

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await propertiesService.delete(selectedRows)
      await loadProperties() // Reload data
      showSnackbar(`Deleted ${selectedRows.length} properties successfully`)
      setSelectedRows([])
    } catch (err) {
      console.error('Error deleting properties:', err)
      showSnackbar('Failed to delete properties', 'error')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleView = (tableProperty: any) => {
    const property = properties.find(p => p.id === tableProperty.id)
    if (property) {
      const index = properties.findIndex(p => p.id === tableProperty.id)
      setViewPropertyIndex(index)
      setViewProperty(property)
    }
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? viewPropertyIndex - 1 : viewPropertyIndex + 1
    if (newIndex >= 0 && newIndex < properties.length) {
      setViewPropertyIndex(newIndex)
      setViewProperty(properties[newIndex])
    }
  }

  const handleEdit = (tableProperty?: any) => {
    if (tableProperty) {
      const property = properties.find(p => p.id === tableProperty.id)
      setEditProperty(property || null)
    } else {
      setEditProperty(null)
    }
    setIsNewProperty(!tableProperty)
  }

  const handleDuplicate = async (tableProperty: any) => {
    try {
      await propertiesService.duplicate(tableProperty.id)
      await loadProperties() // Reload data
      showSnackbar('Property duplicated successfully')
    } catch (err) {
      console.error('Error duplicating property:', err)
      showSnackbar('Failed to duplicate property', 'error')
    }
  }

  const handleSave = async (propertyData: PropertyCreateInput) => {
    try {
      if (editProperty) {
        // Update existing property
        await propertiesService.update(editProperty.id, propertyData)
        showSnackbar('Property updated successfully')
      } else if (isNewProperty) {
        // Create new property
        await propertiesService.create(propertyData)
        showSnackbar('Property created successfully')
      }

      await loadProperties() // Reload data
      setEditProperty(null)
      setIsNewProperty(false)
    } catch (err) {
      console.error('Error saving property:', err)
      showSnackbar('Failed to save property', 'error')
    }
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'Résidentiel': return <Home />
      case 'Commercial': return <Business />
      case 'Industriel': return <Factory />
      default: return <Terrain />
    }
  }

  const isSelected = (id: string) => selectedRows.includes(id)
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < rowsPerPage
  const isAllSelected = selectedRows.length === Math.min(rowsPerPage, tableProperties.length - page * rowsPerPage)

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Bibliothèque de Propriétés
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gérez votre portefeuille immobilier et créez de nouvelles fiches
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {selectedRows.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForever />}
                  onClick={handleDeleteSelected}
                  sx={{ borderRadius: 3 }}
                >
                  Supprimer ({selectedRows.length})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ borderRadius: 3 }}
              >
                Exporter
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ borderRadius: 3 }}
                onClick={() => handleEdit()}
              >
                Nouvelle Propriété
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher une propriété..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">Tous les types</MenuItem>
                    <MenuItem value="Résidentiel">Résidentiel</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                    <MenuItem value="Industriel">Industriel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Ville</InputLabel>
                  <Select
                    value={cityFilter}
                    label="Ville"
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <MenuItem value="">Toutes les villes</MenuItem>
                    <MenuItem value="Montréal">Montréal</MenuItem>
                    <MenuItem value="Laval">Laval</MenuItem>
                    <MenuItem value="Québec">Québec</MenuItem>
                    <MenuItem value="Gatineau">Gatineau</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    sx={{ borderRadius: 2 }}
                  >
                    Filtres Avancés
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    sx={{ borderRadius: 2 }}
                  >
                    Partager
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading properties...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Alert severity="error" action={
              <Button size="small" onClick={loadProperties}>
                Retry
              </Button>
            }>
              {error}
            </Alert>
          </Card>
        )}

        {/* Properties Table */}
        {!loading && !error && (
          <Card>
            <TableContainer>
              <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#1e3a8a', 0.05) }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={isIndeterminate}
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>ID No</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Adresse</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Ville</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Date Vente</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>Prix Vente</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 110 }}>Année Const.</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>Matrix/MLS No</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableProperties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((property) => (
                  <TableRow
                    key={property.id}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected(property.id) ? alpha('#1e3a8a', 0.08) : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected(property.id) ? alpha('#1e3a8a', 0.12) : alpha('#1e3a8a', 0.04)
                      }
                    }}
                    onClick={() => handleRowSelect(property.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(property.id)}
                        onChange={() => handleRowSelect(property.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {property.idNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {property.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">
                          {property.city}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(property.soldDate).toLocaleDateString('fr-CA')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {property.soldPrice.toLocaleString('fr-CA', {
                          style: 'currency',
                          currency: 'CAD',
                          minimumFractionDigits: 0
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.propertyType}
                        variant="outlined"
                        size="small"
                        icon={getPropertyTypeIcon(property.propertyType)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {property.constructionYear}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.source}
                        variant="filled"
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {property.matrixMls}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Voir détails">
                          <IconButton size="small" color="primary" onClick={() => handleView(property)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="info" onClick={() => handleEdit(property)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedRows([property.id])
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={tableProperties.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
            />
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Confirmer la suppression
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer {selectedRows.length} propriété(s) sélectionnée(s) ?
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Property View Dialog */}
        <PropertyView
          property={viewProperty}
          open={Boolean(viewProperty)}
          onClose={() => {
            setViewProperty(null)
            setViewPropertyIndex(-1)
          }}
          onEdit={() => {
            if (viewProperty) {
              setViewProperty(null)
              setViewPropertyIndex(-1)
              handleEdit({ id: viewProperty.id })
            }
          }}
          onNavigate={handleNavigate}
          canNavigatePrev={viewPropertyIndex > 0}
          canNavigateNext={viewPropertyIndex < properties.length - 1}
        />

        {/* Property Edit Dialog */}
        <PropertyEdit
          property={editProperty}
          open={Boolean(editProperty) || isNewProperty}
          onClose={() => {
            setEditProperty(null)
            setIsNewProperty(false)
          }}
          onSave={handleSave}
        />

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          }}
          onClick={() => handleEdit()}
        >
          <Add />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MaterialDashboardLayout>
  )
}