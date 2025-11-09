'use client';

import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { WizardStep2Data } from '../types/evaluation.types';
import { VALUE_TYPES, EVALUATION_OBJECTIVES } from '../constants/evaluation.constants';
import PropertySelector from './PropertySelector';
import { useTranslations } from 'next-intl';

interface WizardStep2Props {
  data: WizardStep2Data;
  onChange: (data: WizardStep2Data) => void;
}

export default function WizardStep2({ data, onChange }: WizardStep2Props) {
  const t = useTranslations('evaluations.wizard.step2');

  // Derive property source from data instead of maintaining separate state
  const propertySource: 'library' | 'manual' = data.propertyId ? 'library' :
    (data.address || data.city) ? 'manual' : 'library';

  const handlePropertySelect = (propertyId: string, propertyData: any) => {
    onChange({
      ...data,
      propertyId,
      address: propertyData.adresse || '',
      city: propertyData.ville || '',
      postalCode: propertyData.code_postal || ''
    });
  };

  const handleSourceChange = (source: 'library' | 'manual') => {
    if (source === 'manual') {
      onChange({ ...data, propertyId: null, address: '', city: '', postalCode: '' });
    } else {
      onChange({ ...data, propertyId: null, address: '', city: '', postalCode: '' });
    }
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
        {/* Client Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={t('clientName')}
            value={data.clientName}
            onChange={(e) => onChange({ ...data, clientName: e.target.value })}
            placeholder={t('clientNamePlaceholder')}
          />
        </Grid>

        {/* Appraisal Number - Auto-generated display */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2">
              <strong>{t('appraisalNumber')}:</strong> {t('appraisalNumberInfo')}
            </Typography>
          </Alert>
        </Grid>

        {/* Property Source Selection */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t('propertySource')} *
          </Typography>
          <RadioGroup
            row
            value={propertySource}
            onChange={(e) => handleSourceChange(e.target.value as any)}
          >
            <FormControlLabel
              value="library"
              control={<Radio />}
              label={t('propertySourceLibrary')}
            />
            <FormControlLabel value="manual" control={<Radio />} label={t('propertySourceManual')} />
          </RadioGroup>
        </Grid>

        {/* Property from Library */}
        {propertySource === 'library' && (
          <Grid item xs={12}>
            <PropertySelector
              selectedPropertyId={data.propertyId}
              onSelect={handlePropertySelect}
            />
          </Grid>
        )}

        {/* Manual Property Entry */}
        {propertySource === 'manual' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={t('address')}
                value={data.address}
                onChange={(e) => onChange({ ...data, address: e.target.value })}
                placeholder={t('addressPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                required
                label={t('city')}
                value={data.city}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
                placeholder={t('cityPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('postalCode')}
                value={data.postalCode}
                onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
                placeholder={t('postalCodePlaceholder')}
              />
            </Grid>
          </>
        )}

        {/* Value Type */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>{t('valueType')}</InputLabel>
            <Select
              value={data.valueType || ''}
              onChange={(e) => onChange({ ...data, valueType: e.target.value as any })}
              label={t('valueType')}
            >
              {VALUE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Effective Date */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="date"
            label={t('effectiveDate')}
            value={data.effectiveDate}
            onChange={(e) => onChange({ ...data, effectiveDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Evaluation Objective */}
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>{t('evaluationObjective')}</InputLabel>
            <Select
              value={data.evaluationObjective}
              onChange={(e) => onChange({ ...data, evaluationObjective: e.target.value })}
              label={t('evaluationObjective')}
            >
              {EVALUATION_OBJECTIVES.map((objective) => (
                <MenuItem key={objective} value={objective}>
                  {objective}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}