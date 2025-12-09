'use client';

import { TextField, Typography, Box, Autocomplete } from '@mui/material';

interface PropertyInfoSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function PropertyInfoSection({
  formData,
  handleFieldChange,
  appraisalData
}: PropertyInfoSectionProps) {

  const existingUseOptions = [
    'Single-family',
    'Condo',
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

  const unitPositionOptions = [
    'Corner',
    'End Unit',
    'Interior',
    'Penthouse'
  ];

  // Check if property is a condo based on existingUse or appraisalData property_type
  const isCondo = formData.existingUse?.toLowerCase() === 'condo' ||
                  appraisalData?.property_type === 'condo';

  return (
    <Box sx={{ p: 3 }}>
      {/* CLIENT */}
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
            CLIENT
          </Typography>
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Client</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Client Name"
              value={formData.clientName || appraisalData?.client_name || ''}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Attention */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Attention</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Attention"
              value={formData.clientAttention || ''}
              onChange={(e) => handleFieldChange('clientAttention', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Address */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Address</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Address"
              value={formData.clientAddress || ''}
              onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* E-mail / Phone */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>E-mail / Phone</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="email"
              placeholder="email@example.com"
              value={formData.clientEmail || ''}
              onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              value={formData.clientPhone || ''}
              onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* APPRAISER */}
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
            APPRAISER
          </Typography>
        </Box>

        {/* AIC Member */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>AIC Member</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Appraiser Name, Designation (e.g., AACI, CRA)"
              value={formData.appraiserName || ''}
              onChange={(e) => handleFieldChange('appraiserName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Company */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Company Name"
              value={formData.appraiserCompany || ''}
              onChange={(e) => handleFieldChange('appraiserCompany', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Address */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Address</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Address"
              value={formData.appraiserAddress || ''}
              onChange={(e) => handleFieldChange('appraiserAddress', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* E-mail / Phone */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>E-mail / Phone</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="email"
              placeholder="email@example.com"
              value={formData.appraiserEmail || ''}
              onChange={(e) => handleFieldChange('appraiserEmail', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              value={formData.appraiserPhone || ''}
              onChange={(e) => handleFieldChange('appraiserPhone', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* SUBJECT */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
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
            borderBottom: isCondo ? '1px solid' : 'none',
            borderColor: 'divider',
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

        {/* Condo-specific fields - only shown when property is a condo */}
        {isCondo && (
          <>
            {/* Floor Level / Unit Position */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Floor Level / Unit Position</Typography>
              </Box>
              <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Floor Level"
                  value={formData.floorLevel || ''}
                  onChange={(e) => handleFieldChange('floorLevel', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
                  InputProps={{
                    endAdornment: <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>floor</Typography>
                  }}
                />
                <Autocomplete
                  freeSolo
                  forcePopupIcon
                  size="small"
                  options={unitPositionOptions}
                  value={formData.unitPosition || ''}
                  onChange={(e, newValue) => handleFieldChange('unitPosition', newValue)}
                  onInputChange={(e, newValue) => handleFieldChange('unitPosition', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Unit Position"
                      sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                    />
                  )}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Condo Fees */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Condo Fees</Typography>
              </Box>
              <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
                  <Typography variant="body2">$</Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Monthly Condo Fees"
                    value={formData.condoFees || ''}
                    onChange={(e) => handleFieldChange('condoFees', e.target.value)}
                    sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>/month</Typography>
                </Box>
                <TextField
                  size="small"
                  placeholder="What's Included (heat, water, parking, etc.)"
                  value={formData.condoFeesIncludes || ''}
                  onChange={(e) => handleFieldChange('condoFeesIncludes', e.target.value)}
                  sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
