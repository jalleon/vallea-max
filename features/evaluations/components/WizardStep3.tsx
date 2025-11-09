'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { TemplateType, WizardStep1Data, WizardStep2Data } from '../types/evaluation.types';
import { PROPERTY_TYPES, PROPERTY_GENRES, VALUE_TYPES } from '../constants/evaluation.constants';
import { useTranslations } from 'next-intl';

interface WizardStep3Props {
  templateType: TemplateType;
  step1Data: WizardStep1Data;
  step2Data: WizardStep2Data;
}

export default function WizardStep3({ templateType, step1Data, step2Data }: WizardStep3Props) {
  const t = useTranslations('evaluations.wizard.step3');
  const tTemplates = useTranslations('evaluations.templates');

  const getPropertyTypeLabel = () => {
    return PROPERTY_TYPES.find((t) => t.value === step1Data.propertyType)?.label || '';
  };

  const getPropertyGenreLabel = () => {
    return PROPERTY_GENRES.find((g) => g.value === step1Data.propertyGenre)?.label || '';
  };

  const getValueTypeLabel = () => {
    return VALUE_TYPES.find((v) => v.value === step2Data.valueType)?.label || '';
  };

  const getTemplateLabel = () => {
    switch (templateType) {
      case 'RPS':
        return tTemplates('rps.subtitle') + ' (' + templateType + ')';
      case 'NAS':
        return tTemplates('nas.subtitle') + ' (' + templateType + ')';
      case 'CUSTOM':
        return tTemplates('custom.subtitle');
      default:
        return templateType;
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

      <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
        {t('allInfoProvided')}
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('templateType')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('typeOfTemplate')}:
                </Typography>
                <Chip label={getTemplateLabel()} color="primary" size="small" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('propertyInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                {t('propertyType')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {getPropertyTypeLabel()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                {t('propertyGenre')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {getPropertyGenreLabel()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('basicInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                {t('clientName')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {step2Data.clientName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                {t('appraisalNumber')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {t('willBeGenerated')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                {t('address')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {step2Data.address || t('notSpecified')}
                {step2Data.city && `, ${step2Data.city}`}
                {step2Data.postalCode && ` ${step2Data.postalCode}`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                {t('valueType')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {getValueTypeLabel()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                {t('effectiveDate')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {new Date(step2Data.effectiveDate).toLocaleDateString('fr-CA')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                {t('evaluationObjective')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {step2Data.evaluationObjective}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}