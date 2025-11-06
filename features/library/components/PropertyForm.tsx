'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  InputAdornment,
  Typography,
  Box,
  Divider
} from '@mui/material'
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Property, PropertyCreateInput, PropertyUpdateInput, PropertyType, PropertyStatus, BasementType } from '../types/property.types'
import { PROPERTY_TYPES, PROPERTY_STATUSES, BASEMENT_TYPES } from '../constants/property.constants'
import { formatCurrency, convertM2ToPi2, convertPi2ToM2 } from '@/lib/utils/formatting'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

const propertySchema = z.object({
  adresse: z.string().min(1, 'Address required'),
  ville: z.string().optional(),
  municipalite: z.string().optional(),
  code_postal: z.string().optional(),
  province: z.string().optional(),
  prix_vente: z.number().optional(),
  prix_demande: z.number().optional(),
  date_vente: z.date().optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  type_propriete: z.enum(PROPERTY_TYPES).optional(),
  genre_propriete: z.string().optional(),
  annee_construction: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  zonage: z.string().optional(),
  superficie_terrain_m2: z.number().min(0).optional(),
  superficie_terrain_pi2: z.number().min(0).optional(),
  frontage_m2: z.number().min(0).optional(),
  profondeur_m2: z.number().min(0).optional(),
  frontage_pi2: z.number().min(0).optional(),
  profondeur_pi2: z.number().min(0).optional(),
  superficie_habitable_m2: z.number().min(0).optional(),
  superficie_habitable_pi2: z.number().min(0).optional(),
  nombre_chambres: z.number().int().min(0).optional(),
  salle_bain: z.number().min(0).optional(),
  salle_eau: z.number().min(0).optional(),
  stationnement: z.string().optional(),
  dimension_garage: z.string().optional(),
  type_sous_sol: z.enum(BASEMENT_TYPES).optional(),
  toiture: z.string().optional(),
  ameliorations_hors_sol: z.string().optional(),
  numero_mls: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  is_template: z.boolean().optional(),
  is_shared: z.boolean().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  property?: Property
  onSubmit: (data: PropertyCreateInput | PropertyUpdateInput) => void
  loading?: boolean
}

const propertyTypes: PropertyType[] = [...PROPERTY_TYPES]
const propertyStatuses: PropertyStatus[] = [...PROPERTY_STATUSES]
const basementTypes: BasementType[] = [...BASEMENT_TYPES]

export function PropertyForm({ property, onSubmit, loading = false }: PropertyFormProps) {
  const t = useTranslations('library.form')
  const tTypes = useTranslations('library.propertyTypes')
  const tStatus = useTranslations('library.propertyStatus')
  const tBasement = useTranslations('library.basementTypes')
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property ? {
      ...property,
      date_vente: property.date_vente ? new Date(property.date_vente) : undefined,
    } : {
      province: 'QC',
      is_shared: true,
      is_template: false,
    }
  })

  // Watch terrain values for automatic conversion
  const terrainM2 = watch('superficie_terrain_m2')
  const terrainPi2 = watch('superficie_terrain_pi2')
  const habitableM2 = watch('superficie_habitable_m2')
  const habitablePi2 = watch('superficie_habitable_pi2')

  // Auto-convert terrain surface area
  useEffect(() => {
    if (terrainM2 && !terrainPi2) {
      setValue('superficie_terrain_pi2', Math.round(convertM2ToPi2(terrainM2)))
    }
  }, [terrainM2, terrainPi2, setValue])

  useEffect(() => {
    if (terrainPi2 && !terrainM2) {
      setValue('superficie_terrain_m2', Math.round(convertPi2ToM2(terrainPi2)))
    }
  }, [terrainPi2, terrainM2, setValue])

  // Auto-convert living area
  useEffect(() => {
    if (habitableM2 && !habitablePi2) {
      setValue('superficie_habitable_pi2', Math.round(convertM2ToPi2(habitableM2)))
    }
  }, [habitableM2, habitablePi2, setValue])

  useEffect(() => {
    if (habitablePi2 && !habitableM2) {
      setValue('superficie_habitable_m2', Math.round(convertPi2ToM2(habitablePi2)))
    }
  }, [habitablePi2, habitableM2, setValue])

  const handleFormSubmit = (data: PropertyFormData) => {
    const formattedData = {
      ...data,
      date_vente: data.date_vente?.toISOString().split('T')[0],
    }

    if (property) {
      onSubmit({ id: property.id, ...formattedData } as PropertyUpdateInput)
    } else {
      onSubmit(formattedData as PropertyCreateInput)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('basicInformation')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="adresse"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('address') + ' *'}
                fullWidth
                error={!!errors.adresse}
                helperText={errors.adresse?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="ville"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('city')}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="municipalite"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('municipality')}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="code_postal"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('postalCode')}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('province')}
                fullWidth
                select
              >
                <MenuItem value="QC">{t('provinces.QC')}</MenuItem>
                <MenuItem value="ON">{t('provinces.ON')}</MenuItem>
                <MenuItem value="BC">{t('provinces.BC')}</MenuItem>
                <MenuItem value="AB">{t('provinces.AB')}</MenuItem>
                <MenuItem value="MB">{t('provinces.MB')}</MenuItem>
                <MenuItem value="SK">{t('provinces.SK')}</MenuItem>
                <MenuItem value="NS">{t('provinces.NS')}</MenuItem>
                <MenuItem value="NB">{t('provinces.NB')}</MenuItem>
                <MenuItem value="PE">{t('provinces.PE')}</MenuItem>
                <MenuItem value="NL">{t('provinces.NL')}</MenuItem>
                <MenuItem value="YT">{t('provinces.YT')}</MenuItem>
                <MenuItem value="NT">{t('provinces.NT')}</MenuItem>
                <MenuItem value="NU">{t('provinces.NU')}</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* Property Details */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('propertyDetails')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="type_propriete"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('propertyType')}</InputLabel>
                <Select {...field} label={t('propertyType')}>
                  {propertyTypes.map(type => (
                    <MenuItem key={type} value={type}>{tTypes(type)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="genre_propriete"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('propertyGenre')}
                fullWidth
                placeholder={t('propertyGenrePlaceholder')}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="annee_construction"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('constructionYear')}
                type="number"
                fullWidth
                error={!!errors.annee_construction}
                helperText={errors.annee_construction?.message}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="zonage"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('zoning')}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* Pricing */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('pricingAndSale')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="prix_demande"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('askingPrice')}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="prix_vente"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('salePrice')}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('status')}</InputLabel>
                <Select {...field} label={t('status')}>
                  {propertyStatuses.map(status => (
                    <MenuItem key={status} value={status}>{tStatus(status)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="date_vente"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('saleDate')}
                type="date"
                fullWidth
                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="numero_mls"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('mlsNumber')}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* Dimensions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('dimensions')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="superficie_terrain_m2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('lotAreaM2')}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="superficie_terrain_pi2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('lotAreaPi2')}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">pi²</InputAdornment>
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="superficie_habitable_m2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('livingAreaM2')}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="superficie_habitable_pi2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('livingAreaPi2')}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">pi²</InputAdornment>
                }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        {/* Property Features */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('features')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="nombre_chambres"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('bedroomCount')}
                type="number"
                fullWidth
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="salle_bain"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('bathroomCount')}
                type="number"
                fullWidth
                inputProps={{ step: 0.5 }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="salle_eau"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('powderRoomCount')}
                type="number"
                fullWidth
                inputProps={{ step: 0.5 }}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="type_sous_sol"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('basementType')}</InputLabel>
                <Select {...field} label={t('basementType')}>
                  {basementTypes.map(type => (
                    <MenuItem key={type} value={type}>{tBasement(type)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="stationnement"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('parking')}
                fullWidth
                placeholder={t('parkingPlaceholder')}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('notes')}
                multiline
                rows={4}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* Options */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('options')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="is_shared"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label={t('sharedWithTeam')}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="is_template"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label={t('useAsTemplate')}
              />
            )}
          />
        </Grid>
      </Grid>
    </form>
  )
}