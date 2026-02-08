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
import NarrativeEditor from './NarrativeEditor';
import AIWritingAssistant from './AIWritingAssistant';
import SnippetsDialog from './SnippetsDialog';
import PresentationSectionContent from './PresentationSectionContent';
import ReferenceSheetSectionContent from './ReferenceSheetSectionContent';
import GeneralSectionContent from './GeneralSectionContent';
import DescriptionSectionContent from './DescriptionSectionContent';
import CoutPariteSectionContent from './CoutPariteSectionContent';
import CostApproachSectionContent from './CostApproachSectionContent';
import DirectComparisonSectionContent from './DirectComparisonSectionContent';
import SmartValidationWarnings from './SmartValidationWarnings';
// AIC Form Components
import TransmittalLetterSection from './AICForm/TransmittalLetterSection';
import ExecutiveSummarySection from './AICForm/ExecutiveSummarySection';
import NeighborhoodSiteSection from './AICForm/NeighborhoodSiteSection';
import SiteSection from './AICForm/SiteSection';
import ImprovementsSection from './AICForm/ImprovementsSection';
import PropertyInfoSection from './AICForm/PropertyInfoSection';
import AssignmentSection from './AICForm/AssignmentSection';

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
  const tRef = useTranslations('evaluations.sections.referenceSheet');
  const tGen = useTranslations('evaluations.sections.generalSection');
  const tDesc = useTranslations('evaluations.sections.descriptionSection');
  const [formData, setFormData] = useState(data);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [snippetsDialogOpen, setSnippetsDialogOpen] = useState(false);
  const [currentNarrativeField, setCurrentNarrativeField] = useState<string>('');

  console.log('🔍 AppraisalSectionForm - sectionId:', sectionId);
  console.log('🔍 AppraisalSectionForm - subjectPropertyId:', subjectPropertyId);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  // Auto-populate reference sheet section on first load
  useEffect(() => {
    if (sectionId === 'fiche_reference' && appraisalData && Object.keys(formData).length === 0) {
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
  }, [sectionId, appraisalData]);

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
          return renderNarrativeSection('description', 'Describe the neighborhood, amenities, and general desirability...');
        case 'site':
          return renderNarrativeSection('description', 'Describe the site characteristics, topography, and location...');
        case 'ameliorations':
          return renderNarrativeSection('description', 'Describe the improvements, construction quality, and condition...');
        case 'exposition':
          return renderNarrativeSection('description', 'Describe the market exposure and marketing period...');
        case 'conciliation':
          return renderNarrativeSection('description', 'Provide reconciliation of value indications from different approaches...');
        case 'technique_parite':
          return <DirectComparisonForm data={formData} onChange={onChange} subjectPropertyId={subjectPropertyId} subjectPropertyType={subjectPropertyType || undefined} reloadTrigger={reloadTrigger} appraisalId={appraisalData?.id} />;
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
          return <DirectComparisonForm data={formData} onChange={onChange} subjectPropertyId={subjectPropertyId} subjectPropertyType={subjectPropertyType || undefined} reloadTrigger={reloadTrigger} appraisalId={appraisalData?.id} />;
        case 'voisinage':
          return renderNarrativeSection('description', 'Describe the neighborhood characteristics...');
        case 'emplacement':
          return renderNarrativeSection('description', 'Describe the location and site...');
        case 'ameliorations':
          return renderNarrativeSection('description', 'Describe the improvements and building characteristics...');
        case 'utilisation_optimale':
          return renderNarrativeSection('description', 'Analyze the highest and best use...');
        case 'historique_ventes':
          return renderNarrativeSection('description', 'Describe the sales history...');
        case 'duree_exposition':
          return renderNarrativeSection('description', 'Describe the marketing time and exposure...');
        case 'conciliation_estimation':
          return renderNarrativeSection('description', 'Provide reconciliation of value estimates...');
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
          return renderGeneralSection();
        case 'description':
          return renderDescriptionSection();
        case 'cout_parite':
          return renderCoutPariteSection();
        case 'methode_cout':
          return renderCostApproachSection();
        case 'methode_comparaison':
          return renderDirectComparisonSection();
        case 'conclusion_comparaison':
          return renderNarrativeSection('description', 'Provide conclusion and final reconciliation...');
        case 'informations_generales':
          return renderGeneralInfoSection();
        case 'description_propriete':
          return renderPropertyDescriptionSection();
        default:
          return renderGenericSection();
      }
    }

    // AIC Form Sections (Version 2024)
    if (templateType === 'AIC_FORM') {
      switch (sectionId) {
        // Combined Client + Appraiser + Subject on one page
        case 'aic_property_info':
          return <PropertyInfoSection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        // Assignment section
        case 'aic_assignment':
          return <AssignmentSection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        // Executive Summary
        case 'executive_summary':
          return <ExecutiveSummarySection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        // Combined Neighborhood + Site
        case 'neighborhood_site':
          return <NeighborhoodSiteSection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        // Legacy sections (kept for backwards compatibility)
        case 'transmittal_letter':
          return <TransmittalLetterSection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        case 'assignment':
          return renderNarrativeSection('content', 'Details of the assignment...');
        case 'subject_property':
          return renderPropertySection();
        case 'site':
          return <SiteSection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        case 'improvements':
          return <ImprovementsSection formData={formData} handleFieldChange={handleFieldChange} appraisalData={appraisalData} />;
        case 'highest_best_use':
          return renderNarrativeSection('content', 'Highest and best use analysis...');
        case 'direct_comparison_approach':
          return <DirectComparisonForm data={formData} onChange={onChange} subjectPropertyId={subjectPropertyId} subjectPropertyType={subjectPropertyType || undefined} reloadTrigger={reloadTrigger} appraisalId={appraisalData?.id} />;
        case 'cost_approach':
          return renderNarrativeSection('content', 'Cost approach analysis...');
        case 'income_approach':
          return renderNarrativeSection('content', 'Income approach analysis...');
        case 'market_rent':
          return renderNarrativeSection('content', 'Market rent analysis...');
        case 'reconciliation':
          return renderNarrativeSection('content', 'Reconciliation of value indications...');
        case 'scope_certification':
          return renderNarrativeSection('content', 'Scope of work and certification...');
        case 'hypothetical_conditions':
          return renderNarrativeSection('content', 'Hypothetical conditions (if applicable)...');
        case 'extraordinary_items':
          return renderNarrativeSection('content', 'Extraordinary assumptions and limiting conditions...');
        case 'narrative_addendum':
          return renderNarrativeSection('content', 'Additional narrative information...');
        case 'photos_addendum':
          return renderGenericSection();
        case 'comparable_photos':
          return renderGenericSection();
        case 'building_sketch':
          return renderGenericSection();
        case 'additional_sales':
          return renderGenericSection();
        case 'zoning_map':
          return renderGenericSection();
        case 'aerial_map':
          return renderGenericSection();
        case 'site_map':
          return renderGenericSection();
        case 'as_is_complete':
          return renderNarrativeSection('content', 'As is / As complete analysis...');
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
    <PresentationSectionContent
      formData={formData}
      handleFieldChange={handleFieldChange}
      appraisalData={appraisalData}
      onChange={onChange}
      setFormData={setFormData}
    />
  );

  const renderPresentationSection_OLD = () => {
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
    return (
      <ReferenceSheetSectionContent
        formData={formData}
        handleFieldChange={handleFieldChange}
        appraisalData={appraisalData}
        onChange={onChange}
        setFormData={setFormData}
        allSectionsData={allSectionsData}
      />
    );
  };

  const renderGeneralSection = () => {
    return (
      <GeneralSectionContent
        formData={formData}
        handleFieldChange={handleFieldChange}
        appraisalData={appraisalData}
        onChange={onChange}
        setFormData={setFormData}
        allSectionsData={allSectionsData}
      />
    );
  };

  const renderDescriptionSection = () => {
    return (
      <DescriptionSectionContent
        formData={formData}
        handleFieldChange={handleFieldChange}
        appraisalData={appraisalData}
        onChange={onChange}
        setFormData={setFormData}
        allSectionsData={allSectionsData}
      />
    );
  };

  const renderCoutPariteSection = () => {
    return (
      <CoutPariteSectionContent
        formData={formData}
        handleFieldChange={handleFieldChange}
        appraisalData={appraisalData}
        onChange={onChange}
        setFormData={setFormData}
        allSectionsData={allSectionsData}
      />
    );
  };

  const renderCostApproachSection = () => {
    return (
      <CostApproachSectionContent
        formData={formData}
        handleFieldChange={handleFieldChange}
        appraisalData={appraisalData}
        onChange={onChange}
        setFormData={setFormData}
        allSectionsData={allSectionsData}
      />
    );
  };

  const renderDirectComparisonSection = () => {
    return (
      <DirectComparisonSectionContent
        formData={formData}
        handleFieldChange={handleFieldChange}
        appraisalData={appraisalData}
        onChange={onChange}
        setFormData={setFormData}
        allSectionsData={allSectionsData}
      />
    );
  };

  const renderGeneralitiesSection = () => {
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


  // Render narrative section with rich text editor
  const renderNarrativeSection = (fieldName: string = 'content', placeholder?: string) => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <NarrativeEditor
          content={formData[fieldName] || ''}
          onChange={(value) => handleFieldChange(fieldName, value)}
          placeholder={placeholder || t('contentPlaceholder')}
          minHeight={400}
          onAIAssist={() => {
            setCurrentNarrativeField(fieldName);
            setAiAssistantOpen(true);
          }}
          onInsertSnippet={() => {
            setCurrentNarrativeField(fieldName);
            setSnippetsDialogOpen(true);
          }}
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
          size="small"
          startIcon={formData.completed ? <CheckCircle sx={{ fontSize: 16 }} /> : <Circle sx={{ fontSize: 16 }} />}
          onClick={handleMarkComplete}
          sx={{ textTransform: 'none', py: 0.5, px: 1.5, minHeight: 28, fontSize: '0.8125rem' }}
        >
          {formData.completed ? t('completed') : t('markComplete')}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {renderSectionForm()}

      {/* Smart Validation Warnings */}
      <SmartValidationWarnings
        formData={formData}
        propertyType={
          // For aic_property_info, check existingUse field for condo detection
          formData.existingUse?.toLowerCase() === 'condo'
            ? 'condo'
            : (subjectPropertyType || 'single_family')
        }
        sectionId={sectionId}
      />

      {/* AI Writing Assistant Dialog */}
      <AIWritingAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onInsert={(text) => {
          if (currentNarrativeField) {
            handleFieldChange(currentNarrativeField, text);
          }
          setAiAssistantOpen(false);
        }}
        contextData={{
          address: formData.address,
          city: formData.city,
          propertyType: subjectPropertyType || undefined,
        }}
        currentText={currentNarrativeField ? (formData[currentNarrativeField] || '') : ''}
      />

      {/* Text Snippets Dialog */}
      <SnippetsDialog
        open={snippetsDialogOpen}
        onClose={() => setSnippetsDialogOpen(false)}
        onInsert={(text) => {
          if (currentNarrativeField) {
            const currentContent = formData[currentNarrativeField] || '';
            handleFieldChange(currentNarrativeField, currentContent + '\n\n' + text);
          }
          setSnippetsDialogOpen(false);
        }}
      />
    </Box>
  );
}
