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
import { CheckCircle, Circle, Save } from '@mui/icons-material';
import { TemplateType } from '../types/evaluation.types';
import { useTranslations } from 'next-intl';
import DirectComparisonForm from './DirectComparisonForm';
import { useOrganizationSettings } from '../hooks/useOrganizationSettings';

interface AppraisalSectionFormProps {
  sectionId: string;
  templateType: TemplateType;
  data: any;
  onChange: (data: any) => void;
  subjectPropertyId?: string | null;
  subjectPropertyType?: string | null;
  reloadTrigger?: number;
  appraisalData?: any;
  allSectionsData?: any;
}

export default function AppraisalSectionForm({
  sectionId,
  templateType,
  data,
  onChange,
  subjectPropertyId,
  subjectPropertyType,
  reloadTrigger,
  appraisalData,
  allSectionsData
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
        case 'fiche_reference':
          return renderReferenceSheetSection();
        case 'general':
          return renderGeneralitiesSection();
        case 'description':
          return renderDescriptionSection();
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

  const renderPresentationSection = () => {
    const { settings, saveSettings } = useOrganizationSettings();
    const [saving, setSaving] = useState(false);

    // Auto-populate from appraisal data and organization settings
    useEffect(() => {
      if (appraisalData && Object.keys(formData).length === 0) {
        const initialData = {
          reportTitle: formData.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE',
          civicAddress: appraisalData.address || '',
          city: appraisalData.city || '',
          fileNumber: formData.fileNumber || '',
          clientName: appraisalData.client_name || '',
          // Load from organization settings
          companyAddress: formData.companyAddress || settings.companyAddress || '',
          companyPhone: formData.companyPhone || settings.companyPhone || '',
          companyWebsite: formData.companyWebsite || settings.companyWebsite || '',
          companyLogoUrl: formData.companyLogoUrl || settings.companyLogoUrl || '',
          propertyPhotoUrl: formData.propertyPhotoUrl || ''
        };
        setFormData(initialData);
        onChange(initialData);
      }
    }, [appraisalData, settings]);

    const handleSaveCompanySettings = async () => {
      setSaving(true);
      const result = await saveSettings({
        companyAddress: formData.companyAddress,
        companyPhone: formData.companyPhone,
        companyWebsite: formData.companyWebsite,
        companyLogoUrl: formData.companyLogoUrl
      });
      setSaving(false);

      if (result.success) {
        alert('Company settings saved! These will be used for all new appraisals.');
      } else {
        alert(`Error saving settings: ${result.error}`);
      }
    };

    return (
      <Grid container spacing={3}>
        {/* Report Title */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, mb: 3 }}>
            {t('reportTitle').toUpperCase()}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE'}
            onChange={(e) => handleFieldChange('reportTitle', e.target.value)}
            placeholder="RAPPORT D'ÉVALUATION IMMOBILIÈRE"
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Civic Address and City - Auto-populated but editable */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Adresse civique"
            value={formData.civicAddress || ''}
            onChange={(e) => handleFieldChange('civicAddress', e.target.value)}
            placeholder="123 Rue Exemple"
            helperText="Auto-rempli depuis les données de l'évaluation"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            size="small"
            label="Ville"
            value={formData.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="Montréal, Québec"
            helperText="Auto-rempli depuis les données de l'évaluation"
          />
        </Grid>

        {/* File Number - Editable */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
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

        {/* Client Name - Auto-populated from appraisal */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={t('clientName')}
            value={formData.clientName || appraisalData?.client_name || ''}
            onChange={(e) => handleFieldChange('clientName', e.target.value)}
            placeholder="Nom du client"
            helperText="Auto-populated from appraisal"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Company Logo */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {t('companyLogo')}
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Save />}
              onClick={handleSaveCompanySettings}
              disabled={saving}
            >
              Save Company Settings
            </Button>
          </Box>
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

        {/* Company Information - Saved to organization */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={t('companyAddress')}
            value={formData.companyAddress || ''}
            onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
            placeholder="123 Rue Exemple, Ville, QC H1H 1H1"
            multiline
            rows={2}
            helperText="Will be saved for all future appraisals"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={t('companyPhone')}
            value={formData.companyPhone || ''}
            onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
            placeholder="(514) 123-4567"
            helperText="Will be saved for all future appraisals"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={t('companyWebsite')}
            value={formData.companyWebsite || ''}
            onChange={(e) => handleFieldChange('companyWebsite', e.target.value)}
            placeholder="www.example.com"
            helperText="Will be saved for all future appraisals"
          />
        </Grid>
      </Grid>
    );
  };

  const renderReferenceSheetSection = () => {
    const tRef = useTranslations('evaluations.sections.referenceSheet');

    // Auto-populate on first load
    useEffect(() => {
      if (appraisalData && Object.keys(formData).length === 0) {
        const initialData = {
          // Purpose and Scope
          purpose: formData.purpose || tRef('purposePlaceholder'),

          // Property Information - Auto-populated
          address: appraisalData.address || '',
          city: appraisalData.city || '',
          fileNumber: formData.fileNumber || '',

          // Cadastral Information
          lotNumber: formData.lotNumber || '',
          cadastre: formData.cadastre || 'Cadastre du Québec',

          // Mandant (Client) Information
          mandantFileNumber: formData.mandantFileNumber || '',
          mandantName: formData.mandantName || '',
          mandantCompany: formData.mandantCompany || '',
          mandantAddress: formData.mandantAddress || '',
          mandantCity: formData.mandantCity || '',
          mandantPhone: formData.mandantPhone || '',
          mandantEmail: formData.mandantEmail || '',

          // Owner Information
          ownerName: formData.ownerName || '',
          ownerPhone: formData.ownerPhone || '',

          // Borrower Information
          borrowerName: formData.borrowerName || appraisalData.client_name || '',
          borrowerPhone: formData.borrowerPhone || '',

          // Conclusion
          currentMarketValue: formData.currentMarketValue || '',
          potentialMarketValue: formData.potentialMarketValue || '',
          valueInWords: formData.valueInWords || '',
          asOfDate: formData.asOfDate || appraisalData.effective_date || new Date().toISOString().split('T')[0]
        };
        setFormData(initialData);
        onChange(initialData);
      }
    }, [appraisalData]);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
            RAPPORT D'ÉVALUATION IMMOBILIÈRE
          </Typography>
        </Grid>

        {/* Purpose and Scope */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tRef('purposeAndScope')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            value={formData.purpose || ''}
            onChange={(e) => handleFieldChange('purpose', e.target.value)}
            placeholder={tRef('purposePlaceholder')}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Property Address - Display from presentation section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tRef('address')}
          </Typography>
          <Typography variant="body1">
            {allSectionsData?.presentation?.civicAddress || appraisalData?.address || 'Adresse non spécifiée'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {allSectionsData?.presentation?.city || appraisalData?.city || ''}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {tRef('autoPopulatedInfo')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label={tRef('fileNumber')}
            value={formData.fileNumber || ''}
            onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
          />
        </Grid>

        {/* Cadastral Designation */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tRef('cadastralDesignation')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('lotNumber')}
            value={formData.lotNumber || ''}
            onChange={(e) => handleFieldChange('lotNumber', e.target.value)}
            placeholder="3 492 120"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('cadastre')}
            value={formData.cadastre || ''}
            onChange={(e) => handleFieldChange('cadastre', e.target.value)}
            placeholder="Cadastre du Québec"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {tRef('mandant')}
          </Typography>
        </Grid>

        {/* Mandant Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantFileNumber')}
            value={formData.mandantFileNumber || ''}
            onChange={(e) => handleFieldChange('mandantFileNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantName')}
            value={formData.mandantName || ''}
            onChange={(e) => handleFieldChange('mandantName', e.target.value)}
            placeholder="Nationwide Appraisal Services"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantCompany')}
            value={formData.mandantCompany || ''}
            onChange={(e) => handleFieldChange('mandantCompany', e.target.value)}
            placeholder="Mouvement Desjardins"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantAddress')}
            value={formData.mandantAddress || ''}
            onChange={(e) => handleFieldChange('mandantAddress', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantCity')}
            value={formData.mandantCity || ''}
            onChange={(e) => handleFieldChange('mandantCity', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantPhone')}
            value={formData.mandantPhone || ''}
            onChange={(e) => handleFieldChange('mandantPhone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label={tRef('mandantEmail')}
            type="email"
            value={formData.mandantEmail || ''}
            onChange={(e) => handleFieldChange('mandantEmail', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {tRef('owner')}
          </Typography>
        </Grid>

        {/* Owner Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('ownerName')}
            value={formData.ownerName || ''}
            onChange={(e) => handleFieldChange('ownerName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('ownerPhone')}
            value={formData.ownerPhone || ''}
            onChange={(e) => handleFieldChange('ownerPhone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {tRef('borrower')}
          </Typography>
        </Grid>

        {/* Borrower Information - Auto-populated from client name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('borrowerName')}
            value={formData.borrowerName || ''}
            onChange={(e) => handleFieldChange('borrowerName', e.target.value)}
            helperText={appraisalData?.client_name ? tRef('autoPopulatedInfo') : ''}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('borrowerPhone')}
            value={formData.borrowerPhone || ''}
            onChange={(e) => handleFieldChange('borrowerPhone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {tRef('conclusion')}
          </Typography>
        </Grid>

        {/* Conclusion - Market Values */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tRef('marketValue')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('currentValue')}
            type="number"
            value={formData.currentMarketValue || ''}
            onChange={(e) => handleFieldChange('currentMarketValue', e.target.value)}
            placeholder="0"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('potentialValue')}
            type="number"
            value={formData.potentialMarketValue || ''}
            onChange={(e) => handleFieldChange('potentialMarketValue', e.target.value)}
            placeholder="0"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={tRef('valueInWords')}
            value={formData.valueInWords || ''}
            onChange={(e) => handleFieldChange('valueInWords', e.target.value)}
            placeholder={tRef('valueInWordsPlaceholder')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tRef('asOfDate')}
            type="date"
            value={formData.asOfDate || ''}
            onChange={(e) => handleFieldChange('asOfDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={appraisalData?.effective_date ? tRef('autoPopulatedInfo') : ''}
          />
        </Grid>

        {/* Legal Note */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {tRef('legalNote')}
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
            {tRef('legalNoteText')}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderGeneralitiesSection = () => {
    const tGen = useTranslations('evaluations.sections.generalSection');

    return (
      <Grid container spacing={3}>
        {/* GÉNÉRALITÉS Header */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            {tGen('generalities')}
          </Typography>
        </Grid>

        {/* Evaluation Purpose */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={tGen('evaluationPurpose')}
            value={formData.evaluationPurpose || ''}
            onChange={(e) => handleFieldChange('evaluationPurpose', e.target.value)}
            placeholder={tGen('evaluationPurposePlaceholder')}
          />
        </Grid>

        {/* Property Right Evaluated */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={tGen('propertyRightEvaluated')}
            value={formData.propertyRightEvaluated || ''}
            onChange={(e) => handleFieldChange('propertyRightEvaluated', e.target.value)}
            placeholder={tGen('propertyRightPlaceholder')}
          />
        </Grid>

        {/* PROPERTY IDENTIFICATION */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            {tGen('propertyIdentification')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1">
            {allSectionsData?.presentation?.civicAddress || appraisalData?.address || 'Adresse non spécifiée'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1">
            {allSectionsData?.presentation?.city || appraisalData?.city || ''}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tGen('lotNumber')}
            value={formData.lotNumber || ''}
            onChange={(e) => handleFieldChange('lotNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tGen('cadastre')}
            value={formData.cadastre || 'Cadastre du Québec'}
            onChange={(e) => handleFieldChange('cadastre', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tGen('ownerName')}
            value={formData.ownerName || ''}
            onChange={(e) => handleFieldChange('ownerName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tGen('ownerPhone')}
            value={formData.ownerPhone || ''}
            onChange={(e) => handleFieldChange('ownerPhone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tGen('summaryDescription')}
            value={formData.summaryDescription || ''}
            onChange={(e) => handleFieldChange('summaryDescription', e.target.value)}
            placeholder={tGen('summaryDescriptionPlaceholder')}
          />
        </Grid>

        {/* Construction Status - Checkboxes */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tGen('constructionStatus')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.constructionStatusRenovation || false}
                onChange={(e) => handleFieldChange('constructionStatusRenovation', e.target.checked)}
              />
              {' '}{tGen('underRenovation')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.constructionStatusToBeBuilt || false}
                onChange={(e) => handleFieldChange('constructionStatusToBeBuilt', e.target.checked)}
              />
              {' '}{tGen('toBeBuilt')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.constructionStatusExisting || false}
                onChange={(e) => handleFieldChange('constructionStatusExisting', e.target.checked)}
              />
              {' '}{tGen('existing')}
            </label>
          </Box>
        </Grid>

        {/* SECTOR */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            {tGen('sector')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tGen('sectorLabel')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('trend')}
            value={formData.sectorTrend || ''}
            onChange={(e) => handleFieldChange('sectorTrend', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('stable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label={tGen('age')}
            value={formData.sectorAge || ''}
            onChange={(e) => handleFieldChange('sectorAge', e.target.value)}
            placeholder="25 à 80 ans"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('homogeneity')}
            value={formData.sectorHomogeneity || ''}
            onChange={(e) => handleFieldChange('sectorHomogeneity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="good">{tGen('good')}</option>
            <option value="average">{tGen('average')}</option>
            <option value="poor">{tGen('poor')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('accessibility')}
            value={formData.sectorAccessibility || ''}
            onChange={(e) => handleFieldChange('sectorAccessibility', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="good">{tGen('good')}</option>
            <option value="average">{tGen('average')}</option>
            <option value="poor">{tGen('poor')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('subjectConformity')}
            value={formData.subjectConformity || ''}
            onChange={(e) => handleFieldChange('subjectConformity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="good">{tGen('good')}</option>
            <option value="average">{tGen('average')}</option>
            <option value="poor">{tGen('poor')}</option>
          </TextField>
        </Grid>

        {/* Neighborhood */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('neighborhood')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={tGen('dominantPropertyType')}
            value={formData.dominantPropertyType || ''}
            onChange={(e) => handleFieldChange('dominantPropertyType', e.target.value)}
            placeholder="Semi-commerciale"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label={tGen('favorableFactors')}
            value={formData.favorableFactors || ''}
            onChange={(e) => handleFieldChange('favorableFactors', e.target.value)}
            placeholder={tGen('favorableFactorsPlaceholder')}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label={tGen('unfavorableFactors')}
            value={formData.unfavorableFactors || ''}
            onChange={(e) => handleFieldChange('unfavorableFactors', e.target.value)}
            placeholder={tGen('unfavorableFactorsPlaceholder')}
          />
        </Grid>

        {/* Proximity to Services */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('proximityServices')}
          </Typography>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('convenience')}
            value={formData.convenienceProximity || ''}
            onChange={(e) => handleFieldChange('convenienceProximity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="nearby">{tGen('nearby')}</option>
            <option value="1-2km">{tGen('oneToTwoKm')}</option>
            <option value="2-3km">{tGen('twoToThreeKm')}</option>
            <option value="3km+">{tGen('threePlusKm')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('supermarket')}
            value={formData.supermarketProximity || ''}
            onChange={(e) => handleFieldChange('supermarketProximity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="nearby">{tGen('nearby')}</option>
            <option value="1-2km">{tGen('oneToTwoKm')}</option>
            <option value="2-3km">{tGen('twoToThreeKm')}</option>
            <option value="3km+">{tGen('threePlusKm')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('shoppingCenter')}
            value={formData.shoppingCenterProximity || ''}
            onChange={(e) => handleFieldChange('shoppingCenterProximity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="nearby">{tGen('nearby')}</option>
            <option value="1-2km">{tGen('oneToTwoKm')}</option>
            <option value="2-3km">{tGen('twoToThreeKm')}</option>
            <option value="3km+">{tGen('threePlusKm')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('school')}
            value={formData.schoolProximity || ''}
            onChange={(e) => handleFieldChange('schoolProximity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="nearby">{tGen('nearby')}</option>
            <option value="1-2km">{tGen('oneToTwoKm')}</option>
            <option value="2-3km">{tGen('twoToThreeKm')}</option>
            <option value="3km+">{tGen('threePlusKm')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('transport')}
            value={formData.transportProximity || ''}
            onChange={(e) => handleFieldChange('transportProximity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="nearby">{tGen('nearby')}</option>
            <option value="1-2km">{tGen('oneToTwoKm')}</option>
            <option value="2-3km">{tGen('twoToThreeKm')}</option>
            <option value="3km+">{tGen('threePlusKm')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('park')}
            value={formData.parkProximity || ''}
            onChange={(e) => handleFieldChange('parkProximity', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="nearby">{tGen('nearby')}</option>
            <option value="1-2km">{tGen('oneToTwoKm')}</option>
            <option value="2-3km">{tGen('twoToThreeKm')}</option>
            <option value="3km+">{tGen('threePlusKm')}</option>
          </TextField>
        </Grid>

        {/* Sector Comments */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={4}
            label={tGen('comments')}
            value={formData.sectorComments || ''}
            onChange={(e) => handleFieldChange('sectorComments', e.target.value)}
            placeholder={tGen('sectorComments')}
          />
        </Grid>

        {/* LOCAL REAL ESTATE MARKET */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            {tGen('localRealEstateMarket')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('propertiesForSaleOrRent')}
            value={formData.propertiesForSaleOrRent || ''}
            onChange={(e) => handleFieldChange('propertiesForSaleOrRent', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="none">{tGen('none')}</option>
            <option value="few">{tGen('few')}</option>
            <option value="many">{tGen('many')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('saleDelay')}
            value={formData.saleDelay || ''}
            onChange={(e) => handleFieldChange('saleDelay', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="0-4">{tGen('zeroToFourMonths')}</option>
            <option value="4-8">{tGen('fourToEightMonths')}</option>
            <option value="8+">{tGen('eightPlusMonths')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('supplyAndDemand')}
            value={formData.supplyAndDemand || ''}
            onChange={(e) => handleFieldChange('supplyAndDemand', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="balanced">{tGen('balanced')}</option>
            <option value="imbalanced">{tGen('imbalanced')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('marketType')}
            value={formData.marketType || ''}
            onChange={(e) => handleFieldChange('marketType', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="buyer">{tGen('buyer')}</option>
            <option value="seller">{tGen('seller')}</option>
          </TextField>
        </Grid>

        {/* Price Variation */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('priceVariation')}
          </Typography>
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('land')}
            value={formData.landPriceVariation || ''}
            onChange={(e) => handleFieldChange('landPriceVariation', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('stable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('rent')}
            value={formData.rentPriceVariation || ''}
            onChange={(e) => handleFieldChange('rentPriceVariation', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('stable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('constructionCost')}
            value={formData.constructionCostVariation || ''}
            onChange={(e) => handleFieldChange('constructionCostVariation', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('stable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('interestRates')}
            value={formData.interestRatesVariation || ''}
            onChange={(e) => handleFieldChange('interestRatesVariation', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('ratherStable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        {/* Anticipated Price Trend */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('anticipatedPriceTrend')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('shortTerm')}
            value={formData.shortTermTrend || ''}
            onChange={(e) => handleFieldChange('shortTermTrend', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('stable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            select
            label={tGen('mediumTerm')}
            value={formData.mediumTermTrend || ''}
            onChange={(e) => handleFieldChange('mediumTermTrend', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="stable">{tGen('ratherStable')}</option>
            <option value="increasing">{tGen('increasing')}</option>
            <option value="decreasing">{tGen('decreasing')}</option>
          </TextField>
        </Grid>

        {/* Market Comments */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tGen('comments')}
            value={formData.marketComments || ''}
            onChange={(e) => handleFieldChange('marketComments', e.target.value)}
            placeholder={tGen('marketComments')}
          />
        </Grid>

        {/* MUNICIPAL DATA */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            {tGen('municipalData')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tGen('taxRoll')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label={tGen('matriculeNumber')}
            value={formData.matriculeNumber || ''}
            onChange={(e) => handleFieldChange('matriculeNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label={tGen('rollYear')}
            value={formData.rollYear || ''}
            onChange={(e) => handleFieldChange('rollYear', e.target.value)}
            placeholder="2023-2024-2025"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label={tGen('marketDate')}
            type="date"
            value={formData.marketDate || ''}
            onChange={(e) => handleFieldChange('marketDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label={tGen('median')}
            value={formData.median || ''}
            onChange={(e) => handleFieldChange('median', e.target.value)}
            placeholder="100%"
          />
        </Grid>

        {/* Evaluation */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('evaluation')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tGen('landValue')}
            value={formData.evaluationLandValue || ''}
            onChange={(e) => handleFieldChange('evaluationLandValue', e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tGen('buildingValue')}
            value={formData.evaluationBuildingValue || ''}
            onChange={(e) => handleFieldChange('evaluationBuildingValue', e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tGen('totalValue')}
            value={formData.evaluationTotalValue || ''}
            onChange={(e) => handleFieldChange('evaluationTotalValue', e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        {/* Taxes */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('taxes')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tGen('municipalTax')}
            value={formData.municipalTax || ''}
            onChange={(e) => handleFieldChange('municipalTax', e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tGen('schoolTax')}
            value={formData.schoolTax || ''}
            onChange={(e) => handleFieldChange('schoolTax', e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tGen('totalTax')}
            value={formData.totalTax || ''}
            onChange={(e) => handleFieldChange('totalTax', e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        {/* Zoning */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('zoning')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{tGen('conformUse')}:</Typography>
            <label>
              <input
                type="radio"
                name="conformUse"
                value="yes"
                checked={formData.conformUse === 'yes'}
                onChange={(e) => handleFieldChange('conformUse', e.target.value)}
              />
              {' '}{tGen('yes')}
            </label>
            <label>
              <input
                type="radio"
                name="conformUse"
                value="no"
                checked={formData.conformUse === 'no'}
                onChange={(e) => handleFieldChange('conformUse', e.target.value)}
              />
              {' '}{tGen('no')}
            </label>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {tGen('ifNoExplain')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={4}
            label={tGen('comments')}
            value={formData.zoningComments || ''}
            onChange={(e) => handleFieldChange('zoningComments', e.target.value)}
            placeholder={tGen('zoningComments')}
          />
        </Grid>

        {/* SERVICES */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('services')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceAqueduct || false}
                onChange={(e) => handleFieldChange('serviceAqueduct', e.target.checked)}
              />
              {' '}{tGen('aqueduct')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceStormSewer || false}
                onChange={(e) => handleFieldChange('serviceStormSewer', e.target.checked)}
              />
              {' '}{tGen('stormSewer')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceSanitarySewer || false}
                onChange={(e) => handleFieldChange('serviceSanitarySewer', e.target.checked)}
              />
              {' '}{tGen('sanitarySewer')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceWell || false}
                onChange={(e) => handleFieldChange('serviceWell', e.target.checked)}
              />
              {' '}{tGen('well')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceSepticTank || false}
                onChange={(e) => handleFieldChange('serviceSepticTank', e.target.checked)}
              />
              {' '}{tGen('septicTank')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceLighting || false}
                onChange={(e) => handleFieldChange('serviceLighting', e.target.checked)}
              />
              {' '}{tGen('lighting')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceNaturalGas || false}
                onChange={(e) => handleFieldChange('serviceNaturalGas', e.target.checked)}
              />
              {' '}{tGen('naturalGas')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceFireHydrants || false}
                onChange={(e) => handleFieldChange('serviceFireHydrants', e.target.checked)}
              />
              {' '}{tGen('fireHydrants')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceDitch || false}
                onChange={(e) => handleFieldChange('serviceDitch', e.target.checked)}
              />
              {' '}{tGen('ditch')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.serviceDrainField || false}
                onChange={(e) => handleFieldChange('serviceDrainField', e.target.checked)}
              />
              {' '}{tGen('drainField')}
            </label>
          </Box>
        </Grid>

        {/* STREETS */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tGen('streets')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.streetPaving || false}
                onChange={(e) => handleFieldChange('streetPaving', e.target.checked)}
              />
              {' '}{tGen('paving')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.streetSidewalk || false}
                onChange={(e) => handleFieldChange('streetSidewalk', e.target.checked)}
              />
              {' '}{tGen('sidewalk')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.streetCurb || false}
                onChange={(e) => handleFieldChange('streetCurb', e.target.checked)}
              />
              {' '}{tGen('curb')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.streetAlley || false}
                onChange={(e) => handleFieldChange('streetAlley', e.target.checked)}
              />
              {' '}{tGen('alley')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.streetBikePath || false}
                onChange={(e) => handleFieldChange('streetBikePath', e.target.checked)}
              />
              {' '}{tGen('bikePath')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.streetOther || false}
                onChange={(e) => handleFieldChange('streetOther', e.target.checked)}
              />
              {' '}{tGen('other')}
            </label>
          </Box>
        </Grid>

        {/* ADDITIONAL COMMENTS */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            {tGen('additionalComments')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={5}
            value={formData.additionalComments || ''}
            onChange={(e) => handleFieldChange('additionalComments', e.target.value)}
            placeholder={tGen('additionalCommentsPlaceholder')}
          />
        </Grid>
      </Grid>
    );
  };

  const renderDescriptionSection = () => {
    const tDesc = useTranslations('evaluations.sections.descriptionSection');

    return (
      <Grid container spacing={3}>
        {/* LAND SUMMARY DESCRIPTION */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            {tDesc('landSummary')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('topography')}
            value={formData.topography || ''}
            onChange={(e) => handleFieldChange('topography', e.target.value)}
            placeholder={tDesc('flatRelationToNeighboring')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            select
            label={tDesc('floodRisk')}
            value={formData.floodRisk || ''}
            onChange={(e) => handleFieldChange('floodRisk', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="none">{tDesc('none')}</option>
            <option value="low">{tDesc('low')}</option>
            <option value="medium">{tDesc('medium')}</option>
            <option value="high">{tDesc('high')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('contaminationRisk')}
            value={formData.contaminationRisk || ''}
            onChange={(e) => handleFieldChange('contaminationRisk', e.target.value)}
            placeholder={tDesc('imperceptibleUnknownHistory')}
          />
        </Grid>

        {/* Location Certificate */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('locationCertificate')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{tDesc('consulted')}:</Typography>
            <label>
              <input
                type="checkbox"
                checked={formData.certificateConsulted || false}
                onChange={(e) => handleFieldChange('certificateConsulted', e.target.checked)}
              />
            </label>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{tDesc('updateRecommended')}:</Typography>
            <label>
              <input
                type="checkbox"
                checked={formData.certificateUpdateRecommended || false}
                onChange={(e) => handleFieldChange('certificateUpdateRecommended', e.target.checked)}
              />
            </label>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('certificateComments')}
            value={formData.certificateComments || ''}
            onChange={(e) => handleFieldChange('certificateComments', e.target.value)}
            placeholder={tDesc('certificateDatePlaceholder')}
          />
        </Grid>

        {/* Dimensions */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('dimensions')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tDesc('frontage')}
            value={formData.lotFrontage || ''}
            onChange={(e) => handleFieldChange('lotFrontage', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tDesc('depth')}
            value={formData.lotDepth || ''}
            onChange={(e) => handleFieldChange('lotDepth', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${tDesc('area')} (pi²)`}
            value={formData.lotArea || ''}
            onChange={(e) => handleFieldChange('lotArea', e.target.value)}
          />
        </Grid>

        {/* Accessibility */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('accessibility')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.accessibilityShared || false}
                onChange={(e) => handleFieldChange('accessibilityShared', e.target.checked)}
              />
              {' '}{tDesc('shared')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.accessibilityPrivate || false}
                onChange={(e) => handleFieldChange('accessibilityPrivate', e.target.checked)}
              />
              {' '}{tDesc('private')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.accessibilityPublic || false}
                onChange={(e) => handleFieldChange('accessibilityPublic', e.target.checked)}
              />
              {' '}{tDesc('public')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.accessibilityOther || false}
                onChange={(e) => handleFieldChange('accessibilityOther', e.target.checked)}
              />
              {' '}{tDesc('other')}
            </label>
          </Box>
        </Grid>

        {/* Highest and Best Use */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('highestBestUse')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <label>
              <input
                type="radio"
                name="highestBestUse"
                value="yes"
                checked={formData.highestBestUse === 'yes'}
                onChange={(e) => handleFieldChange('highestBestUse', e.target.value)}
              />
              {' '}{tDesc('yes')}
            </label>
            <label>
              <input
                type="radio"
                name="highestBestUse"
                value="no"
                checked={formData.highestBestUse === 'no'}
                onChange={(e) => handleFieldChange('highestBestUse', e.target.value)}
              />
              {' '}{tDesc('no')}
            </label>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {tDesc('ifNoComment')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
            {tDesc('highestBestUseDefinition')}
          </Typography>
        </Grid>

        {/* EXTERIOR DEVELOPMENT / PARKING */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {tDesc('exteriorDevelopment')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {tDesc('dependencies')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tDesc('parking')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              label={tDesc('interior')}
              type="number"
              value={formData.parkingInterior || ''}
              onChange={(e) => handleFieldChange('parkingInterior', e.target.value)}
              sx={{ width: '120px' }}
            />
            <TextField
              size="small"
              label={tDesc('exterior')}
              type="number"
              value={formData.parkingExterior || ''}
              onChange={(e) => handleFieldChange('parkingExterior', e.target.value)}
              sx={{ width: '120px' }}
            />
            <label>
              <input
                type="checkbox"
                checked={formData.parkingNone || false}
                onChange={(e) => handleFieldChange('parkingNone', e.target.checked)}
              />
              {' '}{tDesc('noneParking')}
            </label>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label={tDesc('dependenciesDescription')}
            value={formData.dependenciesDescription || ''}
            onChange={(e) => handleFieldChange('dependenciesDescription', e.target.value)}
            placeholder={tDesc('dependenciesPlaceholder')}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            value={formData.exteriorAmenities || ''}
            onChange={(e) => handleFieldChange('exteriorAmenities', e.target.value)}
            placeholder={tDesc('exteriorAmenities')}
          />
        </Grid>

        {/* BUILDING SUMMARY DESCRIPTION */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            {tDesc('buildingSummary')}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tDesc('generalities')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('buildingUse')}
            value={formData.buildingUse || ''}
            onChange={(e) => handleFieldChange('buildingUse', e.target.value)}
            placeholder={tDesc('residentialCommercial')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('propertyType')}
            value={formData.propertyType || ''}
            onChange={(e) => handleFieldChange('propertyType', e.target.value)}
            placeholder={tDesc('semiCommercial')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('groundDimensions')}
            value={formData.groundDimensions || ''}
            onChange={(e) => handleFieldChange('groundDimensions', e.target.value)}
            placeholder="IRR x IRR"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            select
            label={tDesc('constructionQuality')}
            value={formData.constructionQuality || ''}
            onChange={(e) => handleFieldChange('constructionQuality', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="standard">{tDesc('standard')}</option>
            <option value="superior">{tDesc('superior')}</option>
            <option value="economical">{tDesc('economical')}</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tDesc('numberOfUnits')}
            value={formData.numberOfUnits || ''}
            onChange={(e) => handleFieldChange('numberOfUnits', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tDesc('constructionYear')}
            value={formData.constructionYear || ''}
            onChange={(e) => handleFieldChange('constructionYear', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('apparentAge')}
            value={formData.apparentAgeEconomicLife || ''}
            onChange={(e) => handleFieldChange('apparentAgeEconomicLife', e.target.value)}
            placeholder="95 ans / 28 ans"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={tDesc('numberOfFloors')}
            value={formData.numberOfFloors || ''}
            onChange={(e) => handleFieldChange('numberOfFloors', e.target.value)}
          />
        </Grid>

        {/* Space Utilization */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('spaceUtilization')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${tDesc('groundFloorArea')} (${tDesc('squareFeet')})`}
            value={formData.groundFloorArea || ''}
            onChange={(e) => handleFieldChange('groundFloorArea', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${tDesc('basementArea')} (${tDesc('squareFeet')})`}
            value={formData.basementArea || ''}
            onChange={(e) => handleFieldChange('basementArea', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${tDesc('livingArea')} (${tDesc('squareFeet')})`}
            value={formData.livingAreaExcludingBasement || ''}
            onChange={(e) => handleFieldChange('livingAreaExcludingBasement', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('basementFinishedPercent')}
            value={formData.basementFinishedPercent || ''}
            onChange={(e) => handleFieldChange('basementFinishedPercent', e.target.value)}
            placeholder="0%"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('areaSource')}
            value={formData.areaSource || ''}
            onChange={(e) => handleFieldChange('areaSource', e.target.value)}
            placeholder={tDesc('locationCertificateAndMeasured')}
          />
        </Grid>

        {/* Components Table */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {tDesc('components')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {tDesc('observationsGeneralCondition')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('foundation')}
            value={formData.foundation || ''}
            onChange={(e) => handleFieldChange('foundation', e.target.value)}
            placeholder={tDesc('stoneAndMortar')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={8}
            label={tDesc('generalConditionNotes')}
            value={formData.generalConditionNotes || ''}
            onChange={(e) => handleFieldChange('generalConditionNotes', e.target.value)}
            placeholder={tDesc('generalConditionPlaceholder')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('frame')}
            value={formData.frame || ''}
            onChange={(e) => handleFieldChange('frame', e.target.value)}
            placeholder={tDesc('woodFrame')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('exteriorWalls')}
            value={formData.exteriorWalls || ''}
            onChange={(e) => handleFieldChange('exteriorWalls', e.target.value)}
            placeholder={tDesc('brickVinylAluminum')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('insulation')}
            value={formData.insulation || ''}
            onChange={(e) => handleFieldChange('insulation', e.target.value)}
            placeholder={tDesc('mineralWool')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('roofing')}
            value={formData.roofing || ''}
            onChange={(e) => handleFieldChange('roofing', e.target.value)}
            placeholder={tDesc('asphaltShingles')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('soffit')}
            value={formData.soffit || ''}
            onChange={(e) => handleFieldChange('soffit', e.target.value)}
            placeholder={tDesc('ventilatedAluminum')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('windows')}
            value={formData.windows || ''}
            onChange={(e) => handleFieldChange('windows', e.target.value)}
            placeholder={tDesc('slidingFixed')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('doors')}
            value={formData.doors || ''}
            onChange={(e) => handleFieldChange('doors', e.target.value)}
            placeholder={tDesc('aluminumSteelGlass')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('plumbing')}
            value={formData.plumbing || ''}
            onChange={(e) => handleFieldChange('plumbing', e.target.value)}
            placeholder={tDesc('standardWaterHeater')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('electricity')}
            value={formData.electricity || ''}
            onChange={(e) => handleFieldChange('electricity', e.target.value)}
            placeholder={tDesc('amperesCircuitBreaker')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('heating')}
            value={formData.heating || ''}
            onChange={(e) => handleFieldChange('heating', e.target.value)}
            placeholder={tDesc('biEnergy')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('cabinets')}
            value={formData.cabinets || ''}
            onChange={(e) => handleFieldChange('cabinets', e.target.value)}
            placeholder={tDesc('melamineLaminate')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('builtInElements')}
            value={formData.builtInElements || ''}
            onChange={(e) => handleFieldChange('builtInElements', e.target.value)}
            placeholder={tDesc('none')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('numberOfBathrooms')}
            value={formData.numberOfBathrooms || ''}
            onChange={(e) => handleFieldChange('numberOfBathrooms', e.target.value)}
            placeholder="(1) x 4 appareils"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('fireplace')}
            value={formData.fireplace || ''}
            onChange={(e) => handleFieldChange('fireplace', e.target.value)}
            placeholder={tDesc('none')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('airConditioning')}
            value={formData.airConditioning || ''}
            onChange={(e) => handleFieldChange('airConditioning', e.target.value)}
            placeholder={tDesc('bathroomFan')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={tDesc('specialEquipment')}
            value={formData.specialEquipment || ''}
            onChange={(e) => handleFieldChange('specialEquipment', e.target.value)}
            placeholder={tDesc('centralVacuumAlarm')}
          />
        </Grid>

        {/* INTERIOR LAYOUT AND FINISHES */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            {tDesc('interiorLayout')}
          </Typography>
        </Grid>

        {/* Basement */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tDesc('basement')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('roomDescription')}
            value={formData.basementRoomDescription || ''}
            onChange={(e) => handleFieldChange('basementRoomDescription', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('walls')}
            value={formData.basementWalls || ''}
            onChange={(e) => handleFieldChange('basementWalls', e.target.value)}
            placeholder={tDesc('drywall')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('ceilings')}
            value={formData.basementCeilings || ''}
            onChange={(e) => handleFieldChange('basementCeilings', e.target.value)}
            placeholder={tDesc('drywall')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('floors')}
            value={formData.basementFloors || ''}
            onChange={(e) => handleFieldChange('basementFloors', e.target.value)}
            placeholder={tDesc('vinylCeramic')}
          />
        </Grid>

        {/* Ground Floor */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('groundFloor')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('roomDescription')}
            value={formData.groundFloorRoomDescription || ''}
            onChange={(e) => handleFieldChange('groundFloorRoomDescription', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('walls')}
            value={formData.groundFloorWalls || ''}
            onChange={(e) => handleFieldChange('groundFloorWalls', e.target.value)}
            placeholder={tDesc('drywall')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('ceilings')}
            value={formData.groundFloorCeilings || ''}
            onChange={(e) => handleFieldChange('groundFloorCeilings', e.target.value)}
            placeholder={tDesc('drywall')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('floors')}
            value={formData.groundFloorFloors || ''}
            onChange={(e) => handleFieldChange('groundFloorFloors', e.target.value)}
            placeholder={tDesc('vinylCeramic')}
          />
        </Grid>

        {/* Typical Floor */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
            {tDesc('typicalFloor')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('roomDescription')}
            value={formData.typicalFloorRoomDescription || ''}
            onChange={(e) => handleFieldChange('typicalFloorRoomDescription', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('walls')}
            value={formData.typicalFloorWalls || ''}
            onChange={(e) => handleFieldChange('typicalFloorWalls', e.target.value)}
            placeholder={tDesc('drywall')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('ceilings')}
            value={formData.typicalFloorCeilings || ''}
            onChange={(e) => handleFieldChange('typicalFloorCeilings', e.target.value)}
            placeholder={tDesc('drywall')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label={tDesc('floors')}
            value={formData.typicalFloorFloors || ''}
            onChange={(e) => handleFieldChange('typicalFloorFloors', e.target.value)}
            placeholder={tDesc('laminateFlooring')}
          />
        </Grid>
      </Grid>
    );
  };

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
