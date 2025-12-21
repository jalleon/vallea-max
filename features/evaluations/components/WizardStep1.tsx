'use client';

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { WizardStep1Data, ValuationApproach } from '../types/evaluation.types';
import { PROPERTY_TYPES, PROPERTY_GENRES, PROPERTY_TYPES_HIDING_GENRE, VALUATION_APPROACHES } from '../constants/evaluation.constants';
import { useTranslations } from 'next-intl';

interface WizardStep1Props {
  data: WizardStep1Data;
  onChange: (data: WizardStep1Data) => void;
}

export default function WizardStep1({ data, onChange }: WizardStep1Props) {
  const t = useTranslations('evaluations.wizard.step1');
  const tPropertyTypes = useTranslations('evaluations.propertyTypes');
  const tPropertyGenres = useTranslations('evaluations.propertyGenres');
  const tApproaches = useTranslations('evaluations.valuationApproaches');

  // Check if genre field should be hidden based on property type
  const shouldHideGenre = data.propertyType && PROPERTY_TYPES_HIDING_GENRE.includes(data.propertyType);

  const handleApproachChange = (approach: ValuationApproach, checked: boolean) => {
    const currentApproaches = data.valuationApproaches || [];
    const newApproaches = checked
      ? [...currentApproaches, approach]
      : currentApproaches.filter(a => a !== approach);
    onChange({ ...data, valuationApproaches: newApproaches });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        {t('title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {t('subtitle')}
      </Typography>

      <Grid container spacing={3}>
        {/* Property Type */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>{t('propertyType')}</InputLabel>
            <Select
              value={data.propertyType || ''}
              onChange={(e) => onChange({
                ...data,
                propertyType: e.target.value as any,
                // Clear genre if switching to a type that hides it
                propertyGenre: PROPERTY_TYPES_HIDING_GENRE.includes(e.target.value as any) ? null : data.propertyGenre
              })}
              label={t('propertyType')}
            >
              {PROPERTY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {tPropertyTypes(type.value as any)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Property Genre - conditionally hidden */}
        {!shouldHideGenre && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('propertyGenre')}</InputLabel>
              <Select
                value={data.propertyGenre || ''}
                onChange={(e) => onChange({ ...data, propertyGenre: e.target.value as any })}
                label={t('propertyGenre')}
              >
                {PROPERTY_GENRES.map((genre) => (
                  <MenuItem key={genre.value} value={genre.value}>
                    {tPropertyGenres(genre.value as any)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Valuation Approaches - Multi-select checkboxes */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            {t('valuationApproaches')}
          </Typography>
          <FormGroup>
            <Grid container spacing={1}>
              {VALUATION_APPROACHES.map((approach) => (
                <Grid item xs={12} sm={6} key={approach.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={(data.valuationApproaches || []).includes(approach.value)}
                        onChange={(e) => handleApproachChange(approach.value, e.target.checked)}
                        size="small"
                      />
                    }
                    label={tApproaches(approach.value as any)}
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </Grid>

        {/* Sur Plan Checkbox */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={data.surPlan || false}
                onChange={(e) => onChange({ ...data, surPlan: e.target.checked })}
              />
            }
            label={t('surPlan')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
