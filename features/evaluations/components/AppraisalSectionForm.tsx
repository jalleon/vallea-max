'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Button,
  Divider
} from '@mui/material';
import { CheckCircle, Circle } from '@mui/icons-material';
import { TemplateType } from '../types/evaluation.types';
import { useTranslations } from 'next-intl';
import DirectComparisonForm from './DirectComparisonForm';

interface AppraisalSectionFormProps {
  sectionId: string;
  templateType: TemplateType;
  data: any;
  onChange: (data: any) => void;
}

export default function AppraisalSectionForm({
  sectionId,
  templateType,
  data,
  onChange
}: AppraisalSectionFormProps) {
  const t = useTranslations('evaluations.sections');
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleMarkComplete = () => {
    const newData = { ...formData, completed: !formData.completed };
    setFormData(newData);
    onChange(newData);
  };

  // Render different forms based on section ID
  const renderSectionForm = () => {
    // NAS Sections
    if (templateType === 'NAS') {
      switch (sectionId) {
        case 'client':
          return renderClientSection();
        case 'evaluateur':
          return renderEvaluateurSection();
        case 'propriete_evaluee':
          return renderPropertySection();
        case 'quartier':
          return renderQuartierSection();
        case 'ameliorations':
          return renderAmeliorationsSection();
        case 'technique_parite':
          return <DirectComparisonForm data={formData} onChange={onChange} />;
        default:
          return renderGenericSection();
      }
    }

    // RPS Sections
    if (templateType === 'RPS') {
      switch (sectionId) {
        case 'identification_client':
          return renderClientSection();
        case 'identification_evaluateur':
          return renderEvaluateurSection();
        case 'identification_bien':
          return renderPropertySection();
        case 'methode_parite':
          return <DirectComparisonForm data={formData} onChange={onChange} />;
        default:
          return renderGenericSection();
      }
    }

    // Custom Sections
    if (templateType === 'CUSTOM') {
      switch (sectionId) {
        case 'informations_generales':
          return renderGeneralInfoSection();
        case 'description_propriete':
          return renderPropertyDescriptionSection();
        default:
          return renderGenericSection();
      }
    }

    return renderGenericSection();
  };

  const renderClientSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('clientInfo')}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('clientName')}
          value={formData.clientName || ''}
          onChange={(e) => handleFieldChange('clientName', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('clientAddress')}
          value={formData.clientAddress || ''}
          onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('clientPhone')}
          value={formData.clientPhone || ''}
          onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('clientEmail')}
          type="email"
          value={formData.clientEmail || ''}
          onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('additionalNotes')}
          value={formData.clientNotes || ''}
          onChange={(e) => handleFieldChange('clientNotes', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderEvaluateurSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('appraiserInfo')}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('appraiserName')}
          value={formData.appraiserName || ''}
          onChange={(e) => handleFieldChange('appraiserName', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('licenseNumber')}
          value={formData.licenseNumber || ''}
          onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('appraiserPhone')}
          value={formData.appraiserPhone || ''}
          onChange={(e) => handleFieldChange('appraiserPhone', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('appraiserEmail')}
          type="email"
          value={formData.appraiserEmail || ''}
          onChange={(e) => handleFieldChange('appraiserEmail', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t('company')}
          value={formData.company || ''}
          onChange={(e) => handleFieldChange('company', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderPropertySection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('propertyDescription')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t('fullAddress')}
          value={formData.propertyAddress || ''}
          onChange={(e) => handleFieldChange('propertyAddress', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label={t('cadastreNumber')}
          value={formData.cadastreNumber || ''}
          onChange={(e) => handleFieldChange('cadastreNumber', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label={t('matriculeNumber')}
          value={formData.matriculeNumber || ''}
          onChange={(e) => handleFieldChange('matriculeNumber', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label={t('yearBuilt')}
          type="number"
          value={formData.yearBuilt || ''}
          onChange={(e) => handleFieldChange('yearBuilt', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('generalDescription')}
          placeholder={t('generalDescriptionPlaceholder')}
          value={formData.propertyDescription || ''}
          onChange={(e) => handleFieldChange('propertyDescription', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderQuartierSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('neighborhoodAnalysis')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t('neighborhoodName')}
          value={formData.neighborhoodName || ''}
          onChange={(e) => handleFieldChange('neighborhoodName', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          {t('neighborhoodType')}
        </Typography>
        <RadioGroup
          value={formData.neighborhoodType || ''}
          onChange={(e) => handleFieldChange('neighborhoodType', e.target.value)}
        >
          <FormControlLabel value="urbain" control={<Radio />} label={t('neighborhoodTypeUrban')} />
          <FormControlLabel value="suburban" control={<Radio />} label={t('neighborhoodTypeSuburban')} />
          <FormControlLabel value="rural" control={<Radio />} label={t('neighborhoodTypeRural')} />
        </RadioGroup>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('neighborhoodFeatures')}
          placeholder={t('neighborhoodFeaturesPlaceholder')}
          value={formData.neighborhoodFeatures || ''}
          onChange={(e) => handleFieldChange('neighborhoodFeatures', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('marketTrends')}
          placeholder={t('marketTrendsPlaceholder')}
          value={formData.marketTrends || ''}
          onChange={(e) => handleFieldChange('marketTrends', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderAmeliorationsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('improvementsAndRenovations')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>{t('overallCondition')}</InputLabel>
          <Select
            value={formData.overallCondition || ''}
            onChange={(e) => handleFieldChange('overallCondition', e.target.value)}
            label={t('overallCondition')}
          >
            <MenuItem value="excellent">{t('conditionExcellent')}</MenuItem>
            <MenuItem value="tres_bon">{t('conditionVeryGood')}</MenuItem>
            <MenuItem value="bon">{t('conditionGood')}</MenuItem>
            <MenuItem value="moyen">{t('conditionAverage')}</MenuItem>
            <MenuItem value="inferieur">{t('conditionBelowAverage')}</MenuItem>
            <MenuItem value="pauvre">{t('conditionPoor')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('recentRenovations')}
          placeholder={t('recentRenovationsPlaceholder')}
          value={formData.recentRenovations || ''}
          onChange={(e) => handleFieldChange('recentRenovations', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('requiredRepairs')}
          placeholder={t('requiredRepairsPlaceholder')}
          value={formData.requiredRepairs || ''}
          onChange={(e) => handleFieldChange('requiredRepairs', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('suggestedImprovements')}
          placeholder={t('suggestedImprovementsPlaceholder')}
          value={formData.suggestedImprovements || ''}
          onChange={(e) => handleFieldChange('suggestedImprovements', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderGeneralInfoSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('generalInfo')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={6}
          label={t('generalMandateDescription')}
          placeholder={t('generalMandatePlaceholder')}
          value={formData.generalDescription || ''}
          onChange={(e) => handleFieldChange('generalDescription', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('notesAndObservations')}
          value={formData.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderPropertyDescriptionSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('detailedPropertyDescription')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={6}
          label={t('architecturalDescription')}
          placeholder={t('architecturalDescriptionPlaceholder')}
          value={formData.architecturalDescription || ''}
          onChange={(e) => handleFieldChange('architecturalDescription', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('landDescription')}
          placeholder={t('landDescriptionPlaceholder')}
          value={formData.landDescription || ''}
          onChange={(e) => handleFieldChange('landDescription', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderGenericSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('inDevelopment')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={8}
          label={t('content')}
          placeholder={t('contentPlaceholder')}
          value={formData.content || ''}
          onChange={(e) => handleFieldChange('content', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('notes')}
          value={formData.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('fillFields')}
        </Typography>
        <Button
          variant={formData.completed ? 'outlined' : 'contained'}
          color={formData.completed ? 'success' : 'primary'}
          startIcon={formData.completed ? <CheckCircle /> : <Circle />}
          onClick={handleMarkComplete}
          sx={{ textTransform: 'none' }}
        >
          {formData.completed ? t('sectionCompleted') : t('markComplete')}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {renderSectionForm()}
    </Box>
  );
}
