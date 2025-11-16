'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
  Paper
} from '@mui/material';
import { Save, Upload, Image as ImageIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useOrganizationSettings } from '../hooks/useOrganizationSettings';
import { useRememberedInputs } from '../hooks/useRememberedInputs';
import TextFieldWithHistory from './TextFieldWithHistory';

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
  const { savePreference, getPreference, getAllVariations, clearPreference, preferences, loading } = useRememberedInputs();

  // Get all saved variations for company and appraiser info (reactively updates when preferences change)
  const companyVariations = useMemo(() => getAllVariations('company_info'), [preferences]);
  const appraiserVariations = useMemo(() => getAllVariations('appraiser_info'), [preferences]);

  // Helper to get all company fields data
  const getCompanyFieldsData = () => ({
    companyName: formData.companyName || '',
    companyAddress: formData.companyAddress || '',
    companyPhone: formData.companyPhone || '',
    companyWebsite: formData.companyWebsite || '',
    companyLogoUrl: formData.companyLogoUrl || ''
  });

  // Helper to get all appraiser fields data
  const getAppraiserFieldsData = () => ({
    appraiserName: formData.appraiserName || '',
    appraiserTitle: formData.appraiserTitle || ''
  });

  // Auto-populate from appraisal data, organization settings, and saved preferences
  useEffect(() => {
    if (appraisalData && Object.keys(formData).length === 0) {
      const savedCompanyInfo = getPreference('company_info');
      const savedAppraiserInfo = getPreference('appraiser_info');

      const initialData = {
        // Report header
        reportTitle: formData.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE',

        // Property address
        fullAddress: formData.fullAddress || appraisalData.address || '',
        city: formData.city || appraisalData.city || '',
        province: formData.province || 'Québec',
        postalCode: formData.postalCode || '',

        // File number and photo
        fileNumber: formData.fileNumber || '',
        propertyPhotoUrl: formData.propertyPhotoUrl || '',

        // Client/Borrower
        clientName: formData.clientName || appraisalData.client_name || '',

        // Appraiser information (rememberable)
        appraiserName: savedAppraiserInfo?.appraiserName || formData.appraiserName || '',
        appraiserTitle: savedAppraiserInfo?.appraiserTitle || formData.appraiserTitle || '',

        // Company information (rememberable)
        companyName: savedCompanyInfo?.companyName || formData.companyName || settings.companyName || '',
        companyLogoUrl: savedCompanyInfo?.companyLogoUrl || formData.companyLogoUrl || settings.companyLogoUrl || '',
        companyAddress: savedCompanyInfo?.companyAddress || formData.companyAddress || settings.companyAddress || '',
        companyPhone: savedCompanyInfo?.companyPhone || formData.companyPhone || settings.companyPhone || '',
        companyWebsite: savedCompanyInfo?.companyWebsite || formData.companyWebsite || settings.companyWebsite || ''
      };

      setFormData(initialData);
      onChange(initialData);

    }
  }, [appraisalData, settings, getPreference]);

  // Save variation handler for company info
  const handleSaveCompanyVariation = async (variationName: string, data: any) => {
    console.log('[DEBUG] handleSaveCompanyVariation called:', { variationName, data });
    await savePreference('company_info', data, variationName);
    console.log('[DEBUG] After savePreference, current variations:', companyVariations);
  };

  // Save variation handler for appraiser info
  const handleSaveAppraiserVariation = async (variationName: string, data: any) => {
    console.log('[DEBUG] handleSaveAppraiserVariation called:', { variationName, data });
    await savePreference('appraiser_info', data, variationName);
    console.log('[DEBUG] After savePreference, current variations:', appraiserVariations);
  };

  // Delete variation handler
  const handleDeleteVariation = async (type: 'company_info' | 'appraiser_info', variationName: string) => {
    console.log('[DEBUG] handleDeleteVariation called:', { type, variationName });
    if (confirm(`Delete variation "${variationName}"?`)) {
      await clearPreference(type, variationName);
      console.log('[DEBUG] After clearPreference');
    } else {
      console.log('[DEBUG] Delete cancelled by user');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Report Title */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            Report Title
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Report Title"
            value={formData.reportTitle || ''}
            onChange={(e) => handleFieldChange('reportTitle', e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '16px',
                fontWeight: 500
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Property Address & Photo */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            Property Address
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Full Address"
                value={formData.fullAddress || ''}
                onChange={(e) => handleFieldChange('fullAddress', e.target.value)}
                placeholder="123 Main Street"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                value={formData.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="Montreal"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Province"
                value={formData.province || ''}
                onChange={(e) => handleFieldChange('province', e.target.value)}
                placeholder="Québec"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Postal Code"
                value={formData.postalCode || ''}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                placeholder="H1A 1A1"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* File Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="File Number"
                value={formData.fileNumber || ''}
                onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
                placeholder="AP-2025-001"
              />
            </Grid>

            {/* Property Photo */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Property Photo
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Property Photo URL"
                value={formData.propertyPhotoUrl || ''}
                onChange={(e) => handleFieldChange('propertyPhotoUrl', e.target.value)}
                placeholder="https://..."
              />

              {formData.propertyPhotoUrl && (
                <Paper
                  elevation={1}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: '12px',
                    border: '2px dashed',
                    borderColor: 'primary.light',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={formData.propertyPhotoUrl}
                    alt="Property"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Paper>
              )}

              {!formData.propertyPhotoUrl && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 4,
                    borderRadius: '12px',
                    border: '2px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    bgcolor: 'grey.50'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No photo uploaded yet
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Enter photo URL above or upload feature coming soon
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Client/Borrower Information */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            Client / Borrower
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Client Name"
            value={formData.clientName || ''}
            onChange={(e) => handleFieldChange('clientName', e.target.value)}
            placeholder="John Smith"
          />
        </CardContent>
      </Card>

      {/* Appraiser Information */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            Appraiser Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextFieldWithHistory
                fullWidth
                size="small"
                label="Appraiser Name"
                value={formData.appraiserName || ''}
                onChange={(val) => handleFieldChange('appraiserName', val)}
                savedVariations={appraiserVariations}
                fieldKey="appraiserName"
                onDeleteVariation={(name) => handleDeleteVariation('appraiser_info', name)}
                onSaveVariation={handleSaveAppraiserVariation}
                getAllFieldsData={getAppraiserFieldsData}
                groupLabel="Appraiser Info"
                placeholder="Jane Doe, E.A."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextFieldWithHistory
                fullWidth
                size="small"
                label="Title / Designation"
                value={formData.appraiserTitle || ''}
                onChange={(val) => handleFieldChange('appraiserTitle', val)}
                savedVariations={appraiserVariations}
                fieldKey="appraiserTitle"
                onDeleteVariation={(name) => handleDeleteVariation('appraiser_info', name)}
                onSaveVariation={handleSaveAppraiserVariation}
                getAllFieldsData={getAppraiserFieldsData}
                groupLabel="Appraiser Info"
                placeholder="Certified Real Estate Appraiser"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            Company Information
          </Typography>

          <Grid container spacing={2}>
            {/* Company Name */}
            <Grid item xs={12}>
              <TextFieldWithHistory
                fullWidth
                size="small"
                label="Company Name"
                value={formData.companyName || ''}
                onChange={(val) => handleFieldChange('companyName', val)}
                savedVariations={companyVariations}
                fieldKey="companyName"
                onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
                onSaveVariation={handleSaveCompanyVariation}
                getAllFieldsData={getCompanyFieldsData}
                groupLabel="Company Info"
                placeholder="ABC Appraisal Services Inc."
              />
            </Grid>

            {/* Company Logo */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Company Logo
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Company Logo URL"
                value={formData.companyLogoUrl || ''}
                onChange={(e) => handleFieldChange('companyLogoUrl', e.target.value)}
                placeholder="https://..."
              />

              {formData.companyLogoUrl && (
                <Paper
                  elevation={1}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    bgcolor: 'grey.50'
                  }}
                >
                  <Box
                    component="img"
                    src={formData.companyLogoUrl}
                    alt="Company Logo"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 120,
                      objectFit: 'contain'
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Paper>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Company Address */}
            <Grid item xs={12}>
              <TextFieldWithHistory
                fullWidth
                size="small"
                label="Company Address"
                value={formData.companyAddress || ''}
                onChange={(val) => handleFieldChange('companyAddress', val)}
                savedVariations={companyVariations}
                fieldKey="companyAddress"
                onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
                onSaveVariation={handleSaveCompanyVariation}
                getAllFieldsData={getCompanyFieldsData}
                groupLabel="Company Info"
                placeholder="456 Business Ave, Suite 200, Montreal, QC H2X 1Y3"
              />
            </Grid>

            {/* Phone & Website */}
            <Grid item xs={12} sm={6}>
              <TextFieldWithHistory
                fullWidth
                size="small"
                label="Telephone Number"
                value={formData.companyPhone || ''}
                onChange={(val) => handleFieldChange('companyPhone', val)}
                savedVariations={companyVariations}
                fieldKey="companyPhone"
                onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
                onSaveVariation={handleSaveCompanyVariation}
                getAllFieldsData={getCompanyFieldsData}
                groupLabel="Company Info"
                placeholder="(514) 555-1234"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextFieldWithHistory
                fullWidth
                size="small"
                label="Website Address"
                value={formData.companyWebsite || ''}
                onChange={(val) => handleFieldChange('companyWebsite', val)}
                savedVariations={companyVariations}
                fieldKey="companyWebsite"
                onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
                onSaveVariation={handleSaveCompanyVariation}
                getAllFieldsData={getCompanyFieldsData}
                groupLabel="Company Info"
                placeholder="www.abcappraisals.com"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '12px',
          bgcolor: 'info.lighter',
          border: '1px solid',
          borderColor: 'info.light'
        }}
      >
        <Typography variant="body2" color="info.dark" sx={{ mb: 1 }}>
          <strong>💡 Quick Tip:</strong> Double-click any field to save or load variations!
        </Typography>
        <Typography variant="caption" color="info.dark" sx={{ display: 'block', fontSize: '11px' }}>
          • Save multiple office locations (Montreal, Toronto, etc.)<br />
          • Save different appraisers<br />
          • Instantly switch between saved variations with one click<br />
          • All saved variations appear on the title page of your exported report
        </Typography>
      </Paper>
    </Box>
  );
}
