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
}

export default function AppraisalSectionForm({
  sectionId,
  templateType,
  data,
  onChange,
  subjectPropertyId,
  subjectPropertyType,
  reloadTrigger,
  appraisalData
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
            value={formData.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE'}
            onChange={(e) => handleFieldChange('reportTitle', e.target.value)}
            placeholder="RAPPORT D'ÉVALUATION IMMOBILIÈRE"
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Civic Address and City - Auto-populated from appraisal */}
        <Grid item xs={12}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            Adresse civique et ville
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appraisalData?.address || formData.civicAddress || 'Adresse non spécifiée'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appraisalData?.city || formData.city || 'Ville non spécifiée'}
          </Typography>
        </Grid>

        {/* File Number - Editable */}
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

        {/* Client Name - Auto-populated from appraisal */}
        <Grid item xs={12}>
          <TextField
            fullWidth
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
            value={formData.purpose || ''}
            onChange={(e) => handleFieldChange('purpose', e.target.value)}
            placeholder={tRef('purposePlaceholder')}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Property Address - Auto-populated */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {tRef('address')}
          </Typography>
          <TextField
            fullWidth
            value={formData.address || ''}
            InputProps={{ readOnly: true }}
            helperText={tRef('autoPopulatedInfo')}
            sx={{ bgcolor: 'grey.50' }}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label={tRef('city')}
            value={formData.city || ''}
            InputProps={{ readOnly: true }}
            helperText={tRef('autoPopulatedInfo')}
            sx={{ bgcolor: 'grey.50' }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
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
            label={tRef('lotNumber')}
            value={formData.lotNumber || ''}
            onChange={(e) => handleFieldChange('lotNumber', e.target.value)}
            placeholder="3 492 120"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
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
            label={tRef('mandantFileNumber')}
            value={formData.mandantFileNumber || ''}
            onChange={(e) => handleFieldChange('mandantFileNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={tRef('mandantName')}
            value={formData.mandantName || ''}
            onChange={(e) => handleFieldChange('mandantName', e.target.value)}
            placeholder="Nationwide Appraisal Services"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={tRef('mandantCompany')}
            value={formData.mandantCompany || ''}
            onChange={(e) => handleFieldChange('mandantCompany', e.target.value)}
            placeholder="Mouvement Desjardins"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={tRef('mandantAddress')}
            value={formData.mandantAddress || ''}
            onChange={(e) => handleFieldChange('mandantAddress', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={tRef('mandantCity')}
            value={formData.mandantCity || ''}
            onChange={(e) => handleFieldChange('mandantCity', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={tRef('mandantPhone')}
            value={formData.mandantPhone || ''}
            onChange={(e) => handleFieldChange('mandantPhone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
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
            label={tRef('ownerName')}
            value={formData.ownerName || ''}
            onChange={(e) => handleFieldChange('ownerName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
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
            label={tRef('borrowerName')}
            value={formData.borrowerName || ''}
            onChange={(e) => handleFieldChange('borrowerName', e.target.value)}
            helperText={appraisalData?.client_name ? tRef('autoPopulatedInfo') : ''}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
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
            label={tRef('valueInWords')}
            value={formData.valueInWords || ''}
            onChange={(e) => handleFieldChange('valueInWords', e.target.value)}
            placeholder={tRef('valueInWordsPlaceholder')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={tRef('asOfDate')}
            type="date"
            value={formData.asOfDate || ''}
            onChange={(e) => handleFieldChange('asOfDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={appraisalData?.effective_date ? tRef('autoPopulatedInfo') : ''}
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
