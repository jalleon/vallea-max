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

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be smaller than 2MB');
        return;
      }

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleFieldChange('companyLogoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle property photo upload
  const handlePropertyPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 5MB for property photos)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleFieldChange('propertyPhotoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Compact Table-Style Form */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        {/* Report Title */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Report Title</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.reportTitle || ''}
              onChange={(e) => handleFieldChange('reportTitle', e.target.value)}
              placeholder="RAPPORT D'ÉVALUATION IMMOBILIÈRE"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Full Address */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Full Address</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.fullAddress || ''}
              onChange={(e) => handleFieldChange('fullAddress', e.target.value)}
              placeholder="123 Main Street"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* City, Province, Postal Code */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>City / Province / Postal</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Montreal"
                  value={formData.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Québec"
                  value={formData.province || ''}
                  onChange={(e) => handleFieldChange('province', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="H1A 1A1"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* File Number */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>File Number</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.fileNumber || ''}
              onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
              placeholder="AP-2025-001"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Property Photo */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Property Photo</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: formData.propertyPhotoUrl ? 1 : 0 }}>
              <TextField
                fullWidth
                size="small"
                value={formData.propertyPhotoUrl || ''}
                onChange={(e) => handleFieldChange('propertyPhotoUrl', e.target.value)}
                placeholder="https://... or upload an image"
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<Upload />}
                sx={{
                  minWidth: '100px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: '12px'
                }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePropertyPhotoUpload}
                />
              </Button>
            </Box>
            {formData.propertyPhotoUrl && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  borderRadius: '8px',
                  border: '1px dashed',
                  borderColor: 'primary.light',
                  bgcolor: 'grey.50'
                }}
              >
                <Box
                  component="img"
                  src={formData.propertyPhotoUrl}
                  alt="Property"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: '4px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Client Name */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Client / Borrower</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.clientName || ''}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              placeholder="John Smith"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Appraiser Name */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Appraiser Name</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              size="small"
              value={formData.appraiserName || ''}
              onChange={(val) => handleFieldChange('appraiserName', val)}
              savedVariations={appraiserVariations}
              fieldKey="appraiserName"
              onDeleteVariation={(name) => handleDeleteVariation('appraiser_info', name)}
              onSaveVariation={handleSaveAppraiserVariation}
              getAllFieldsData={getAppraiserFieldsData}
              groupLabel="Appraiser Info"
              placeholder="Jane Doe, E.A."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Appraiser Title */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Appraiser Title</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              size="small"
              value={formData.appraiserTitle || ''}
              onChange={(val) => handleFieldChange('appraiserTitle', val)}
              savedVariations={appraiserVariations}
              fieldKey="appraiserTitle"
              onDeleteVariation={(name) => handleDeleteVariation('appraiser_info', name)}
              onSaveVariation={handleSaveAppraiserVariation}
              getAllFieldsData={getAppraiserFieldsData}
              groupLabel="Appraiser Info"
              placeholder="Certified Real Estate Appraiser"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Company Name */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company Name</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              size="small"
              value={formData.companyName || ''}
              onChange={(val) => handleFieldChange('companyName', val)}
              savedVariations={companyVariations}
              fieldKey="companyName"
              onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
              onSaveVariation={handleSaveCompanyVariation}
              getAllFieldsData={getCompanyFieldsData}
              groupLabel="Company Info"
              placeholder="ABC Appraisal Services Inc."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Company Logo */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company Logo</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: formData.companyLogoUrl ? 1 : 0 }}>
              <TextField
                fullWidth
                size="small"
                value={formData.companyLogoUrl || ''}
                onChange={(e) => handleFieldChange('companyLogoUrl', e.target.value)}
                placeholder="https://... or upload an image"
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<Upload />}
                sx={{
                  minWidth: '100px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: '12px'
                }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </Button>
            </Box>
            {formData.companyLogoUrl && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                  textAlign: 'center'
                }}
              >
                <Box
                  component="img"
                  src={formData.companyLogoUrl}
                  alt="Company Logo"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 100,
                    objectFit: 'contain'
                  }}
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Company Address */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company Address</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              size="small"
              value={formData.companyAddress || ''}
              onChange={(val) => handleFieldChange('companyAddress', val)}
              savedVariations={companyVariations}
              fieldKey="companyAddress"
              onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
              onSaveVariation={handleSaveCompanyVariation}
              getAllFieldsData={getCompanyFieldsData}
              groupLabel="Company Info"
              placeholder="456 Business Ave, Suite 200, Montreal, QC H2X 1Y3"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Company Phone */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company Phone</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              size="small"
              value={formData.companyPhone || ''}
              onChange={(val) => handleFieldChange('companyPhone', val)}
              savedVariations={companyVariations}
              fieldKey="companyPhone"
              onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
              onSaveVariation={handleSaveCompanyVariation}
              getAllFieldsData={getCompanyFieldsData}
              groupLabel="Company Info"
              placeholder="(514) 555-1234"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Company Website */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company Website</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              size="small"
              value={formData.companyWebsite || ''}
              onChange={(val) => handleFieldChange('companyWebsite', val)}
              savedVariations={companyVariations}
              fieldKey="companyWebsite"
              onDeleteVariation={(name) => handleDeleteVariation('company_info', name)}
              onSaveVariation={handleSaveCompanyVariation}
              getAllFieldsData={getCompanyFieldsData}
              groupLabel="Company Info"
              placeholder="www.abcappraisals.com"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* Help Text */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: '8px',
          bgcolor: 'info.lighter',
          border: '1px solid',
          borderColor: 'info.light'
        }}
      >
        <Typography variant="body2" color="info.dark" sx={{ mb: 0.5, fontWeight: 600, fontSize: '13px' }}>
          Quick Tip: Double-click any field to save or load variations
        </Typography>
        <Typography variant="caption" color="info.dark" sx={{ display: 'block', fontSize: '11px', lineHeight: 1.6 }}>
          Save multiple office locations (Montreal, Toronto, etc.) • Save different appraisers • Instantly switch between saved variations
        </Typography>
      </Paper>
    </Box>
  );
}
