'use client';

import { TextField, Typography, Box, Autocomplete, Radio, RadioGroup, FormControlLabel } from '@mui/material';

interface ExecutiveSummarySectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function ExecutiveSummarySection({
  formData,
  handleFieldChange,
  appraisalData
}: ExecutiveSummarySectionProps) {

  const propertyTypeOptions = [
    'Single Family Dwelling',
    'Semi-Detached',
    'Duplex',
    'Triplex',
    'Fourplex',
    'Townhouse',
    'Condominium',
    'Other'
  ];

  const designStyleOptions = [
    'Bungalow',
    '1 Storey',
    '1 1/2 Storey',
    '2 Storey',
    'Split Level',
    'Bi-Level',
    'Townhouse',
    'Other'
  ];

  const inspectionTypeOptions = [
    'Interior and Exterior',
    'Exterior Only',
    'Desktop'
  ];

  const energyRatingOptions = [
    'Not Rated',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* ASSIGNMENT */}
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
            ASSIGNMENT
          </Typography>
        </Box>

        {/* Authorized Client Name */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Authorized Client Name</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Client Name"
              value={formData.authorizedClientName || appraisalData?.client_name || ''}
              onChange={(e) => handleFieldChange('authorizedClientName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Authorized User */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Authorized User</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Other - must be named"
              value={formData.authorizedUser || ''}
              onChange={(e) => handleFieldChange('authorizedUser', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Authorized Use */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Authorized Use</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Draft report only. NOT for lending, financing or to be relied upon"
              value={formData.authorizedUse || 'Draft report only. NOT for lending, financing or to be relied upon'}
              onChange={(e) => handleFieldChange('authorizedUse', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Report Date / Inspection Date */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Report / Inspection Date</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="date"
              label="Report Date"
              value={formData.reportDate || ''}
              onChange={(e) => handleFieldChange('reportDate', e.target.value)}
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

        {/* Effective Date / Inspection Type */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Effective Date / Inspection Type</Typography>
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
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={inspectionTypeOptions}
              value={formData.inspectionType || ''}
              onChange={(e, newValue) => handleFieldChange('inspectionType', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('inspectionType', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Inspection Type"
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
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

        {/* Property Type / Design Style / Year Built / Remaining Life */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Type / Style / Year / Life</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={propertyTypeOptions}
              value={formData.propertyType || ''}
              onChange={(e, newValue) => handleFieldChange('propertyType', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('propertyType', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Property Type"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={designStyleOptions}
              value={formData.designStyle || ''}
              onChange={(e, newValue) => handleFieldChange('designStyle', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('designStyle', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Design/Style"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Year Built"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleFieldChange('yearBuilt', e.target.value)}
              sx={{ flex: 0.7, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Remaining Life (Yrs)"
              value={formData.estimatedRemainingLife || ''}
              onChange={(e) => handleFieldChange('estimatedRemainingLife', e.target.value)}
              sx={{ flex: 0.8, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Energy Rating / House Size / Lot Size */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Energy / House / Lot Size</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={energyRatingOptions}
              value={formData.energyRating || ''}
              onChange={(e, newValue) => handleFieldChange('energyRating', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('energyRating', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Energy Rating"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              placeholder="House Size (sq.ft.)"
              value={formData.houseSize || ''}
              onChange={(e) => handleFieldChange('houseSize', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Lot Size"
              value={formData.lotSize || ''}
              onChange={(e) => handleFieldChange('lotSize', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Zoning / Land Value / Market Value */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Zoning / Land / Market Value</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Zoning"
              value={formData.zoning || ''}
              onChange={(e) => handleFieldChange('zoning', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Land Value"
                value={formData.landValue || ''}
                onChange={(e) => handleFieldChange('landValue', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="MARKET VALUE"
                value={formData.marketValue || ''}
                onChange={(e) => handleFieldChange('marketValue', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px', fontWeight: 600 } }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* HISTORY */}
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
            HISTORY
          </Typography>
        </Box>

        {/* Current Purchase Price / Current List Price */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Current Purchase / List</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Current Purchase Price"
                value={formData.currentPurchasePrice || ''}
                onChange={(e) => handleFieldChange('currentPurchasePrice', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Current List Price"
                value={formData.currentListPrice || ''}
                onChange={(e) => handleFieldChange('currentListPrice', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Prior List Price / Last Sold Price / Date */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Prior List / Last Sold</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Prior List (1 yr)"
                value={formData.priorListPrice || ''}
                onChange={(e) => handleFieldChange('priorListPrice', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Last Sold (3 yrs)"
                value={formData.lastSoldPrice || ''}
                onChange={(e) => handleFieldChange('lastSoldPrice', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <TextField
              size="small"
              type="date"
              label="Last Sold Date"
              value={formData.lastSoldDate || ''}
              onChange={(e) => handleFieldChange('lastSoldDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* REPORT WARNINGS OR SPECIAL CONDITIONS */}
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
            REPORT WARNINGS OR SPECIAL CONDITIONS
          </Typography>
        </Box>

        {/* Warning Type Radio */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Warning Type</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <RadioGroup
              row
              value={formData.warningType || ''}
              onChange={(e) => handleFieldChange('warningType', e.target.value)}
            >
              <FormControlLabel
                value="hypothetical_condition"
                control={<Radio size="small" />}
                label="Hypothetical Condition"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="extraordinary_items"
                control={<Radio size="small" />}
                label="Extraordinary Items"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
            </RadioGroup>
          </Box>
        </Box>

        {/* Warning Details */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Details</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Describe any warnings or special conditions..."
              value={formData.warningDetails || ''}
              onChange={(e) => handleFieldChange('warningDetails', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
