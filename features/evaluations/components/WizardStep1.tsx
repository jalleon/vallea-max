'use client';

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { WizardStep1Data } from '../types/evaluation.types';
import { PROPERTY_TYPES, PROPERTY_GENRES } from '../constants/evaluation.constants';
import { useTranslations } from 'next-intl';

interface WizardStep1Props {
  data: WizardStep1Data;
  onChange: (data: WizardStep1Data) => void;
}

export default function WizardStep1({ data, onChange }: WizardStep1Props) {
  const t = useTranslations('evaluations.wizard.step1');

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        {t('title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {t('subtitle')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>{t('propertyType')}</InputLabel>
            <Select
              value={data.propertyType || ''}
              onChange={(e) => onChange({ ...data, propertyType: e.target.value as any })}
              label={t('propertyType')}
            >
              {PROPERTY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>{t('propertyGenre')}</InputLabel>
            <Select
              value={data.propertyGenre || ''}
              onChange={(e) => onChange({ ...data, propertyGenre: e.target.value as any })}
              label={t('propertyGenre')}
            >
              {PROPERTY_GENRES.map((genre) => (
                <MenuItem key={genre.value} value={genre.value}>
                  {genre.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}