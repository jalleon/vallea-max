'use client';

import { TextField, Typography, Box, Autocomplete } from '@mui/material';

interface SubjectSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function SubjectSection({
  formData,
  handleFieldChange,
  appraisalData
}: SubjectSectionProps) {

  const existingUseOptions = [
    'Single-family',
    'Multiresidential',
    'Duplex',
    'Triplex',
    'Fourplex',
    'Commercial',
    'Industrial',
    'Agricultural',
    'Vacant Land'
  ];

  const occupiedByOptions = [
    'Owner',
    'Tenant',
    'Owner and tenants',
    'Vacant'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* SUBJECT */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          mb: 3
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            SUBJECT
          </Typography>
        </Box>

        {/* Property Address */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Property Address</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={formData.propertyAddress || appraisalData?.address || ''}
              onChange={(e) => handleFieldChange('propertyAddress', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Legal Description / Source */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Legal Description / Source</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Legal Description"
              value={formData.legalDescription || ''}
              onChange={(e) => handleFieldChange('legalDescription', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Source"
              value={formData.legalDescriptionSource || ''}
              onChange={(e) => handleFieldChange('legalDescriptionSource', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Municipality and District / Property ID */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Municipality / Property ID</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Municipality and District"
              value={formData.municipalityDistrict || appraisalData?.city || ''}
              onChange={(e) => handleFieldChange('municipalityDistrict', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="PID #"
              value={formData.propertyId || ''}
              onChange={(e) => handleFieldChange('propertyId', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Assessment / Phase-in Date */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Assessment / Phase-in</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Assessment"
                value={formData.assessment || ''}
                onChange={(e) => handleFieldChange('assessment', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <TextField
              size="small"
              type="date"
              label="Phase-in Date"
              value={formData.assessmentPhaseInDate || ''}
              onChange={(e) => handleFieldChange('assessmentPhaseInDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Taxes / Year */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Taxes / Year</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Taxes"
                value={formData.taxes || ''}
                onChange={(e) => handleFieldChange('taxes', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <TextField
              size="small"
              type="number"
              placeholder="Year (YYYY)"
              value={formData.taxYear || ''}
              onChange={(e) => handleFieldChange('taxYear', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Existing Use / Other Uses / Occupied By */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Use / Occupied By</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={existingUseOptions}
              value={formData.existingUse || ''}
              onChange={(e, newValue) => handleFieldChange('existingUse', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('existingUse', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Existing Use"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              placeholder="Other Uses"
              value={formData.otherUses || ''}
              onChange={(e) => handleFieldChange('otherUses', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={occupiedByOptions}
              value={formData.occupiedBy || ''}
              onChange={(e, newValue) => handleFieldChange('occupiedBy', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('occupiedBy', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Occupied By"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
