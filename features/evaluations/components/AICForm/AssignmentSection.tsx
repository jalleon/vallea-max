'use client';

import { TextField, Typography, Box, Radio, RadioGroup, FormControlLabel, Checkbox } from '@mui/material';

interface AssignmentSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function AssignmentSection({
  formData,
  handleFieldChange,
  appraisalData
}: AssignmentSectionProps) {

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

        {/* Name / Name Type */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Name / Name Type</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Name"
              value={formData.assignmentName || ''}
              onChange={(e) => handleFieldChange('assignmentName', e.target.value)}
              sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Other (specify)"
              value={formData.assignmentNameType || ''}
              onChange={(e) => handleFieldChange('assignmentNameType', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Purpose */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Purpose</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              value={formData.purpose || ''}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
            >
              <FormControlLabel
                value="estimate_market_value"
                control={<Radio size="small" />}
                label="To estimate market value"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="estimate_market_rent"
                control={<Radio size="small" />}
                label="To estimate market rent"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  value="update_original"
                  control={<Radio size="small" />}
                  label="Update of original report completed on"
                  sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
                />
                {formData.purpose === 'update_original' && (
                  <>
                    <TextField
                      size="small"
                      type="date"
                      value={formData.originalReportDate || ''}
                      onChange={(e) => handleFieldChange('originalReportDate', e.target.value)}
                      sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '14px' }}>with an effective date of</Typography>
                    <TextField
                      size="small"
                      type="date"
                      value={formData.originalEffectiveDate || ''}
                      onChange={(e) => handleFieldChange('originalEffectiveDate', e.target.value)}
                      sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
                    />
                  </>
                )}
              </Box>
            </RadioGroup>
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
          <Box sx={{ p: 1 }}>
            <RadioGroup
              value={formData.authorizedUse || ''}
              onChange={(e) => handleFieldChange('authorizedUse', e.target.value)}
            >
              <FormControlLabel
                value="draft_only"
                control={<Radio size="small" />}
                label="Draft report only. Not for lending, financing"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  value="other"
                  control={<Radio size="small" />}
                  label="Other (Specify)"
                  sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
                />
                {formData.authorizedUse === 'other' && (
                  <TextField
                    size="small"
                    placeholder="Specify authorized use"
                    value={formData.authorizedUseOther || ''}
                    onChange={(e) => handleFieldChange('authorizedUseOther', e.target.value)}
                    sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
                  />
                )}
              </Box>
            </RadioGroup>
          </Box>
        </Box>

        {/* Authorized Users */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Authorized Users (by name)</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Authorized users by name"
              value={formData.authorizedUsers || ''}
              onChange={(e) => handleFieldChange('authorizedUsers', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Requested By */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Requested By</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.requestedBy || ''}
              onChange={(e) => handleFieldChange('requestedBy', e.target.value)}
            >
              <FormControlLabel
                value="client_above"
                control={<Radio size="small" />}
                label="Client above"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  value="other"
                  control={<Radio size="small" />}
                  label="Other"
                  sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
                />
                {formData.requestedBy === 'other' && (
                  <TextField
                    size="small"
                    placeholder="Specify"
                    value={formData.requestedByOther || ''}
                    onChange={(e) => handleFieldChange('requestedByOther', e.target.value)}
                    sx={{ width: 200, '& .MuiInputBase-input': { fontSize: '14px' } }}
                  />
                )}
              </Box>
            </RadioGroup>
          </Box>
        </Box>

        {/* Value Type */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Value</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.valueType || ''}
              onChange={(e) => handleFieldChange('valueType', e.target.value)}
            >
              <FormControlLabel
                value="current"
                control={<Radio size="small" />}
                label="Current"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="retrospective"
                control={<Radio size="small" />}
                label="Retrospective"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
            </RadioGroup>
          </Box>
        </Box>

        {/* Update of Original */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Update of Original</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isUpdateOfOriginal || false}
                  onChange={(e) => handleFieldChange('isUpdateOfOriginal', e.target.checked)}
                  size="small"
                />
              }
              label="Update of original completed on"
              sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
            />
            {formData.isUpdateOfOriginal && (
              <>
                <TextField
                  size="small"
                  type="date"
                  value={formData.updateOriginalDate || ''}
                  onChange={(e) => handleFieldChange('updateOriginalDate', e.target.value)}
                  sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
                <Typography variant="body2" sx={{ fontSize: '14px' }}>with an effective date of</Typography>
                <TextField
                  size="small"
                  type="date"
                  value={formData.updateEffectiveDate || ''}
                  onChange={(e) => handleFieldChange('updateEffectiveDate', e.target.value)}
                  sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
                <Typography variant="body2" sx={{ fontSize: '14px' }}>File no.</Typography>
                <TextField
                  size="small"
                  placeholder="File No."
                  value={formData.updateFileNo || ''}
                  onChange={(e) => handleFieldChange('updateFileNo', e.target.value)}
                  sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </>
            )}
          </Box>
        </Box>

        {/* Property Rights/Ownership */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Property Rights/Ownership</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.propertyRights || ''}
              onChange={(e) => handleFieldChange('propertyRights', e.target.value)}
            >
              <FormControlLabel
                value="fee_simple"
                control={<Radio size="small" />}
                label="Fee Simple"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="leasehold"
                control={<Radio size="small" />}
                label="Leasehold"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="condo_strata"
                control={<Radio size="small" />}
                label="Condo/Strata"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  value="other"
                  control={<Radio size="small" />}
                  label="Other:"
                  sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
                />
                {formData.propertyRights === 'other' && (
                  <TextField
                    size="small"
                    placeholder="Specify"
                    value={formData.propertyRightsOther || ''}
                    onChange={(e) => handleFieldChange('propertyRightsOther', e.target.value)}
                    sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
                  />
                )}
              </Box>
            </RadioGroup>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isParcelTiedLand || false}
                    onChange={(e) => handleFieldChange('isParcelTiedLand', e.target.checked)}
                    size="small"
                  />
                }
                label="Parcel of tied land"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              {formData.isParcelTiedLand && (
                <TextField
                  size="small"
                  placeholder="Details"
                  value={formData.parcelTiedLandDetails || ''}
                  onChange={(e) => handleFieldChange('parcelTiedLandDetails', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Maintenance Fee */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Maintenance Fee</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2">$</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Amount"
                value={formData.maintenanceFee || ''}
                onChange={(e) => handleFieldChange('maintenanceFee', e.target.value)}
                sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
            <RadioGroup
              row
              value={formData.maintenanceFeePeriod || ''}
              onChange={(e) => handleFieldChange('maintenanceFeePeriod', e.target.value)}
            >
              <FormControlLabel
                value="monthly"
                control={<Radio size="small" />}
                label="Monthly"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="annual"
                control={<Radio size="small" />}
                label="Annual"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
            </RadioGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.maintenanceFeeUnknown || false}
                  onChange={(e) => handleFieldChange('maintenanceFeeUnknown', e.target.checked)}
                  size="small"
                />
              }
              label="Unknown"
              sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Assessment/Levies */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Assessment/Levies</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Assessment/Levies"
              value={formData.assessmentLevies || ''}
              onChange={(e) => handleFieldChange('assessmentLevies', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Source"
              value={formData.assessmentLeviesSource || ''}
              onChange={(e) => handleFieldChange('assessmentLeviesSource', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Condo/Strata Name */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Condo/Strata Name</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Condo/Strata Name (if applicable)"
              value={formData.condoStrataName || ''}
              onChange={(e) => handleFieldChange('condoStrataName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Approaches Used */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Approaches Used</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.useDirectComparison || false}
                  onChange={(e) => handleFieldChange('useDirectComparison', e.target.checked)}
                  size="small"
                />
              }
              label="Direct Comparison Approach"
              sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.useCostApproach || false}
                  onChange={(e) => handleFieldChange('useCostApproach', e.target.checked)}
                  size="small"
                />
              }
              label="Cost Approach"
              sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.useIncomeApproach || false}
                  onChange={(e) => handleFieldChange('useIncomeApproach', e.target.checked)}
                  size="small"
                />
              }
              label="Income Approach"
              sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Extraordinary Assumptions */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Extraordinary Assumptions</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.hasExtraordinaryAssumptions || 'no'}
              onChange={(e) => handleFieldChange('hasExtraordinaryAssumptions', e.target.value)}
            >
              <FormControlLabel
                value="no"
                control={<Radio size="small" />}
                label="No"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="yes"
                control={<Radio size="small" />}
                label="Yes - As if 100% Complete"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
            </RadioGroup>
          </Box>
        </Box>

        {/* Hypothetical Conditions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Hypothetical Conditions</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.hasHypotheticalConditions || 'no'}
              onChange={(e) => handleFieldChange('hasHypotheticalConditions', e.target.value)}
            >
              <FormControlLabel
                value="no"
                control={<Radio size="small" />}
                label="No"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
              <FormControlLabel
                value="yes"
                control={<Radio size="small" />}
                label="Yes - As if 100% Complete (new construction/renovation)"
                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
