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
  subjectPropertyId?: string | null;
  subjectPropertyType?: string | null;
  reloadTrigger?: number;
}

export default function AppraisalSectionForm({
  sectionId,
  templateType,
  data,
  onChange,
  subjectPropertyId,
  subjectPropertyType,
  reloadTrigger
}: AppraisalSectionFormProps) {
  const t = useTranslations('evaluations.sections');
  const [formData, setFormData] = useState(data);

  console.log('🔍 AppraisalSectionForm - sectionId:', sectionId);
  console.log('🔍 AppraisalSectionForm - subjectPropertyId:', subjectPropertyId);

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
          return <DirectComparisonForm data={formData} onChange={onChange} subjectPropertyId={subjectPropertyId} subjectPropertyType={subjectPropertyType || undefined} reloadTrigger={reloadTrigger} />;
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
          return <DirectComparisonForm data={formData} onChange={onChange} subjectPropertyId={subjectPropertyId} subjectPropertyType={subjectPropertyType || undefined} reloadTrigger={reloadTrigger} />;
        default:
          return renderGenericSection();
      }
    }

    // Custom Sections
    if (templateType === 'CUSTOM') {
      switch (sectionId) {
        case 'presentation':
          return renderPresentationSection();
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

  const renderPresentationSection = () => (
    <Grid container spacing={3}>
      {/* Report Title */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, mb: 3 }}>
          {t('reportTitle').toUpperCase()}
        </Typography>
        <TextField
          fullWidth
          value={formData.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE'}
          onChange={(e) => handleFieldChange('reportTitle', e.target.value)}
          placeholder="RAPPORT D'ÉVALUATION IMMOBILIÈRE"
          sx={{ mb: 3 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      {/* Civic Address and City */}
      <Grid item xs={12}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Adresse civique et ville
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.civicAddress || 'Adresse non spécifiée'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.city || 'Ville non spécifiée'}
        </Typography>
      </Grid>

      {/* File Number */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('fileNumber')}
          value={formData.fileNumber || ''}
          onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
          placeholder="XXXX-XXXX"
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      {/* Property Photo */}
      <Grid item xs={12}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          {t('propertyPhoto')}
        </Typography>
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
          {formData.propertyPhotoUrl ? (
            <Box>
              <Box component="img" src={formData.propertyPhotoUrl} alt="Property" sx={{ maxWidth: '100%', maxHeight: 300, borderRadius: 2, mb: 2 }} />
              <Button variant="outlined" size="small" onClick={() => handleFieldChange('propertyPhotoUrl', '')}>
                {t('changePhoto')}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Photo placeholder - Upload feature coming soon
              </Typography>
              <Button variant="contained" size="small" disabled>
                {t('uploadPhoto')}
              </Button>
            </Box>
          )}
        </Box>
      </Grid>

      {/* Client Name */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t('clientName')}
          value={formData.clientName || ''}
          onChange={(e) => handleFieldChange('clientName', e.target.value)}
          placeholder="Nom du client"
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      {/* Company Logo */}
      <Grid item xs={12}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          {t('companyLogo')}
        </Typography>
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
          {formData.companyLogoUrl ? (
            <Box>
              <Box component="img" src={formData.companyLogoUrl} alt="Company Logo" sx={{ maxWidth: '100%', maxHeight: 150, borderRadius: 2, mb: 2 }} />
              <Button variant="outlined" size="small" onClick={() => handleFieldChange('companyLogoUrl', '')}>
                {t('changeLogo')}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Logo placeholder - Upload feature coming soon
              </Typography>
              <Button variant="contained" size="small" disabled>
                {t('uploadLogo')}
              </Button>
            </Box>
          )}
        </Box>
      </Grid>

      {/* Company Information */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t('companyAddress')}
          value={formData.companyAddress || ''}
          onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
          placeholder="123 Rue Exemple, Ville, QC H1H 1H1"
          multiline
          rows={2}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('companyPhone')}
          value={formData.companyPhone || ''}
          onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
          placeholder="(514) 123-4567"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('companyWebsite')}
          value={formData.companyWebsite || ''}
          onChange={(e) => handleFieldChange('companyWebsite', e.target.value)}
          placeholder="www.example.com"
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
