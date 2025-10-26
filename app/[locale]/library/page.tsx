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
  TableSortLabel,
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
  DeleteForever,
  Clear,
  ExpandMore
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../../components/layout/MaterialDashboardLayout'
import { PropertyView } from '../../../features/library/components/PropertyView'
import { PropertyEdit } from '../../../features/library/components/PropertyEdit'
import { Property, PropertyCreateInput } from '../../../features/library/types/property.types'
import { propertiesSupabaseService as propertiesService } from '../../../features/library/_api/properties-supabase.service'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'

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

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDateShort = (date: string | Date | undefined): string | null => {
  if (!date) return null

  if (typeof date === 'string') {
    // Extract just the date part if it's already in YYYY-MM-DD format or a timestamp
    const match = date.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]
  }

  return null
}

// Convert Property format to table format for display
const convertToTableFormat = (property: Property, index: number): any => {
  // Use stored property_id_no if available, otherwise generate a temporary one
  let idNo = property.property_id_no

  if (!idNo) {
    // Fallback for properties created before this feature
    // Get year from created_at or current year
    const year = property.created_at ?
      new Date(property.created_at).getFullYear().toString().slice(-2) :
      new Date().getFullYear().toString().slice(-2)

    // Sequential number based on index (1-based)
    const seqNumber = (index + 1).toString().padStart(4, '0')
    idNo = `${year}-${seqNumber}`
  }

  return {
    id: property.id,
    idNo,
    address: property.adresse,
    city: property.ville || property.municipalite,
    soldDate: formatDateShort(property.date_vente),
    soldPrice: property.prix_vente || null,
    propertyType: property.type_propriete || property.genre_propriete || 'Autre',
    status: property.status || '-',
    constructionYear: property.annee_construction || null,
    source: property.source || 'Manual',
    matrixMls: property.numero_mls || ''
  }
}

// Property types for filter
const PROPERTY_TYPES = ['Condo', 'Unifamiliale', 'Plex', 'Appartement', 'Semi-commercial', 'Terrain', 'Commercial', 'Autre'] as const

export default function LibraryPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [tableProperties, setTableProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [orderBy, setOrderBy] = useState<string>('idNo')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateProperty, setDuplicateProperty] = useState<Property | null>(null)
  const [pendingPropertyData, setPendingPropertyData] = useState<PropertyCreateInput | null>(null)

  // Load properties from database
  useEffect(() => {
    loadProperties()
  }, [])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // "E" key - edit selected property or first selected
      if (e.key.toLowerCase() === 'e' && selectedRows.length > 0) {
        const firstSelectedId = selectedRows[0]
        const tableProperty = tableProperties.find(p => p.id === firstSelectedId)
        if (tableProperty) {
          handleEdit(tableProperty)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedRows, tableProperties])

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
      setTableProperties(result.items.map((property, index) => convertToTableFormat(property, index)))
    } catch (err) {
      console.error('Error loading properties:', err)
      setError('Failed to load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get unique cities from the actual property data
  const availableCities = Array.from(
    new Set(
      properties
        .map(p => p.ville || p.municipalite)
        .filter(Boolean)
        .filter((city): city is string => typeof city === 'string')
    )
  ).sort()

  // Filter properties based on search term and filters
  const filteredProperties = tableProperties.filter(property => {
    // Search term filter - search across multiple fields
    const searchLower = searchTerm.toLowerCase().trim()
    const matchesSearch = !searchTerm ||
      property.address?.toLowerCase().includes(searchLower) ||
      property.city?.toLowerCase().includes(searchLower) ||
      property.idNo?.toLowerCase().includes(searchLower) ||
      property.matrixMls?.toLowerCase().includes(searchLower) ||
      property.source?.toLowerCase().includes(searchLower)

    // Type filter
    const matchesType = !typeFilter || property.propertyType === typeFilter

    // City filter
    const matchesCity = !cityFilter || property.city === cityFilter

    // Date range filter
    const propertyDate = property.soldDate ? new Date(property.soldDate) : null
    const matchesDateFrom = !dateFrom || !propertyDate || propertyDate >= new Date(dateFrom)
    const matchesDateTo = !dateTo || !propertyDate || propertyDate <= new Date(dateTo)

    // Price range filter
    const matchesPriceFrom = !priceFrom || property.soldPrice >= parseFloat(priceFrom)
    const matchesPriceTo = !priceTo || property.soldPrice <= parseFloat(priceTo)

    // Construction year range filter
    const matchesYearFrom = !yearFrom || property.constructionYear >= parseInt(yearFrom)
    const matchesYearTo = !yearTo || property.constructionYear <= parseInt(yearTo)

    return matchesSearch && matchesType && matchesCity &&
           matchesDateFrom && matchesDateTo &&
           matchesPriceFrom && matchesPriceTo &&
           matchesYearFrom && matchesYearTo
  })

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [searchTerm, typeFilter, cityFilter, dateFrom, dateTo, priceFrom, priceTo, yearFrom, yearTo])

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setCityFilter('')
    setDateFrom('')
    setDateTo('')
    setPriceFrom('')
    setPriceTo('')
    setYearFrom('')
    setYearTo('')
  }

  const hasActiveFilters = searchTerm || typeFilter || cityFilter || dateFrom || dateTo || priceFrom || priceTo || yearFrom || yearTo

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
      const allIds = sortedProperties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => p.id)
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

  const handleFixDuplicateIds = async () => {
    try {
      setLoading(true)
      await propertiesService.fixDuplicateIds()
      await loadProperties() // Reload data
      showSnackbar('Duplicate IDs fixed successfully')
    } catch (err) {
      console.error('Error fixing duplicate IDs:', err)
      showSnackbar('Failed to fix duplicate IDs', 'error')
    } finally {
      setLoading(false)
    }
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
        console.log('Updating property:', editProperty.id, propertyData)
        await propertiesService.update(editProperty.id, propertyData)
        showSnackbar('Property updated successfully')
      } else if (isNewProperty) {
        // Check for duplicate address when creating new property
        const existingProperty = properties.find(
          p => p.adresse?.toLowerCase() === propertyData.adresse?.toLowerCase() &&
               p.ville?.toLowerCase() === propertyData.ville?.toLowerCase()
        )

        if (existingProperty) {
          // Show duplicate dialog
          setDuplicateProperty(existingProperty)
          setPendingPropertyData(propertyData)
          setDuplicateDialogOpen(true)
          return // Don't create yet, wait for user decision
        }

        // Create new property if no duplicate found
        await propertiesService.create(propertyData)
        showSnackbar('Property created successfully')
      }

      await loadProperties() // Reload data
      setEditProperty(null)
      setIsNewProperty(false)
    } catch (err: any) {
      console.error('Error saving property:', err)
      console.error('Error details:', err?.message, err?.details, err?.hint)
      showSnackbar(`Failed to save property: ${err?.message || 'Unknown error'}`, 'error')
    }
  }

  const handleMergeProperty = async () => {
    if (!duplicateProperty || !pendingPropertyData) return

    try {
      // Merge logic: keep existing values, overwrite with new non-empty values
      const mergedData: any = {}

      // For each field in pendingPropertyData
      Object.keys(pendingPropertyData).forEach(key => {
        const newValue = (pendingPropertyData as any)[key]
        const existingValue = (duplicateProperty as any)[key]

        // Use new value if it's not empty/null/undefined, otherwise keep existing
        if (newValue !== null && newValue !== undefined && newValue !== '') {
          mergedData[key] = newValue
        } else if (existingValue !== null && existingValue !== undefined && existingValue !== '') {
          mergedData[key] = existingValue
        }
      })

      // Update the existing property with merged data
      await propertiesService.update(duplicateProperty.id, mergedData)
      showSnackbar('Property merged successfully')

      await loadProperties()
      setDuplicateDialogOpen(false)
      setDuplicateProperty(null)
      setPendingPropertyData(null)
      setEditProperty(null)
      setIsNewProperty(false)
    } catch (err) {
      console.error('Error merging property:', err)
      showSnackbar('Failed to merge property', 'error')
    }
  }

  const handleCreateDuplicate = async () => {
    if (!pendingPropertyData) return

    try {
      await propertiesService.create(pendingPropertyData)
      showSnackbar('Property created successfully')

      await loadProperties()
      setDuplicateDialogOpen(false)
      setDuplicateProperty(null)
      setPendingPropertyData(null)
      setEditProperty(null)
      setIsNewProperty(false)
    } catch (err) {
      console.error('Error creating property:', err)
      showSnackbar('Failed to create property', 'error')
    }
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'Unifamiliale': return <Home />
      case 'Condo': return <Home />
      case 'Plex': return <Home />
      case 'Appartement': return <Home />
      case 'Commercial': return <Business />
      case 'Semi-commercial': return <Business />
      case 'Terrain': return <Terrain />
      default: return <Home />
    }
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const sortComparator = (a: any, b: any, orderBy: string, order: 'asc' | 'desc') => {
    let aValue = a[orderBy]
    let bValue = b[orderBy]

    // Handle null/undefined values
    if (aValue == null) aValue = ''
    if (bValue == null) bValue = ''

    // Convert dates to timestamps for comparison
    if (orderBy === 'soldDate') {
      aValue = aValue ? new Date(aValue).getTime() : 0
      bValue = bValue ? new Date(bValue).getTime() : 0
    }

    // Numeric comparison for numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue
    }

    // String comparison
    const comparison = aValue.toString().localeCompare(bValue.toString(), 'fr-CA', { numeric: true })
    return order === 'asc' ? comparison : -comparison
  }

  // Apply sorting to filtered properties
  const sortedProperties = [...filteredProperties].sort((a, b) => sortComparator(a, b, orderBy, order))

  const isSelected = (id: string) => selectedRows.includes(id)
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < rowsPerPage
  const isAllSelected = selectedRows.length === Math.min(rowsPerPage, sortedProperties.length - page * rowsPerPage)

  return (
    <ProtectedRoute>
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
                Gérez vos propriétés immobilières
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {selectedRows.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForever />}
                  onClick={handleDeleteSelected}
                  sx={{ borderRadius: 3, whiteSpace: 'nowrap' }}
                >
                  Supprimer ({selectedRows.length})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ borderRadius: 3, whiteSpace: 'nowrap' }}
              >
                Exporter
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ borderRadius: 3, whiteSpace: 'nowrap' }}
                onClick={() => handleEdit()}
              >
                Nouvelle Propriété
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher par adresse, ville, MLS, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm('')}
                          edge="end"
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">Tous les types</MenuItem>
                    {PROPERTY_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ville</InputLabel>
                  <Select
                    value={cityFilter}
                    label="Ville"
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <MenuItem value="">Toutes les villes</MenuItem>
                    {availableCities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Advanced Filters Toggle */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterList fontSize="small" />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  sx={{ borderRadius: 2 }}
                >
                  Filtres Avancés {showAdvancedFilters ? '▲' : '▼'}
                </Button>
              </Grid>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Date de vente
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="De"
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="À"
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Prix de vente
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Minimum"
                          type="number"
                          value={priceFrom}
                          onChange={(e) => setPriceFrom(e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Maximum"
                          type="number"
                          value={priceTo}
                          onChange={(e) => setPriceTo(e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Année de construction
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="De"
                          type="number"
                          value={yearFrom}
                          onChange={(e) => setYearFrom(e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="À"
                          type="number"
                          value={yearTo}
                          onChange={(e) => setYearTo(e.target.value)}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}

              {hasActiveFilters && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {filteredProperties.length} résultat{filteredProperties.length !== 1 ? 's' : ''} trouvé{filteredProperties.length !== 1 ? 's' : ''}
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleClearFilters}
                      startIcon={<Clear />}
                    >
                      Effacer les filtres
                    </Button>
                  </Box>
                </Grid>
              )}
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
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#1e3a8a', 0.05) }}>
                  <TableCell padding="checkbox" sx={{ py: 1, bgcolor: 'background.paper' }}>
                    <Checkbox
                      size="small"
                      indeterminate={isIndeterminate}
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'idNo'}
                      direction={orderBy === 'idNo' ? order : 'asc'}
                      onClick={() => handleRequestSort('idNo')}
                    >
                      ID No.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 'auto', py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'address'}
                      direction={orderBy === 'address' ? order : 'asc'}
                      onClick={() => handleRequestSort('address')}
                    >
                      Adresse
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'city'}
                      direction={orderBy === 'city' ? order : 'asc'}
                      onClick={() => handleRequestSort('city')}
                    >
                      Ville
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'soldPrice'}
                      direction={orderBy === 'soldPrice' ? order : 'asc'}
                      onClick={() => handleRequestSort('soldPrice')}
                    >
                      <Box component="span" sx={{ whiteSpace: 'normal', lineHeight: 1.2 }}>
                        Prix vente/<br />Valeur eff.
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 140, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'soldDate'}
                      direction={orderBy === 'soldDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('soldDate')}
                    >
                      Date Vente / Effective
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'propertyType'}
                      direction={orderBy === 'propertyType' ? order : 'asc'}
                      onClick={() => handleRequestSort('propertyType')}
                    >
                      Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Statut
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 110, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'constructionYear'}
                      direction={orderBy === 'constructionYear' ? order : 'asc'}
                      onClick={() => handleRequestSort('constructionYear')}
                    >
                      Année constr.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'source'}
                      direction={orderBy === 'source' ? order : 'asc'}
                      onClick={() => handleRequestSort('source')}
                    >
                      Source
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130, py: 1, bgcolor: 'background.paper' }}>
                    <TableSortLabel
                      active={orderBy === 'matrixMls'}
                      direction={orderBy === 'matrixMls' ? order : 'asc'}
                      onClick={() => handleRequestSort('matrixMls')}
                    >
                      Matrix/MLS No.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120, py: 1, bgcolor: 'background.paper' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProperties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((property) => (
                  <TableRow
                    key={property.id}
                    tabIndex={0}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected(property.id) ? alpha('#1e3a8a', 0.08) : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected(property.id) ? alpha('#1e3a8a', 0.12) : alpha('#1e3a8a', 0.04)
                      },
                      '& td': {
                        whiteSpace: 'nowrap',
                        py: 0.75
                      }
                    }}
                    onClick={() => handleRowSelect(property.id)}
                    onDoubleClick={() => handleView(property)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleView(property)
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isSelected(property.id)}
                        onChange={() => handleRowSelect(property.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.875rem" fontWeight={600} color="primary.main">
                        {property.idNo}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="body2" fontSize="0.875rem" fontWeight={600} noWrap>
                        {property.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="body2" fontSize="0.875rem">
                          {property.city}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.875rem" fontWeight={600} color={property.soldPrice ? "success.main" : "text.secondary"}>
                        {property.soldPrice ? property.soldPrice.toLocaleString('fr-CA', {
                          style: 'currency',
                          currency: 'CAD',
                          minimumFractionDigits: 0
                        }) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday fontSize="small" sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="body2" fontSize="0.875rem" sx={{ whiteSpace: 'nowrap' }}>
                          {property.soldDate || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.propertyType}
                        variant="outlined"
                        size="small"
                        icon={getPropertyTypeIcon(property.propertyType)}
                        sx={{
                          height: 24,
                          '& .MuiChip-label': { fontSize: '0.75rem', px: 1 },
                          ...(property.propertyType === 'Condo' && {
                            bgcolor: '#e3f2fd',
                            borderColor: '#90caf9',
                            color: '#1976d2'
                          }),
                          ...(property.propertyType === 'Unifamiliale' && {
                            bgcolor: '#e8f5e9',
                            borderColor: '#81c784',
                            color: '#388e3c'
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.status}
                        variant="filled"
                        size="small"
                        sx={{
                          height: 24,
                          '& .MuiChip-label': { fontSize: '0.75rem', px: 1 },
                          ...(property.status === 'Sujet' && {
                            bgcolor: '#1976d2',
                            color: '#ffffff'
                          }),
                          ...(property.status === 'Vendu' && {
                            bgcolor: '#2e7d32',
                            color: '#ffffff'
                          }),
                          ...(property.status === 'Actif' && {
                            bgcolor: '#f57f17',
                            color: '#ffffff'
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.875rem">
                        {property.constructionYear || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.source}
                        variant="filled"
                        size="small"
                        color="info"
                        sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.75rem', px: 1 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.875rem" fontFamily="monospace">
                        {property.matrixMls}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Voir détails">
                          <IconButton size="small" color="primary" onClick={() => handleView(property)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="info" onClick={() => handleEdit(property)}>
                            <Edit fontSize="small" />
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
                            <Delete fontSize="small" />
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
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={sortedProperties.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
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

        {/* Duplicate Address Detection Dialog */}
        <Dialog
          open={duplicateDialogOpen}
          onClose={() => {
            setDuplicateDialogOpen(false)
            setDuplicateProperty(null)
            setPendingPropertyData(null)
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Adresse existante détectée</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Une propriété avec la même adresse existe déjà dans votre bibliothèque:
            </DialogContentText>
            {duplicateProperty && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Propriété existante:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {duplicateProperty.adresse}, {duplicateProperty.ville}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {duplicateProperty.type_propriete}
                  {duplicateProperty.prix_vente && ` • Prix: ${duplicateProperty.prix_vente.toLocaleString()}$`}
                </Typography>
              </Box>
            )}
            <DialogContentText>
              Voulez-vous <strong>fusionner</strong> les informations avec la propriété existante ou créer un <strong>doublon</strong>?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
              <strong>Fusionner:</strong> Les nouvelles valeurs remplaceront les champs vides de la propriété existante.
              <br />
              <strong>Créer un doublon:</strong> Une nouvelle propriété distincte sera créée.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDuplicateDialogOpen(false)
                setDuplicateProperty(null)
                setPendingPropertyData(null)
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateDuplicate}
              variant="outlined"
            >
              Créer un doublon
            </Button>
            <Button
              onClick={handleMergeProperty}
              variant="contained"
              color="primary"
            >
              Fusionner
            </Button>
          </DialogActions>
        </Dialog>

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
    </ProtectedRoute>
  )
}