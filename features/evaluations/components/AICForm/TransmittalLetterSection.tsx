'use client';

import { TextField, Typography, Box, Autocomplete } from '@mui/material';

interface TransmittalLetterSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function TransmittalLetterSection({
  formData,
  handleFieldChange,
  appraisalData
}: TransmittalLetterSectionProps) {

  const propertyRightsOptions = [
    'Fee Simple',
    'Leasehold',
    'Life Estate',
    'Leased Fee'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* TRANSMITTAL LETTER */}
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
            TRANSMITTAL LETTER (Pages 1-2)
          </Typography>
        </Box>

        {/* Date */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Date</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={formData.date || ''}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* CLIENT INFORMATION */}
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
            CLIENT INFORMATION
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Client Name</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={formData.clientName || appraisalData?.client_name || ''}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Client Company */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Client Company</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={formData.clientCompany || ''}
              onChange={(e) => handleFieldChange('clientCompany', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Client Address */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Client Address</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={formData.clientAddress || ''}
              onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Client City / Province / Postal Code */}
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
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="City"
              value={formData.clientCity || ''}
              onChange={(e) => handleFieldChange('clientCity', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Province"
              value={formData.clientProvince || ''}
              onChange={(e) => handleFieldChange('clientProvince', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Postal Code"
              value={formData.clientPostalCode || ''}
              onChange={(e) => handleFieldChange('clientPostalCode', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* SUBJECT PROPERTY */}
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
            SUBJECT PROPERTY
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

        {/* Property City / Province / Postal Code */}
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
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="City"
              value={formData.propertyCity || appraisalData?.city || ''}
              onChange={(e) => handleFieldChange('propertyCity', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Province"
              value={formData.propertyProvince || ''}
              onChange={(e) => handleFieldChange('propertyProvince', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Postal Code"
              value={formData.propertyPostalCode || appraisalData?.postal_code || ''}
              onChange={(e) => handleFieldChange('propertyPostalCode', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* APPRAISAL DETAILS */}
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
            APPRAISAL DETAILS
          </Typography>
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
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={formData.fileNumber || appraisalData?.appraisal_number || ''}
              onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Effective Date / Inspection Date */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Effective Date / Inspection</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="date"
              label="Effective Date"
              value={formData.effectiveDate || appraisalData?.effective_date || ''}
              onChange={(e) => handleFieldChange('effectiveDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="date"
              label="Inspection Date"
              value={formData.inspectionDate || ''}
              onChange={(e) => handleFieldChange('inspectionDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Purpose of Appraisal */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Purpose of Appraisal</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              value={formData.purpose || appraisalData?.evaluation_objective || ''}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Property Rights Appraised */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Property Rights Appraised</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={propertyRightsOptions}
              value={formData.propertyRights || 'Fee Simple'}
              onChange={(e, newValue) => handleFieldChange('propertyRights', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('propertyRights', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Box>

      {/* ESTIMATE OF MARKET VALUE */}
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
            ESTIMATE OF MARKET VALUE
          </Typography>
        </Box>

        {/* Market Value Estimate */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Market Value Estimate</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>$</Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={formData.marketValueEstimate || ''}
              onChange={(e) => handleFieldChange('marketValueEstimate', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Market Value in Words */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Value in Words</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Three Hundred Fifty Thousand Dollars"
              value={formData.marketValueInWords || ''}
              onChange={(e) => handleFieldChange('marketValueInWords', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* LETTER CONTENT */}
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
            LETTER CONTENT
          </Typography>
        </Box>

        {/* Opening Paragraph */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Opening Paragraph</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Please find enclosed our appraisal report for the above-noted property..."
              value={formData.openingParagraph || ''}
              onChange={(e) => handleFieldChange('openingParagraph', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Scope of Work */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Scope of Work</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={4}
              placeholder="The scope of work includes inspection of the subject property, analysis of comparable sales..."
              value={formData.scopeOfWork || ''}
              onChange={(e) => handleFieldChange('scopeOfWork', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Limiting Conditions */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Limiting Conditions</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="This appraisal is subject to the assumptions and limiting conditions outlined in the report..."
              value={formData.limitingConditions || ''}
              onChange={(e) => handleFieldChange('limitingConditions', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Closing Paragraph */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Closing Paragraph</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Should you have any questions or require clarification, please do not hesitate to contact us..."
              value={formData.closingParagraph || ''}
              onChange={(e) => handleFieldChange('closingParagraph', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* APPRAISER INFORMATION */}
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
            APPRAISER INFORMATION
          </Typography>
        </Box>

        {/* Appraiser Name / Designation */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Appraiser / Designation</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Appraiser Name"
              value={formData.appraiserName || ''}
              onChange={(e) => handleFieldChange('appraiserName', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="e.g., AACI, CRA, P.App"
              value={formData.appraiserDesignation || ''}
              onChange={(e) => handleFieldChange('appraiserDesignation', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Company Name / License Number */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Company / License #</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Company Name"
              value={formData.companyName || ''}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="License Number"
              value={formData.licenseNumber || ''}
              onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
