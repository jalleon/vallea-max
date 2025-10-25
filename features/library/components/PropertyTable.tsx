'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  ContentCopy
} from '@mui/icons-material'
import { Property, PropertyTableRow } from '../types/property.types'
import { formatCurrency, formatDate, formatMeasurement } from '@/lib/utils/formatting'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface PropertyTableProps {
  properties: Property[]
  loading?: boolean
  selectedProperties: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onView?: (property: Property) => void
  onEdit?: (property: Property) => void
  onDelete?: (propertyIds: string[]) => void
  onDuplicate?: (property: Property) => void
}

export function PropertyTable({
  properties,
  loading = false,
  selectedProperties,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onDuplicate
}: PropertyTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const tableRows: PropertyTableRow[] = useMemo(() =>
    properties.map(property => ({
      ...property,
      selected: selectedProperties.includes(property.id)
    })), [properties, selectedProperties]
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(properties.map(p => p.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectProperty = (propertyId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProperties, propertyId])
    } else {
      onSelectionChange(selectedProperties.filter(id => id !== propertyId))
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, property: Property) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedProperty(property)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProperty(null)
  }

  const handleMenuAction = (action: string) => {
    if (!selectedProperty) return

    switch (action) {
      case 'view':
        onView?.(selectedProperty)
        break
      case 'edit':
        onEdit?.(selectedProperty)
        break
      case 'delete':
        onDelete?.([selectedProperty.id])
        break
      case 'duplicate':
        onDuplicate?.(selectedProperty)
        break
    }
    handleMenuClose()
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Vendu':
        return 'success'
      case 'À vendre':
        return 'primary'
      case 'Retiré':
        return 'default'
      case 'Expiré':
        return 'error'
      default:
        return 'default'
    }
  }

  const allSelected = properties.length > 0 && selectedProperties.length === properties.length
  const indeterminate = selectedProperties.length > 0 && selectedProperties.length < properties.length

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <LoadingSpinner message="Chargement des propriétés..." />
      </Box>
    )
  }

  if (properties.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucune propriété trouvée
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ajoutez votre première propriété pour commencer.
        </Typography>
      </Box>
    )
  }

  const handleKeyDown = (event: React.KeyboardEvent, property: Property) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onView?.(property)
    }
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: 'background.paper' }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>ID No.</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Adresse</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Ville</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Prix de vente / Valeur effective</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper', minWidth: 120 }}>Date Vente / Effective</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Type</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Statut</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Année constr.</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Source</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Matrix/MLS No.</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'background.paper' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((property) => (
              <TableRow
                key={property.id}
                hover
                selected={property.selected}
                onClick={() => onView?.(property)}
                onKeyDown={(e) => handleKeyDown(e, property)}
                tabIndex={0}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={property.selected}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectProperty(property.id, e.target.checked)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                    {property.property_id_no || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {property.adresse}
                  </Typography>
                  {property.municipalite && (
                    <Typography variant="caption" color="text.secondary">
                      {property.municipalite}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {property.ville}
                  </Typography>
                  {property.code_postal && (
                    <Typography variant="caption" color="text.secondary">
                      {property.code_postal}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {(property.prix_vente || property.valeur_evaluation) && (
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(property.prix_vente || property.valeur_evaluation || 0)}
                    </Typography>
                  )}
                  {property.prix_demande && property.prix_demande !== property.prix_vente && (
                    <Typography variant="caption" color="text.secondary">
                      Liste: {formatCurrency(property.prix_demande)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  {(property.date_vente || property.date_effective) && (
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(property.date_vente || property.date_effective)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {property.type_propriete}
                  </Typography>
                  {property.genre_propriete && (
                    <Typography variant="caption" color="text.secondary">
                      {property.genre_propriete}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {property.status && (
                    <Chip
                      label={property.status}
                      size="small"
                      color={getStatusColor(property.status) as any}
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {property.annee_construction}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {property.source || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {property.numero_mls && (
                    <Typography variant="body2" fontFamily="monospace">
                      {property.numero_mls}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, property)}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('duplicate')}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dupliquer</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}