'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  useTheme
} from '@mui/material'
import {
  Add,
  Delete,
  LocationOn,
  Layers,
  Home,
  Stairs,
  SquareFoot,
  AttachMoney
} from '@mui/icons-material'
import { Property, PropertyCreateInput, PropertyType, PropertyStatus, BasementType, ParkingType, FloorType, FloorArea } from '../types/property.types'
import { v4 as uuidv4 } from 'uuid'

interface PropertyEditProps {
  property: Property | null
  open: boolean
  onClose: () => void
  onSave: (property: PropertyCreateInput) => Promise<void>
}

export function PropertyEdit({ property, open, onClose, onSave }: PropertyEditProps) {
  const theme = useTheme()
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
    perimetre_batiment_m2: undefined,
    perimetre_batiment_pi2: undefined,
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
    source: '',
    notes: '',
    is_template: false,
    is_shared: false
  })

  const [floorAreas, setFloorAreas] = useState<FloorArea[]>([])
  const [newFloor, setNewFloor] = useState({
    floor: 'Rez-de-chaussée' as FloorType,
    area_m2: 0,
    area_ft2: 0
  })

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
        genre_propriete: property.genre_propriete || '',
        annee_construction: property.annee_construction,
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
        nombre_pieces: property.nombre_pieces,
        nombre_chambres: property.nombre_chambres,
        salle_bain: property.salle_bain,
        salle_eau: property.salle_eau,
        stationnement: property.stationnement,
        dimension_garage: property.dimension_garage || '',
        type_sous_sol: property.type_sous_sol,
        toiture: property.toiture || '',
        ameliorations_hors_sol: property.ameliorations_hors_sol || '',
        numero_mls: property.numero_mls || '',
        floor_areas: property.floor_areas || [],
        notes: property.notes || '',
        is_template: property.is_template,
        is_shared: property.is_shared
      })
      setFloorAreas(property.floor_areas || [])
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
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const propertyTypes: PropertyType[] = ['Condo', 'Unifamiliale', 'Plex', 'Appartement', 'Semi-commercial', 'Autre']
  const propertyStatuses: PropertyStatus[] = ['Vendu', 'Actif', 'Retiré', 'Conditionnel', 'Expiré']
  const basementTypes: BasementType[] = ['Aucun', 'Complet aménagé', 'Complet non-aménagé', 'Partiel aménagé', 'Partiel non-aménagé', 'Vide sanitaire', 'Dalle de béton']
  const parkingTypes: ParkingType[] = ['Allée', 'Garage', 'Abri d\'auto', 'Rue', 'Aucun']
  const floorTypes: FloorType[] = ['Sous-sol', 'Rez-de-chaussée', '2e étage', '3e étage', 'Comble', 'Mezzanine']

  const totals = calculateTotalHabitable()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {property ? 'Modifier le comparable' : 'Nouveau comparable'}
      </DialogTitle>
      <DialogContent>
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
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Adresse"
                        value={formData.adresse}
                        onChange={(e) => handleInputChange('adresse', e.target.value)}
                        variant="outlined"
                        size="small"
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
                    <Grid item xs={12} md={2}>
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

                    {/* Row 2 */}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Prix de vente"
                        type="number"
                        value={formData.prix_vente || ''}
                        onChange={(e) => handleInputChange('prix_vente', e.target.value ? parseFloat(e.target.value) : undefined)}
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
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Prix demandé"
                        type="number"
                        value={formData.prix_demande || ''}
                        onChange={(e) => handleInputChange('prix_demande', e.target.value ? parseFloat(e.target.value) : undefined)}
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
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Date de vente"
                        type="date"
                        value={formData.date_vente}
                        onChange={(e) => handleInputChange('date_vente', e.target.value)}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
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
                    <Grid item xs={12} md={2}>
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
                    {/* Row 1 */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Genre de propriété</InputLabel>
                        <Select
                          value={formData.genre_propriete || ''}
                          label="Genre de propriété"
                          onChange={(e) => handleInputChange('genre_propriete', e.target.value)}
                        >
                          <MenuItem value="Plain-pied">Plain-pied</MenuItem>
                          <MenuItem value="À étages">À étages</MenuItem>
                          <MenuItem value="Paliers multiples">Paliers multiples</MenuItem>
                          <MenuItem value="Un étage et demi">Un étage et demi</MenuItem>
                          <MenuItem value="Mobile">Mobile</MenuItem>
                          <MenuItem value="Maison de ville">Maison de ville</MenuItem>
                          <MenuItem value="Terrain vacant">Terrain vacant</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Année de construction"
                        type="number"
                        value={formData.annee_construction || ''}
                        onChange={(e) => handleInputChange('annee_construction', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Zonage"
                        value={formData.zonage}
                        onChange={(e) => handleInputChange('zonage', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="# MLS"
                        value={formData.numero_mls}
                        onChange={(e) => handleInputChange('numero_mls', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Row 2 */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Nombre de pièces"
                        type="number"
                        value={formData.nombre_pieces || ''}
                        onChange={(e) => handleInputChange('nombre_pieces', e.target.value ? parseInt(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
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
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Salle de bain"
                        type="number"
                        step="0.5"
                        value={formData.salle_bain || ''}
                        onChange={(e) => handleInputChange('salle_bain', e.target.value ? parseFloat(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Salle d'eau"
                        type="number"
                        step="0.5"
                        value={formData.salle_eau || ''}
                        onChange={(e) => handleInputChange('salle_eau', e.target.value ? parseFloat(e.target.value) : undefined)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Row 3 */}
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Dimension garage"
                        value={formData.dimension_garage}
                        onChange={(e) => handleInputChange('dimension_garage', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
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
                        label="Périmètre du bâtiment (m²)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.perimetre_batiment_m2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('perimetre_batiment_m2', val)
                          if (val) {
                            handleInputChange('perimetre_batiment_pi2', parseFloat((val * 10.764).toFixed(2)))
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
                        label="Périmètre du bâtiment (pi²)"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={formData.perimetre_batiment_pi2 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : undefined
                          handleInputChange('perimetre_batiment_pi2', val)
                          if (val) {
                            handleInputChange('perimetre_batiment_m2', parseFloat((val / 10.764).toFixed(2)))
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
  )
}