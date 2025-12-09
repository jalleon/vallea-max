'use client';

import { TextField, Typography, Box, Checkbox, FormControlLabel } from '@mui/material';

interface NeighborhoodSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function NeighborhoodSection({
  formData,
  handleFieldChange,
  appraisalData
}: NeighborhoodSectionProps) {

  const renderCheckbox = (field: string, label: string) => (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={formData[field] || false}
          onChange={(e) => handleFieldChange(field, e.target.checked)}
        />
      }
      label={<Typography variant="body2">{label}</Typography>}
      sx={{ mr: 2, minWidth: 'auto' }}
    />
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* NEIGHBOURHOOD */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ bgcolor: '#00897b', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            NEIGHBOURHOOD
          </Typography>
        </Box>

        {/* Land Use Types Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {/* Left Column - Land Use & Conditions */}
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', p: 1.5 }}>
            {/* Land Use Types */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
              {renderCheckbox('landUseResidential', 'Residential')}
              {renderCheckbox('landUseCommercial', 'Commercial')}
              {renderCheckbox('landUseIndustrial', 'Industrial')}
              {renderCheckbox('landUseAgricultural', 'Agricultural')}
              {renderCheckbox('landUseFirstNations', 'First Nations/Indigenous Land')}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
              {renderCheckbox('landUseUrban', 'Urban')}
              {renderCheckbox('landUseSuburban', 'Suburban')}
              {renderCheckbox('landUseRural', 'Rural')}
              {renderCheckbox('landUseRecreational', 'Recreational/Resort')}
              {renderCheckbox('landUseForestry', 'Forestry/Public/Park')}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
              {renderCheckbox('conditionImproving', 'Improving')}
              {renderCheckbox('conditionStable', 'Stable')}
              {renderCheckbox('conditionTransitioning', 'Transitioning')}
              {renderCheckbox('conditionDeteriorating', 'Deteriorating')}
            </Box>

            {/* Built-Up */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mr: 2, minWidth: 70 }}>BUILT-UP:</Typography>
              {renderCheckbox('builtUpOver75', 'Over 75%')}
              {renderCheckbox('builtUp25to75', '25 - 75%')}
              {renderCheckbox('builtUpUnder25', 'Under 25%')}
            </Box>

            {/* Subject Typical for NBHD */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mr: 2, minWidth: 180 }}>SUBJECT TYPICAL FOR NBHD:</Typography>
              {renderCheckbox('subjectTypicalYes', 'Yes')}
              {renderCheckbox('subjectTypicalNo', 'No (see comments)')}
            </Box>

            {/* Detrimental Conditions */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {renderCheckbox('detrimentalConditions', 'Detrimental Conditions Observed')}
              <TextField
                size="small"
                placeholder="Towers (communication, high voltage)"
                value={formData.detrimentalConditionsDetails || ''}
                onChange={(e) => handleFieldChange('detrimentalConditionsDetails', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
          </Box>

          {/* Right Column - Age Range, Price Range, Market Overview */}
          <Box sx={{ p: 1.5 }}>
            {/* Age Range */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr 1fr',
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 1
              }}
            >
              <Box sx={{ p: 1, bgcolor: 'grey.100', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>AGE RANGE (years):</Typography>
              </Box>
              <Box sx={{ p: 1, borderLeft: '1px solid', borderColor: 'divider' }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="From"
                  value={formData.ageRangeFrom || ''}
                  onChange={(e) => handleFieldChange('ageRangeFrom', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Box>
              <Box sx={{ p: 1, borderLeft: '1px solid', borderColor: 'divider' }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="To"
                  value={formData.ageRangeTo || ''}
                  onChange={(e) => handleFieldChange('ageRangeTo', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Box>
            </Box>

            {/* Price Range */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr 1fr',
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 2
              }}
            >
              <Box sx={{ p: 1, bgcolor: 'grey.100', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>PRICE RANGE:</Typography>
              </Box>
              <Box sx={{ p: 1, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  placeholder="From"
                  value={formData.priceRangeFrom || ''}
                  onChange={(e) => handleFieldChange('priceRangeFrom', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Box>
              <Box sx={{ p: 1, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  placeholder="To"
                  value={formData.priceRangeTo || ''}
                  onChange={(e) => handleFieldChange('priceRangeTo', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              </Box>
            </Box>

            {/* Market Overview */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>MARKET OVERVIEW</Typography>

              {/* Supply */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ width: 80 }}>Supply:</Typography>
                {renderCheckbox('supplyHigh', 'High')}
                {renderCheckbox('supplyAverage', 'Average')}
                {renderCheckbox('supplyLow', 'Low')}
              </Box>

              {/* Demand */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ width: 80 }}>Demand:</Typography>
                {renderCheckbox('demandHigh', 'High')}
                {renderCheckbox('demandAverage', 'Average')}
                {renderCheckbox('demandLow', 'Low')}
              </Box>
            </Box>

            {/* Price Trends */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>PRICE TRENDS:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderCheckbox('priceTrendIncreasing', 'Increasing')}
                {renderCheckbox('priceTrendStable', 'Stable')}
                {renderCheckbox('priceTrendDeclining', 'Declining')}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Comments Row */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>COMMENTS:</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            placeholder="Enter neighborhood comments..."
            value={formData.neighborhoodComments || ''}
            onChange={(e) => handleFieldChange('neighborhoodComments', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        </Box>
      </Box>
    </Box>
  );
}
