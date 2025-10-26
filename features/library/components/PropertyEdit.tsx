'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
  useTheme,
  Alert
} from '@mui/material'
import {
  Add,
  Delete,
  LocationOn,
  Layers,
  Home,
  Stairs,
  SquareFoot,
  AttachMoney,
  Search as InspectionIcon,
  AccountBalance
} from '@mui/icons-material'
import { Property, PropertyCreateInput, PropertyType, PropertyStatus, BasementType, ParkingType, FloorType, FloorArea, OccupancyType, EvaluationType, UnitRent, AdditionalLot } from '../types/property.types'
import { v4 as uuidv4 } from 'uuid'
import { useRouter, useParams } from 'next/navigation'
import { calculateInspectionProgress, getCompletedCategories, getCategoryTranslationKey } from '@/features/inspection/utils/progress.utils'
import { useTranslations } from 'next-intl'
import { CheckCircle } from '@mui/icons-material'
import { formatNumber } from '@/lib/utils/formatting'

interface PropertyEditProps {
  property: Property | null
  open: boolean
  onClose: () => void
  onSave: (property: PropertyCreateInput) => Promise<void>
}

export function PropertyEdit({ property, open, onClose, onSave }: PropertyEditProps) {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations()

  // Helper functions for currency formatting
  const formatCurrencyDisplay = (value: number | undefined): string => {
    if (!value) return ''
    return formatNumber(value, 0)
  }

  const parseCurrencyInput = (value: string): number | undefined => {
    if (!value) return undefined
    // Remove all spaces and non-numeric characters except decimal point
    const cleaned = value.replace(/\s/g, '').replace(/[^0-9.]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? undefined : parsed
  }

  // Helper function to format Quebec lot number: # ### ###
  const formatLotNumber = (value: string): string => {
    if (formData.province !== 'QC') return value
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '')
    // Limit to 7 digits
    const limited = cleaned.substring(0, 7)
    // Format as # ### ###
    if (limited.length <= 1) return limited
    if (limited.length <= 4) return `${limited[0]} ${limited.substring(1)}`
    return `${limited[0]} ${limited.substring(1, 4)} ${limited.substring(4)}`
  }

  const parseLotNumber = (value: string): string => {
    // Remove all spaces and non-numeric characters
    return value.replace(/\s/g, '')
  }

  const [formData, setFormData] = useState<PropertyCreateInput>({
    adresse: '',
    ville: '',
    municipalite: '',
    code_postal: '',
    province: 'QC',
    prix_vente: undefined,
    prix_demande: undefined,
    date_vente: '',
    jours_sur_marche: undefined,
    status: 'Vendu',
    type_propriete: undefined,
    genre_propriete: '',
    type_batiment: undefined,
    annee_construction: undefined,
    chrono_age: undefined,
    eff_age: undefined,
    zonage: '',
    superficie_terrain_m2: undefined,
    superficie_terrain_pi2: undefined,
    frontage_m2: undefined,
    profondeur_m2: undefined,
    frontage_pi2: undefined,
    profondeur_pi2: undefined,
    superficie_habitable_m2: undefined,
    superficie_habitable_pi2: undefined,
    perimetre_batiment_m2: undefined,
    perimetre_batiment_pi2: undefined,
    nombre_pieces: undefined,
    nombre_chambres: undefined,
    salle_bain: undefined,
    salle_eau: undefined,
    stationnement: undefined,
    type_garage: undefined,
    dimension_garage: '',
    type_sous_sol: undefined,
    toiture: '',
    extras: '',
    ameliorations_hors_sol: '',
    localisation: undefined,
    type_copropriete: 'Divise',
    numero_mls: '',
    floor_areas: [],

    // Municipal data
    lot_number: '',
    additional_lots: [],
    matricule: '',
    eval_municipale_annee: undefined,
    eval_municipale_terrain: undefined,
    eval_municipale_batiment: undefined,
    eval_municipale_total: undefined,
    taxes_municipales_annee: undefined,
    taxes_municipales_montant: undefined,
    taxes_scolaires_annee: undefined,
    taxes_scolaires_montant: undefined,
    zoning_usages_permis: '',

    source: '',
    notes: '',
    is_template: false,
    is_shared: false
  })

  const [floorAreas, setFloorAreas] = useState<FloorArea[]>([])
  const [additionalLots, setAdditionalLots] = useState<AdditionalLot[]>([])
  const [newFloor, setNewFloor] = useState({
    floor: 'Rez-de-chaussée' as FloorType,
    area_m2: 0,
    area_ft2: 0
  })
  const [inspectionConfirmOpen, setInspectionConfirmOpen] = useState(false)
  const [unitRents, setUnitRents] = useState<UnitRent[]>([])
  const [validationError, setValidationError] = useState<string>('')

  // Helper to get number of units based on property type
  const getUnitCount = (type?: PropertyType): number => {
    if (type === 'Duplex') return 2
    if (type === 'Triplex') return 3
    if (type === 'Quadriplex+') return 4
    return 0
  }

  useEffect(() => {
    if (property) {
      // Convert date_vente to string format safely
      let dateString = ''
      if (property.date_vente) {
        try {
          const date = property.date_vente instanceof Date ? property.date_vente : new Date(property.date_vente)
          if (!isNaN(date.getTime())) {
            dateString = date.toISOString().split('T')[0]
          }
        } catch (e) {
          console.error('Invalid date:', property.date_vente)
        }
      }

      // Calculate room counts from inspection if available
      const hasInspectionData = property.inspection_pieces?.floors && Object.keys(property.inspection_pieces.floors).length > 0
      let calculatedRoomCounts = { bedrooms: 0, bathrooms: 0, powderRooms: 0, totalRooms: 0 }

      if (hasInspectionData) {
        calculatedRoomCounts = calculateRoomCounts()
      }

      setFormData({
        adresse: property.adresse,
        ville: property.ville || '',
        municipalite: property.municipalite || '',
        code_postal: property.code_postal || '',
        province: property.province || 'QC',
        prix_vente: property.prix_vente,
        prix_demande: property.prix_demande,
        date_vente: dateString,
        jours_sur_marche: property.jours_sur_marche,
        status: property.status || 'Vendu',
        type_propriete: property.type_propriete,

        // Conditional fields (Note: valeur_evaluation and date_effective use prix_vente and date_vente in DB)
        type_evaluation: property.type_evaluation,
        occupancy: property.occupancy,
        loyer_en_place: property.loyer_en_place,
        frais_condo: property.frais_condo,
        localisation: property.localisation,
        type_copropriete: property.type_copropriete || 'Divise',
        unit_rents: property.unit_rents,

        genre_propriete: property.genre_propriete || '',
        type_batiment: property.type_batiment,
        annee_construction: property.annee_construction,
        chrono_age: property.chrono_age,
        eff_age: property.eff_age,
        zonage: property.zonage || '',
        superficie_terrain_m2: property.superficie_terrain_m2,
        superficie_terrain_pi2: property.superficie_terrain_pi2,
        frontage_m2: property.frontage_m2,
        profondeur_m2: property.profondeur_m2,
        frontage_pi2: property.frontage_pi2,
        profondeur_pi2: property.profondeur_pi2,
        superficie_habitable_m2: property.superficie_habitable_m2,
        superficie_habitable_pi2: property.superficie_habitable_pi2,
        perimetre_batiment_m2: property.perimetre_batiment_m2,
        perimetre_batiment_pi2: property.perimetre_batiment_pi2,
        nombre_pieces: property.nombre_pieces ?? (hasInspectionData ? calculatedRoomCounts.totalRooms : undefined),
        nombre_chambres: property.nombre_chambres ?? (hasInspectionData ? calculatedRoomCounts.bedrooms : undefined),
        salle_bain: property.salle_bain ?? (hasInspectionData ? calculatedRoomCounts.bathrooms : undefined),
        salle_eau: property.salle_eau ?? (hasInspectionData ? calculatedRoomCounts.powderRooms : undefined),
        stationnement: property.stationnement,
        type_garage: property.type_garage,
        dimension_garage: property.dimension_garage || '',
        type_sous_sol: property.type_sous_sol,
        toiture: property.toiture || '',
        extras: property.extras || '',
        ameliorations_hors_sol: property.ameliorations_hors_sol || '',
        numero_mls: property.numero_mls || '',
        floor_areas: property.floor_areas || [],

        // Municipal data
        lot_number: property.lot_number || '',
        additional_lots: property.additional_lots || [],
        matricule: property.matricule || '',
        eval_municipale_annee: property.eval_municipale_annee,
        eval_municipale_terrain: property.eval_municipale_terrain,
        eval_municipale_batiment: property.eval_municipale_batiment,
        eval_municipale_total: property.eval_municipale_total,
        taxes_municipales_annee: property.taxes_municipales_annee,
        taxes_municipales_montant: property.taxes_municipales_montant,
        taxes_scolaires_annee: property.taxes_scolaires_annee,
        taxes_scolaires_montant: property.taxes_scolaires_montant,
        zoning_usages_permis: property.zoning_usages_permis || '',

        notes: property.notes || '',
        is_template: property.is_template,
        is_shared: property.is_shared
      })
      setFloorAreas(property.floor_areas || [])
      setUnitRents(property.unit_rents || [])
      setAdditionalLots(property.additional_lots || [])
    } else {
      // Reset for new property
      setFormData({
        adresse: '',
        ville: '',
        municipalite: '',
        code_postal: '',
        province: 'QC',
        prix_vente: undefined,
        prix_demande: undefined,
        date_vente: '',
        jours_sur_marche: undefined,
        status: 'Vendu',
        type_propriete: undefined,
        genre_propriete: '',
        annee_construction: undefined,
        zonage: '',
        superficie_terrain_m2: undefined,
        superficie_terrain_pi2: undefined,
        frontage_m2: undefined,
        profondeur_m2: undefined,
        frontage_pi2: undefined,
        profondeur_pi2: undefined,
        superficie_habitable_m2: undefined,
        superficie_habitable_pi2: undefined,
        nombre_pieces: undefined,
        nombre_chambres: undefined,
        salle_bain: undefined,
        salle_eau: undefined,
        stationnement: undefined,
        dimension_garage: '',
        type_sous_sol: undefined,
        toiture: '',
        ameliorations_hors_sol: '',
        numero_mls: '',
        floor_areas: [],
        notes: '',
        is_template: false,
        is_shared: false
      })
      setFloorAreas([])
    }
  }, [property])

  // Calculate room counts from inspection data (same logic as PropertyView)
  const calculateRoomCounts = () => {
    if (!property?.inspection_pieces?.floors) {
      return { bedrooms: 0, bathrooms: 0, powderRooms: 0, totalRooms: 0 }
    }

    let bedrooms = 0
    let bathrooms = 0
    let powderRooms = 0
    let totalRooms = 0

    const excludedRoomTypes = ['salle_bain', 'salle_eau', 'vestibule', 'solarium']

    const isRoomCompleted = (roomData: any): boolean => {
      if (!roomData) return false
      const filledFields = Object.entries(roomData).filter(([key, value]) => {
        if (key === 'type' || key === 'customValues' || key === 'completedAt') return false
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== null && value !== undefined && value !== ''
      })
      return filledFields.length > 0
    }

    Object.entries(property.inspection_pieces.floors).forEach(([floorId, floor]) => {
      const isBasement = floorId === 'sous_sol' || floor.name?.toLowerCase().includes('sous-sol')

      Object.entries(floor.rooms || {}).forEach(([_, roomData]: [string, any]) => {
        if (!isRoomCompleted(roomData)) return

        const roomType = roomData.type

        if (roomType === 'chambre' && !isBasement) {
          bedrooms++
        }
        if (roomType === 'salle_bain') {
          bathrooms++
        }
        if (roomType === 'salle_eau') {
          powderRooms++
        }
        if (!isBasement && !excludedRoomTypes.includes(roomType)) {
          totalRooms++
        }
      })
    })

    return { bedrooms, bathrooms, powderRooms, totalRooms }
  }

  const roomCounts = property ? calculateRoomCounts() : { bedrooms: 0, bathrooms: 0, powderRooms: 0, totalRooms: 0 }
  const hasInspectionData = property?.inspection_pieces?.floors && Object.keys(property.inspection_pieces.floors).length > 0
  const inspectionProgress = property ? calculateInspectionProgress(property) : 0
  const completedCategories = property ? getCompletedCategories(property) : []
  const isInspectionComplete = inspectionProgress === 100

  const handleInputChange = (field: keyof PropertyCreateInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const convertArea = (value: number, fromUnit: 'm2' | 'ft2', toUnit: 'm2' | 'ft2') => {
    if (fromUnit === toUnit) return value
    if (fromUnit === 'm2' && toUnit === 'ft2') return value * 10.764
    if (fromUnit === 'ft2' && toUnit === 'm2') return value / 10.764
    return value
  }

  const handleNewFloorAreaChange = (field: 'area_m2' | 'area_ft2', value: number) => {
    setNewFloor(prev => ({
      ...prev,
      [field]: value,
      [field === 'area_m2' ? 'area_ft2' : 'area_m2']: convertArea(
        value,
        field === 'area_m2' ? 'm2' : 'ft2',
        field === 'area_m2' ? 'ft2' : 'm2'
      )
    }))
  }

  const addFloorArea = () => {
    if (newFloor.area_m2 > 0) {
      const floorArea: FloorArea = {
        id: uuidv4(),
        floor: newFloor.floor,
        area_m2: parseFloat(newFloor.area_m2.toFixed(2)),
        area_ft2: parseFloat(newFloor.area_ft2.toFixed(2)),
        type: newFloor.floor === 'Sous-sol' ? 'sous-sol' : 'hors-sol'
      }
      const updatedFloors = [...floorAreas, floorArea]
      setFloorAreas(updatedFloors)
      setFormData(prev => ({ ...prev, floor_areas: updatedFloors }))
      setNewFloor({
        floor: 'Rez-de-chaussée',
        area_m2: 0,
        area_ft2: 0
      })
    }
  }

  const removeFloorArea = (id: string) => {
    const updatedFloors = floorAreas.filter(floor => floor.id !== id)
    setFloorAreas(updatedFloors)
    setFormData(prev => ({ ...prev, floor_areas: updatedFloors }))
  }

  const addAdditionalLot = () => {
    const newLot: AdditionalLot = {
      id: uuidv4(),
      lot_number: '',
      type_lot: 'Exclusif'
    }
    const updatedLots = [...additionalLots, newLot]
    setAdditionalLots(updatedLots)
    setFormData(prev => ({ ...prev, additional_lots: updatedLots }))
  }

  const removeAdditionalLot = (id: string) => {
    const updatedLots = additionalLots.filter(lot => lot.id !== id)
    setAdditionalLots(updatedLots)
    setFormData(prev => ({ ...prev, additional_lots: updatedLots }))
  }

  const updateAdditionalLot = (id: string, field: keyof AdditionalLot, value: any) => {
    const updatedLots = additionalLots.map(lot =>
      lot.id === id ? { ...lot, [field]: value } : lot
    )
    setAdditionalLots(updatedLots)
    setFormData(prev => ({ ...prev, additional_lots: updatedLots }))
  }

  const calculateTotalHabitable = () => {
    const totalM2 = floorAreas
      .filter(floor => floor.type === 'hors-sol')
      .reduce((total, floor) => total + floor.area_m2, 0)

    const totalFt2 = floorAreas
      .filter(floor => floor.type === 'hors-sol')
      .reduce((total, floor) => total + floor.area_ft2, 0)

    return { m2: totalM2, ft2: totalFt2 }
  }

  useEffect(() => {
    // Update superficie_habitable when floors change
    const totals = calculateTotalHabitable()
    setFormData(prev => ({
      ...prev,
      superficie_habitable_m2: totals.m2,
      superficie_habitable_pi2: totals.ft2
    }))
  }, [floorAreas])

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.adresse || formData.adresse.trim() === '') {
        setValidationError('L\'adresse est obligatoire')
        return
      }

      if (!formData.ville || formData.ville.trim() === '') {
        setValidationError('La ville est obligatoire')
        return
      }

      // Clear any previous validation errors
      setValidationError('')

      // Sanitize data: convert empty strings to null for all fields
      const sanitizedData: any = { ...formData }

      // Note: valeur_evaluation and date_effective are UI-only fields that map to prix_vente and date_vente
      // They are already removed from formData initialization, so no need to delete them here
      delete sanitizedData.valeur_evaluation
      delete sanitizedData.date_effective

      // Convert empty strings to null for all fields to avoid database type errors
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === '') {
          sanitizedData[key] = null
        }
      })

      await onSave(sanitizedData)
      onClose()
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const propertyTypes: PropertyType[] = ['Condo', 'Unifamiliale', 'Duplex', 'Triplex', 'Quadriplex+', 'Appartement', 'Semi-commercial', 'Commercial', 'Terrain', 'Autre']
  const propertyStatuses: PropertyStatus[] = ['Vendu', 'Sujet', 'Actif']
  const basementTypes: BasementType[] = ['Aucun', 'Complet aménagé', 'Complet non-aménagé', 'Partiel aménagé', 'Partiel non-aménagé', 'Vide sanitaire', 'Dalle de béton']
  const parkingTypes: ParkingType[] = ['Allée', 'Garage', 'Abri d\'auto', 'Rue', 'Aucun']
  const occupancyTypes: OccupancyType[] = ['Propriétaire', 'Locataire']
  const evaluationTypes: EvaluationType[] = ['Valeur marchande', 'Assurable']
  const floorTypes: FloorType[] = ['Sous-sol', 'Rez-de-chaussée', '2e étage', '3e étage', 'Comble', 'Mezzanine']

  const totals = calculateTotalHabitable()

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {property ? 'Modifier le comparable' : 'Nouveau comparable'}
      </DialogTitle>
      <DialogContent>
        {validationError && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setValidationError('')}>
            {validationError}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Information générale */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}15 100%)`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      Information générale
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {/* Row 1 */}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="ID No"
                        value={formData.property_id_no || 'Auto-généré'}
                        variant="outlined"
                        size="small"
                        disabled
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            WebkitTextFillColor: theme.palette.primary.main,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Adresse"
                        value={formData.adresse}
                        onChange={(e) => handleInputChange('adresse', e.target.value)}
                        variant="outlined"
                        size="small"
                        required
                        error={validationError !== '' && (!formData.adresse || formData.adresse.trim() === '')}
                        helperText={validationError !== '' && (!formData.adresse || formData.adresse.trim() === '') ? 'Champ requis' : ''}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Ville"
                        value={formData.ville}
                        onChange={(e) => handleInputChange('ville', e.target.value)}
                        variant="outlined"
                        size="small"
                        required
                        error={validationError !== '' && (!formData.ville || formData.ville.trim() === '')}
                        helperText={validationError !== '' && (!formData.ville || formData.ville.trim() === '') ? 'Champ requis' : ''}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Arrondissement"
                        value={formData.municipalite}
                        onChange={(e) => handleInputChange('municipalite', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <TextField
                        fullWidth
                        label="Code postal"
                        value={formData.code_postal}
                        onChange={(e) => handleInputChange('code_postal', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Province</InputLabel>
                        <Select
                          value={formData.province || 'QC'}
                          label="Province"
                          onChange={(e) => handleInputChange('province', e.target.value)}
                        >
                          <MenuItem value="QC">Québec</MenuItem>
                          <MenuItem value="ON">Ontario</MenuItem>
                          <MenuItem value="BC">Colombie-Britannique</MenuItem>
                          <MenuItem value="AB">Alberta</MenuItem>
                          <MenuItem value="MB">Manitoba</MenuItem>
                          <MenuItem value="SK">Saskatchewan</MenuItem>
                          <MenuItem value="NB">Nouveau-Brunswick</MenuItem>
                          <MenuItem value="NS">Nouvelle-Écosse</MenuItem>
                          <MenuItem value="PE">Île-du-Prince-Édouard</MenuItem>
                          <MenuItem value="NL">Terre-Neuve-et-Labrador</MenuItem>
                          <MenuItem value="YT">Yukon</MenuItem>
                          <MenuItem value="NT">Territoires du Nord-Ouest</MenuItem>
                          <MenuItem value="NU">Nunavut</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Row 2 - Conditional based on status */}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label={formData.status === 'Sujet' ? "Valeur d'évaluation" : "Prix de vente"}
                        type="text"
                        value={formatCurrencyDisplay(formData.prix_vente)}
                        onChange={(e) => handleInputChange(
                          'prix_vente',
                          parseCurrencyInput(e.target.value)
                        )}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney sx={{ color: theme.palette.success.main }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    {/* Hide Prix demandé when status is Sujet */}
                    {formData.status !== 'Sujet' && (
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Prix demandé"
                          type="text"
                          value={formatCurrencyDisplay(formData.prix_demande)}
                          onChange={(e) => handleInputChange('prix_demande', parseCurrencyInput(e.target.value))}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney sx={{ color: theme.palette.warning.main }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label={formData.status === 'Sujet' ? "Date effective" : "Date de vente"}
                        type="date"
                        value={formData.date_vente || ''}
                        onChange={(e) => handleInputChange(
                          'date_vente',
                          e.target.value
                        )}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    {/* Hide Jours sur marché when status is Sujet */}
                    {formData.status !== 'Sujet' && (
                      <Grid item xs={12} md={1}>
                        <TextField
                          fullWidth
                          label="Jours sur marché"
                          type="number"
                          value={formData.jours_sur_marche || ''}
                          onChange={(e) => handleInputChange('jours_sur_marche', e.target.value ? parseInt(e.target.value) : undefined)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} md={1.5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Statut</InputLabel>
                        <Select
                          value={formData.status || ''}
                          onChange={(e) => handleInputChange('status', e.target.value as PropertyStatus)}
                          label="Statut"
                        >
                          {propertyStatuses.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type de propriété</InputLabel>
                        <Select
                          value={formData.type_propriete || ''}
                          onChange={(e) => handleInputChange('type_propriete', e.target.value as PropertyType)}
                          label="Type de propriété"
                        >
                          {propertyTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        fullWidth
                        label="# MLS"
                        value={formData.numero_mls}
                        onChange={(e) => handleInputChange('numero_mls', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Conditional fields for Sujet status */}
                    {formData.status === 'Sujet' && (
                      <>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type d'évaluation</InputLabel>
                            <Select
                              value={formData.type_evaluation || ''}
                              onChange={(e) => handleInputChange('type_evaluation', e.target.value as EvaluationType)}
                              label="Type d'évaluation"
                            >
                              {evaluationTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {/* Only show Occupancy for non-multi-unit properties */}
                        {!(formData.type_propriete === 'Duplex' || formData.type_propriete === 'Triplex' || formData.type_propriete === 'Quadriplex+') && (
                          <>
                            <Grid item xs={12} md={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Occupancy</InputLabel>
                                <Select
                                  value={formData.occupancy || ''}
                                  onChange={(e) => handleInputChange('occupancy', e.target.value as OccupancyType)}
                                  label="Occupancy"
                                >
                                  {occupancyTypes.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            {formData.occupancy === 'Locataire' && (
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  label="Loyer en place"
                                  type="number"
                                  value={formData.loyer_en_place || ''}
                                  onChange={(e) => handleInputChange('loyer_en_place', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <AttachMoney sx={{ color: theme.palette.info.main }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* Conditional field for Condo */}
                    {formData.type_propriete === 'Condo' && (
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Frais de condo"
                          type="number"
                          value={formData.frais_condo || ''}
                          onChange={(e) => handleInputChange('frais_condo', e.target.value ? parseFloat(e.target.value) : undefined)}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney sx={{ color: theme.palette.secondary.main }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    )}

                    {/* Conditional fields for multi-unit properties */}
                    {(formData.type_propriete === 'Duplex' || formData.type_propriete === 'Triplex' || formData.type_propriete === 'Quadriplex+') && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Loyer par unité
                          </Typography>
                          <Grid container spacing={2}>
                            {Array.from({ length: getUnitCount(formData.type_propriete) }, (_, i) => {
                              const unitRent = unitRents[i] || { unitNumber: `Unité ${i + 1}`, monthlyRent: 0, isOwnerOccupied: false }
                              return (
                                <Grid item xs={12} md={6} key={i}>
                                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={4}>
                                        <TextField
                                          fullWidth
                                          label="No. d'unité"
                                          value={unitRent.unitNumber}
                                          onChange={(e) => {
                                            const newRents = [...unitRents]
                                            newRents[i] = {
                                              ...unitRent,
                                              unitNumber: e.target.value
                                            }
                                            setUnitRents(newRents)
                                            handleInputChange('unit_rents', newRents)
                                          }}
                                          variant="outlined"
                                          size="small"
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={5}>
                                        <TextField
                                          fullWidth
                                          label="Loyer mensuel"
                                          type="number"
                                          value={unitRent.isOwnerOccupied ? '' : (unitRent.monthlyRent || '')}
                                          onChange={(e) => {
                                            const newRents = [...unitRents]
                                            newRents[i] = {
                                              ...unitRent,
                                              monthlyRent: e.target.value ? parseFloat(e.target.value) : 0
                                            }
                                            setUnitRents(newRents)
                                            handleInputChange('unit_rents', newRents)
                                          }}
                                          variant="outlined"
                                          size="small"
                                          disabled={unitRent.isOwnerOccupied}
                                          InputProps={{
                                            startAdornment: (
                                              <InputAdornment position="start">
                                                <AttachMoney sx={{ color: theme.palette.info.main }} />
                                              </InputAdornment>
                                            ),
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth size="small">
                                          <InputLabel>Occupant</InputLabel>
                                          <Select
                                            value={unitRent.isOwnerOccupied ? 'owner' : 'tenant'}
                                            label="Occupant"
                                            onChange={(e) => {
                                              const newRents = [...unitRents]
                                              newRents[i] = {
                                                ...unitRent,
                                                isOwnerOccupied: e.target.value === 'owner'
                                              }
                                              setUnitRents(newRents)
                                              handleInputChange('unit_rents', newRents)
                                            }}
                                          >
                                            <MenuItem value="tenant">Locataire</MenuItem>
                                            <MenuItem value="owner">Propriétaire</MenuItem>
                                          </Select>
                                        </FormControl>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </Grid>
                              )
                            })}
                          </Grid>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Caractéristiques du bâtiment */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}08 0%, ${theme.palette.secondary.main}15 100%)`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Home sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                      Caractéristiques du bâtiment
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {/* Row 1 - Building characteristics */}
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Genre de propriété</InputLabel>
                        <Select
                          value={formData.genre_propriete || ''}
                          label="Genre de propriété"
                          onChange={(e) => handleInputChange('genre_propriete', e.target.value)}
                        >
                          <MenuItem value="Plain-pied">Plain-pied</MenuItem>
                          <MenuItem value="À étages">À étages</MenuItem>
                          <MenuItem value="1 Étage">1 Étage</MenuItem>
                          <MenuItem value="Un étage et demi">Un étage et demi</MenuItem>
                          <MenuItem value="Deux étages">Deux étages</MenuItem>
                          <MenuItem value="Deux étages et demi">Deux étages et demi</MenuItem>
                          <MenuItem value="Trois étages">Trois étages</MenuItem>
                          <MenuItem value="Paliers multiples">Paliers multiples</MenuItem>
                          <MenuItem value="Mobile">Mobile</MenuItem>
                          <MenuItem value="Maison de ville">Maison de ville</MenuItem>
                          <MenuItem value="Tour d'appartement">Tour d'appartement</MenuItem>
                          <MenuItem value="Terrain vacant">Terrain vacant</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type de bâtiment</InputLabel>
                        <Select
                          value={formData.type_batiment || ''}
                          label="Type de bâtiment"
                          onChange={(e) => handleInputChange('type_batiment', e.target.value)}
                        >
                          <MenuItem value="Isolé">Isolé</MenuItem>
                          <MenuItem value="Semi-détaché">Semi-détaché</MenuItem>
                          <MenuItem value="En rangée">En rangée</MenuItem>
                          <MenuItem value="En rangée sur coin">En rangée sur coin</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Conditional Condo fields between Type de bâtiment and Année de construction */}
                    {formData.type_propriete === 'Condo' && (
                      <>
                        <Grid item xs={12} md={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Localisation</InputLabel>
                            <Select
                              value={formData.localisation || ''}
                              label="Localisation"
                              onChange={(e) => handleInputChange('localisation', e.target.value)}
                            >
                              <MenuItem value="Coin">Coin</MenuItem>
                              <MenuItem value="Centre">Centre</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type de copropriété</InputLabel>
                            <Select
                              value={formData.type_copropriete || 'Divise'}
                              label="Type de copropriété"
                              onChange={(e) => handleInputChange('type_copropriete', e.target.value)}
                            >
                              <MenuItem value="Divise">Divise</MenuItem>
                              <MenuItem value="Indivise">Indivise</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12} md={1.3}>
                      <TextField
                        fullWidth
                        label="Année de construction"
                        type="number"
                        value={formData.annee_construction || ''}
                        onChange={(e) => {
                          const year = e.target.value ? parseInt(e.target.value) : undefined
                          handleInputChange('annee_construction', year)
                          // Auto-calculate chrono age
                          if (year) {
                            const currentYear = new Date().getFullYear()
                            const chronoAge = currentYear - year
                            handleInputChange('chrono_age', chronoAge)
                          }
                        }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={1.1}>
                      <TextField
                        fullWidth
                        label="Chrono. Age"
                        type="number"
                        value={formData.chrono_age || ''}
                        onChange={(e) => handleInputChange('chrono_age', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={1.1}>
                      <TextField
                        fullWidth
                        label="Eff. Age"
                        type="number"
                        value={formData.eff_age || ''}
                        onChange={(e) => handleInputChange('eff_age', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    {/* Force line break for non-Condo properties */}
                    {formData.type_propriete !== 'Condo' && <Grid item xs={12} sx={{ height: 0, padding: 0 }} />}
                    {/* Row 2 - Room counts (all 4 fields on same line) */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Nombre de pièces"
                        type="number"
                        value={formData.nombre_pieces || ''}
                        onChange={(e) => handleInputChange('nombre_pieces', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                        disabled={hasInspectionData}
                        InputProps={{
                          sx: hasInspectionData ? { bgcolor: 'action.disabledBackground' } : {}
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Nombre de chambres"
                        type="number"
                        value={formData.nombre_chambres || ''}
                        onChange={(e) => handleInputChange('nombre_chambres', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                        disabled={hasInspectionData}
                        InputProps={{
                          sx: hasInspectionData ? { bgcolor: 'action.disabledBackground' } : {}
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Salle de bain"
                        type="number"
                        value={formData.salle_bain || ''}
                        onChange={(e) => handleInputChange('salle_bain', e.target.value ? parseFloat(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                        inputProps={{ step: 0.5 }}
                        disabled={hasInspectionData}
                        InputProps={{
                          sx: hasInspectionData ? { bgcolor: 'action.disabledBackground' } : {}
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Salle d'eau"
                        type="number"
                        inputProps={{ step: 0.5 }}
                        value={formData.salle_eau || ''}
                        onChange={(e) => handleInputChange('salle_eau', e.target.value ? parseFloat(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                        disabled={hasInspectionData}
                        InputProps={{
                          sx: hasInspectionData ? { bgcolor: 'action.disabledBackground' } : {}
                        }}
                      />
                    </Grid>

                    {/* Row 3 */}
                    <Grid item xs={12} md={2.4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Stationnement</InputLabel>
                        <Select
                          value={formData.stationnement || ''}
                          onChange={(e) => handleInputChange('stationnement', e.target.value as ParkingType)}
                          label="Stationnement"
                        >
                          {parkingTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2.4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type de garage</InputLabel>
                        <Select
                          value={formData.type_garage || ''}
                          onChange={(e) => handleInputChange('type_garage', e.target.value)}
                          label="Type de garage"
                        >
                          <MenuItem value="Attaché">Attaché</MenuItem>
                          <MenuItem value="Détaché">Détaché</MenuItem>
                          <MenuItem value="Intégré">Intégré</MenuItem>
                          <MenuItem value="Au sous-sol">Au sous-sol</MenuItem>
                          <MenuItem value="Abri d'auto">Abri d'auto</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2.4}>
                      <TextField
                        fullWidth
                        label="Dimension garage"
                        value={formData.dimension_garage}
                        onChange={(e) => handleInputChange('dimension_garage', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2.4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type de sous-sol</InputLabel>
                        <Select
                          value={formData.type_sous_sol || ''}
                          onChange={(e) => handleInputChange('type_sous_sol', e.target.value as BasementType)}
                          label="Type de sous-sol"
                        >
                          {basementTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2.4}>
                      <TextField
                        fullWidth
                        label="Toiture"
                        value={formData.toiture}
                        onChange={(e) => handleInputChange('toiture', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Row 4 */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Extras"
                        value={formData.extras}
                        onChange={(e) => handleInputChange('extras', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Améliorations hors-sol"
                        value={formData.ameliorations_hors_sol}
                        onChange={(e) => handleInputChange('ameliorations_hors_sol', e.target.value)}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Données municipales */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}08 0%, ${theme.palette.secondary.main}15 100%)`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalance sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                      Données municipales
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Row 1: Lot Number and Matricule */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Numéro de lot"
                        value={formData.province === 'QC' ? formatLotNumber(formData.lot_number || '') : formData.lot_number || ''}
                        onChange={(e) => {
                          const value = formData.province === 'QC' ? parseLotNumber(e.target.value) : e.target.value
                          handleInputChange('lot_number', value)
                        }}
                        variant="outlined"
                        size="small"
                        placeholder={formData.province === 'QC' ? '# ### ###' : ''}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Matricule"
                        value={formData.matricule || ''}
                        onChange={(e) => handleInputChange('matricule', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Additional Lots */}
                    {additionalLots.map((lot) => (
                      <Grid item xs={12} key={lot.id}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Lot additionnel"
                              value={formData.province === 'QC' ? formatLotNumber(lot.lot_number) : lot.lot_number}
                              onChange={(e) => {
                                const value = formData.province === 'QC' ? parseLotNumber(e.target.value) : e.target.value
                                updateAdditionalLot(lot.id, 'lot_number', value)
                              }}
                              variant="outlined"
                              size="small"
                              placeholder={formData.province === 'QC' ? '# ### ###' : ''}
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type de lot</InputLabel>
                              <Select
                                value={lot.type_lot}
                                onChange={(e) => updateAdditionalLot(lot.id, 'type_lot', e.target.value)}
                                label="Type de lot"
                              >
                                <MenuItem value="Exclusif">Exclusif</MenuItem>
                                <MenuItem value="Commun">Commun</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <IconButton onClick={() => removeAdditionalLot(lot.id)} size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))}

                    <Grid item xs={12}>
                      <Button
                        startIcon={<Add />}
                        onClick={addAdditionalLot}
                        size="small"
                        variant="outlined"
                      >
                        Ajouter un lot additionnel
                      </Button>
                    </Grid>

                    {/* Évaluation municipale subsection */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                        Évaluation municipale
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        fullWidth
                        label="Année"
                        type="number"
                        value={formData.eval_municipale_annee || ''}
                        onChange={(e) => handleInputChange('eval_municipale_annee', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Terrain"
                        type="text"
                        value={formatCurrencyDisplay(formData.eval_municipale_terrain)}
                        onChange={(e) => {
                          const terrain = parseCurrencyInput(e.target.value)
                          handleInputChange('eval_municipale_terrain', terrain)
                          // Auto-calculate total
                          const total = (terrain || 0) + (formData.eval_municipale_batiment || 0)
                          handleInputChange('eval_municipale_total', total || undefined)
                        }}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Bâtiment"
                        type="text"
                        value={formatCurrencyDisplay(formData.eval_municipale_batiment)}
                        onChange={(e) => {
                          const batiment = parseCurrencyInput(e.target.value)
                          handleInputChange('eval_municipale_batiment', batiment)
                          // Auto-calculate total
                          const total = (formData.eval_municipale_terrain || 0) + (batiment || 0)
                          handleInputChange('eval_municipale_total', total || undefined)
                        }}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Total"
                        type="text"
                        value={formatCurrencyDisplay(formData.eval_municipale_total)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      />
                    </Grid>

                    {/* Force new line before taxes sections */}
                    <Grid item xs={12} />

                    {/* Taxes municipales and Taxes scolaires on same line */}
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Taxes municipales
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        fullWidth
                        label="Année"
                        type="number"
                        value={formData.taxes_municipales_annee || ''}
                        onChange={(e) => handleInputChange('taxes_municipales_annee', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Montant"
                        type="text"
                        value={formatCurrencyDisplay(formData.taxes_municipales_montant)}
                        onChange={(e) => handleInputChange('taxes_municipales_montant', parseCurrencyInput(e.target.value))}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Taxes scolaires
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        fullWidth
                        label="Année"
                        type="number"
                        value={formData.taxes_scolaires_annee || ''}
                        onChange={(e) => handleInputChange('taxes_scolaires_annee', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Montant"
                        type="text"
                        value={formatCurrencyDisplay(formData.taxes_scolaires_montant)}
                        onChange={(e) => handleInputChange('taxes_scolaires_montant', parseCurrencyInput(e.target.value))}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>

                    {/* Zonage section */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                        Zonage
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Zonage"
                        value={formData.zonage || ''}
                        onChange={(e) => handleInputChange('zonage', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={10}>
                      <TextField
                        fullWidth
                        label="Usages permis"
                        value={formData.zoning_usages_permis || ''}
                        onChange={(e) => handleInputChange('zoning_usages_permis', e.target.value)}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Superficies */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.info.main}08 0%, ${theme.palette.info.main}15 100%)`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SquareFoot sx={{ color: theme.palette.info.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                      Superficies
                    </Typography>
                  </Box>

                  {/* Terrain fields */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Superficie terrain (m²)"
                        type="number"
                        value={formData.superficie_terrain_m2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('superficie_terrain_m2', val)
                          if (val) {
                            handleInputChange('superficie_terrain_pi2', parseFloat((val * 10.764).toFixed(2)))
                          } else {
                            handleInputChange('superficie_terrain_pi2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Superficie terrain (pi²)"
                        type="number"
                        value={formData.superficie_terrain_pi2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('superficie_terrain_pi2', val)
                          if (val) {
                            handleInputChange('superficie_terrain_m2', parseFloat((val / 10.764).toFixed(2)))
                          } else {
                            handleInputChange('superficie_terrain_m2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* Frontage/Profondeur fields */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Frontage (m)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.frontage_m2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('frontage_m2', val)
                          if (val) {
                            handleInputChange('frontage_pi2', parseFloat((val * 3.28084).toFixed(2)))
                          } else {
                            handleInputChange('frontage_pi2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Frontage (pi)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.frontage_pi2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('frontage_pi2', val)
                          if (val) {
                            handleInputChange('frontage_m2', parseFloat((val / 3.28084).toFixed(2)))
                          } else {
                            handleInputChange('frontage_m2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Profondeur (m)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.profondeur_m2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('profondeur_m2', val)
                          if (val) {
                            handleInputChange('profondeur_pi2', parseFloat((val * 3.28084).toFixed(2)))
                          } else {
                            handleInputChange('profondeur_pi2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Profondeur (pi)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.profondeur_pi2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('profondeur_pi2', val)
                          if (val) {
                            handleInputChange('profondeur_m2', parseFloat((val / 3.28084).toFixed(2)))
                          } else {
                            handleInputChange('profondeur_m2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* Périmètre du bâtiment fields */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Périmètre du bâtiment (m)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.perimetre_batiment_m2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('perimetre_batiment_m2', val)
                          if (val) {
                            handleInputChange('perimetre_batiment_pi2', parseFloat((val * 3.28084).toFixed(2)))
                          } else {
                            handleInputChange('perimetre_batiment_pi2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Périmètre du bâtiment (pi)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.perimetre_batiment_pi2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('perimetre_batiment_pi2', val)
                          if (val) {
                            handleInputChange('perimetre_batiment_m2', parseFloat((val / 3.28084).toFixed(2)))
                          } else {
                            handleInputChange('perimetre_batiment_m2', undefined)
                          }
                        }}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Superficie par étage sub-section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Layers sx={{ color: theme.palette.info.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                      Superficie par étage
                    </Typography>
                  </Box>

                  {/* Add Floor Section */}
                  <Box sx={{
                    p: 2,
                    border: `1px dashed ${theme.palette.info.main}`,
                    borderRadius: 1,
                    mb: 2,
                    background: `rgba(${theme.palette.info.main}08)`
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                      Ajouter un étage
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Étage</InputLabel>
                          <Select
                            value={newFloor.floor}
                            onChange={(e) => setNewFloor(prev => ({ ...prev, floor: e.target.value as FloorType }))}
                            label="Étage"
                          >
                            {floorTypes.map((floor) => (
                              <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Superficie (m²)"
                          type="number"
                          value={newFloor.area_m2 || ''}
                          onChange={(e) => handleNewFloorAreaChange('area_m2', parseFloat(e.target.value) || 0)}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SquareFoot sx={{ color: theme.palette.info.main }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Superficie (pi²)"
                          type="number"
                          value={newFloor.area_ft2 || ''}
                          onChange={(e) => handleNewFloorAreaChange('area_ft2', parseFloat(e.target.value) || 0)}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SquareFoot sx={{ color: theme.palette.info.main }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Add />}
                          onClick={addFloorArea}
                          disabled={newFloor.area_m2 <= 0}
                          sx={{
                            background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                            '&:hover': {
                              background: `linear-gradient(45deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
                            }
                          }}
                        >
                          Ajouter
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Floor Areas Table */}
                  {floorAreas.length > 0 && (
                    <>
                      <TableContainer
                        component={Paper}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          mb: 2
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Stairs sx={{ mr: 1, color: theme.palette.info.main }} />
                                  Étage
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <SquareFoot sx={{ mr: 1, color: theme.palette.info.main }} />
                                  Superficie (m²)
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <SquareFoot sx={{ mr: 1, color: theme.palette.info.main }} />
                                  Superficie (pi²)
                                </Box>
                              </TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {floorAreas.map((floor) => (
                              <TableRow key={floor.id}>
                                <TableCell>{floor.floor}</TableCell>
                                <TableCell align="right">{floor.area_m2.toFixed(2)}</TableCell>
                                <TableCell align="right">{floor.area_ft2.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={floor.type}
                                    size="small"
                                    color={floor.type === 'hors-sol' ? 'success' : 'default'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => removeFloorArea(floor.id)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* Total Row */}
                            <TableRow sx={{
                              backgroundColor: theme.palette.success.light + '15',
                              '& td': {
                                fontWeight: 600,
                                borderTop: `2px solid ${theme.palette.success.main}`
                              }
                            }}>
                              <TableCell sx={{ color: theme.palette.success.dark }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Home sx={{ mr: 1 }} />
                                  Total hors-sol
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ color: theme.palette.success.dark }}>
                                {totals.m2.toFixed(2)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: theme.palette.success.dark }}>
                                {totals.ft2.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label="Habitable"
                                  size="small"
                                  color="success"
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Totals Summary */}
                      <Box sx={{
                        p: 2,
                        border: `1px solid ${theme.palette.success.main}`,
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.main}15 100%)`
                      }}>
                        <Typography variant="subtitle2" sx={{ color: theme.palette.success.dark, fontWeight: 600, mb: 1 }}>
                          Superficie habitable totale
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                              <Typography variant="h6" sx={{ color: theme.palette.success.dark, fontWeight: 700 }}>
                                {totals.m2.toFixed(2)} m²
                              </Typography>
                              <Typography variant="caption" color="textSecondary">Métrique</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                              <Typography variant="h6" sx={{ color: theme.palette.success.dark, fontWeight: 700 }}>
                                {totals.ft2.toFixed(2)} pi²
                              </Typography>
                              <Typography variant="caption" color="textSecondary">Impérial</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Inspection Section - Show for ALL properties */}
            {property && (
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InspectionIcon sx={{ color: 'white', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          Inspection
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          isInspectionComplete ? 'Complété' :
                          property.inspection_status === 'in_progress' ? 'En cours' :
                          'Non commencé'
                        }
                        sx={{
                          backgroundColor:
                            isInspectionComplete ? '#4CAF50' :
                            property.inspection_status === 'in_progress' ? '#FF9800' :
                            '#9E9E9E',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Progrès global
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                          {inspectionProgress}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 8,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${inspectionProgress}%`,
                            height: '100%',
                            backgroundColor: isInspectionComplete ? '#4CAF50' : 'white',
                            borderRadius: 4,
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Date d'inspection
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                            {property.inspection_date ? new Date(property.inspection_date).toLocaleDateString('fr-CA') : 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>

                      {property.inspection_pieces && (
                        <>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Pièces inspectées
                              </Typography>
                              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                {property.inspection_pieces.completedRooms || 0} / {property.inspection_pieces.totalRooms || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Étages
                              </Typography>
                              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                {Object.keys(property.inspection_pieces.floors || {}).length}
                              </Typography>
                            </Box>
                          </Grid>
                        </>
                      )}
                    </Grid>

                    {/* Completed Categories */}
                    {completedCategories.length > 0 && (
                      <Box sx={{ mb: 2, p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, display: 'block' }}>
                          Catégories complétées
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {completedCategories.map((categoryId) => (
                            <Chip
                              key={categoryId}
                              icon={<CheckCircle sx={{ fontSize: 16 }} />}
                              label={t(getCategoryTranslationKey(categoryId))}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                color: '#667eea',
                                fontWeight: 600
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!property.inspection_status || property.inspection_status === 'not_started') {
                          setInspectionConfirmOpen(true)
                        } else {
                          onClose()
                          router.push(`/${locale}/inspection/${property.id}/categories`)
                        }
                      }}
                      sx={{
                        backgroundColor: 'white',
                        color: '#667eea',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    >
                      {isInspectionComplete ? 'Voir inspection' :
                       (property.inspection_status && property.inspection_status !== 'not_started' ? 'Continuer l\'inspection' : 'Commencer l\'inspection')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Sauvegarder
        </Button>
      </DialogActions>
    </Dialog>

    {/* Inspection Confirmation Dialog */}
    <Dialog
      open={inspectionConfirmOpen}
      onClose={() => setInspectionConfirmOpen(false)}
    >
      <DialogTitle>Commencer une inspection</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Voulez-vous commencer une inspection pour cette propriété? Cela initialisera le module d'inspection et vous permettra de documenter l'état de la propriété.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setInspectionConfirmOpen(false)}>
          Annuler
        </Button>
        <Button
          onClick={async () => {
            if (property) {
              // Initialize inspection
              await onSave({
                inspection_status: 'in_progress',
                inspection_date: new Date(),
                inspection_completion: 0
              } as any)
              setInspectionConfirmOpen(false)
              onClose()
              router.push(`/fr/inspection/${property.id}/categories`)
            }
          }}
          variant="contained"
          sx={{
            bgcolor: '#667eea',
            '&:hover': {
              bgcolor: '#5568d3'
            }
          }}
        >
          Commencer
        </Button>
      </DialogActions>
    </Dialog>
  </>
  )
}