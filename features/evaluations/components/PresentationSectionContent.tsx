'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Save, Upload } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useOrganizationSettings } from '../hooks/useOrganizationSettings';

interface PresentationSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
}

export default function PresentationSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData
}: PresentationSectionContentProps) {
  const t = useTranslations('evaluations.sections');
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
      alert('Paramètres de l\'entreprise sauvegardés avec succès!');
    } else {
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Report Title */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          {t('reportTitle')}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label={t('reportTitle')}
          value={formData.reportTitle || ''}
          onChange={(e) => handleFieldChange('reportTitle', e.target.value)}
          sx={{ fontWeight: 600 }}
        />
      </Grid>

      {/* Property Photos */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
          {t('propertyPhoto')}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label={t('propertyPhotoUrl')}
          placeholder="https://..."
          value={formData.propertyPhotoUrl || ''}
          onChange={(e) => handleFieldChange('propertyPhotoUrl', e.target.value)}
        />
      </Grid>

      {/* Property Information */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
          {t('propertyInfo')}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('civicAddress')}
          value={formData.civicAddress || ''}
          onChange={(e) => handleFieldChange('civicAddress', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('city')}
          value={formData.city || ''}
          onChange={(e) => handleFieldChange('city', e.target.value)}
        />
      </Grid>

      {/* Client Information */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
          {t('clientInfo')}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('clientName')}
          value={formData.clientName || ''}
          onChange={(e) => handleFieldChange('clientName', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('fileNumber')}
          value={formData.fileNumber || ''}
          onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
        />
      </Grid>

      {/* Company Information */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            {t('companyInfo')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Save />}
            onClick={handleSaveCompanySettings}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            {saving ? t('saving') : t('saveAsDefault')}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {t('companyInfoSubtext')}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('companyAddress')}
          value={formData.companyAddress || ''}
          onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('companyPhone')}
          value={formData.companyPhone || ''}
          onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('companyWebsite')}
          placeholder="www.example.com"
          value={formData.companyWebsite || ''}
          onChange={(e) => handleFieldChange('companyWebsite', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t('companyLogoUrl')}
          placeholder="https://..."
          value={formData.companyLogoUrl || ''}
          onChange={(e) => handleFieldChange('companyLogoUrl', e.target.value)}
        />
      </Grid>

      {/* Help Text */}
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('presentationHelp')}
        </Alert>
      </Grid>
    </Grid>
  );
}
