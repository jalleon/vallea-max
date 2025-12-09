'use client';

import { TextField, Typography, Box, Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';

interface NeighborhoodSiteSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function NeighborhoodSiteSection({
  formData,
  handleFieldChange,
}: NeighborhoodSiteSectionProps) {

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
      sx={{ mr: 1, minWidth: 'auto' }}
    />
  );

  const renderRow = (label: string, content: React.ReactNode, noBorder?: boolean) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        borderBottom: noBorder ? 'none' : '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        {content}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* ==================== NEIGHBOURHOOD ==================== */}
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
        <Box sx={{ bgcolor: '#00897b', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            NEIGHBOURHOOD
          </Typography>
        </Box>

        {/* Land Use */}
        {renderRow('Land Use', (
          <>
            {renderCheckbox('landUseResidential', 'Residential')}
            {renderCheckbox('landUseCommercial', 'Commercial')}
            {renderCheckbox('landUseIndustrial', 'Industrial')}
            {renderCheckbox('landUseAgricultural', 'Agricultural')}
            {renderCheckbox('landUseFirstNations', 'First Nations')}
          </>
        ))}

        {/* Location Type */}
        {renderRow('Location Type', (
          <>
            {renderCheckbox('landUseUrban', 'Urban')}
            {renderCheckbox('landUseSuburban', 'Suburban')}
            {renderCheckbox('landUseRural', 'Rural')}
            {renderCheckbox('landUseRecreational', 'Recreational')}
            {renderCheckbox('landUseForestry', 'Forestry/Park')}
          </>
        ))}

        {/* Condition */}
        {renderRow('Condition', (
          <>
            {renderCheckbox('conditionImproving', 'Improving')}
            {renderCheckbox('conditionStable', 'Stable')}
            {renderCheckbox('conditionTransitioning', 'Transitioning')}
            {renderCheckbox('conditionDeteriorating', 'Deteriorating')}
          </>
        ))}

        {/* Built-Up */}
        {renderRow('Built-Up', (
          <>
            {renderCheckbox('builtUpOver75', 'Over 75%')}
            {renderCheckbox('builtUp25to75', '25 - 75%')}
            {renderCheckbox('builtUpUnder25', 'Under 25%')}
          </>
        ))}

        {/* Subject Typical */}
        {renderRow('Subject Typical for NBHD', (
          <>
            {renderCheckbox('subjectTypicalYes', 'Yes')}
            {renderCheckbox('subjectTypicalNo', 'No (see comments)')}
          </>
        ))}

        {/* Age Range */}
        {renderRow('Age Range (years)', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <TextField
              size="small"
              placeholder="From"
              value={formData.ageRangeFrom || ''}
              onChange={(e) => handleFieldChange('ageRangeFrom', e.target.value)}
              sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <Typography variant="body2">to</Typography>
            <TextField
              size="small"
              placeholder="To"
              value={formData.ageRangeTo || ''}
              onChange={(e) => handleFieldChange('ageRangeTo', e.target.value)}
              sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Price Range */}
        {renderRow('Price Range', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Typography variant="body2">$</Typography>
            <TextField
              size="small"
              type="number"
              placeholder="From"
              value={formData.priceRangeFrom || ''}
              onChange={(e) => handleFieldChange('priceRangeFrom', e.target.value)}
              sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <Typography variant="body2">to $</Typography>
            <TextField
              size="small"
              type="number"
              placeholder="To"
              value={formData.priceRangeTo || ''}
              onChange={(e) => handleFieldChange('priceRangeTo', e.target.value)}
              sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Supply */}
        {renderRow('Market Supply', (
          <>
            {renderCheckbox('supplyHigh', 'High')}
            {renderCheckbox('supplyAverage', 'Average')}
            {renderCheckbox('supplyLow', 'Low')}
          </>
        ))}

        {/* Demand */}
        {renderRow('Market Demand', (
          <>
            {renderCheckbox('demandHigh', 'High')}
            {renderCheckbox('demandAverage', 'Average')}
            {renderCheckbox('demandLow', 'Low')}
          </>
        ))}

        {/* Price Trends */}
        {renderRow('Price Trends', (
          <>
            {renderCheckbox('priceTrendIncreasing', 'Increasing')}
            {renderCheckbox('priceTrendStable', 'Stable')}
            {renderCheckbox('priceTrendDeclining', 'Declining')}
          </>
        ))}

        {/* Detrimental Conditions */}
        {renderRow('Detrimental Conditions', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            {renderCheckbox('detrimentalConditions', 'Observed')}
            <TextField
              size="small"
              placeholder="Details (towers, high voltage, etc.)"
              value={formData.detrimentalConditionsDetails || ''}
              onChange={(e) => handleFieldChange('detrimentalConditionsDetails', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Comments */}
        {renderRow('Neighbourhood Comments', (
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Enter neighborhood comments..."
            value={formData.neighborhoodComments || ''}
            onChange={(e) => handleFieldChange('neighborhoodComments', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ), true)}
      </Box>

      {/* ==================== SITE ==================== */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ bgcolor: '#e65100', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            SITE
          </Typography>
        </Box>

        {/* Site Dimensions */}
        {renderRow('Site Dimensions', (
          <TextField
            fullWidth
            size="small"
            placeholder="e.g., 50' x 100', Irregular"
            value={formData.siteDimensions || ''}
            onChange={(e) => handleFieldChange('siteDimensions', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Lot Size */}
        {renderRow('Lot Size', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <TextField
              size="small"
              placeholder="Size"
              value={formData.lotSize || ''}
              onChange={(e) => handleFieldChange('lotSize', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Sq Ft"
              value={formData.lotSizeUnit || 'Sq Ft'}
              onChange={(e) => handleFieldChange('lotSizeUnit', e.target.value)}
              sx={{ width: 80, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Source */}
        {renderRow('Source', (
          <TextField
            fullWidth
            size="small"
            placeholder="Survey, Assessment, etc."
            value={formData.lotSizeSource || ''}
            onChange={(e) => handleFieldChange('lotSizeSource', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Topography */}
        {renderRow('Topography', (
          <TextField
            fullWidth
            size="small"
            placeholder="Level, Sloping, etc."
            value={formData.topography || ''}
            onChange={(e) => handleFieldChange('topography', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Configuration */}
        {renderRow('Configuration', (
          <TextField
            fullWidth
            size="small"
            placeholder="Regular, Irregular, Corner, etc."
            value={formData.configuration || ''}
            onChange={(e) => handleFieldChange('configuration', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Zoning Code */}
        {renderRow('Zoning Code/Description', (
          <TextField
            fullWidth
            size="small"
            value={formData.zoningCode || ''}
            onChange={(e) => handleFieldChange('zoningCode', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Zoning Source */}
        {renderRow('Zoning Source', (
          <TextField
            fullWidth
            size="small"
            placeholder="Online municipal zoning map"
            value={formData.zoningSource || ''}
            onChange={(e) => handleFieldChange('zoningSource', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Other Land Use Controls */}
        {renderRow('Other Land Use Controls', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <RadioGroup
              row
              value={formData.otherLandUseControls || ''}
              onChange={(e) => handleFieldChange('otherLandUseControls', e.target.value)}
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
            <TextField
              size="small"
              placeholder="Details"
              value={formData.otherLandUseControlsOther || ''}
              onChange={(e) => handleFieldChange('otherLandUseControlsOther', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Existing Use Conforms */}
        {renderRow('Existing Use Conforms', (
          <RadioGroup
            row
            value={formData.existingUseConforms || ''}
            onChange={(e) => handleFieldChange('existingUseConforms', e.target.value)}
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
          >
            <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
            <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
          </RadioGroup>
        ))}

        {/* In Floodplain */}
        {renderRow('In Floodplain/Flood Zone', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <RadioGroup
              row
              value={formData.inFloodZone || ''}
              onChange={(e) => handleFieldChange('inFloodZone', e.target.value)}
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
            <Typography variant="body2" sx={{ color: '#00897b', fontWeight: 600 }}>Flood Map Date:</Typography>
            <TextField
              size="small"
              type="date"
              value={formData.floodMapDate || ''}
              onChange={(e) => handleFieldChange('floodMapDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Easements */}
        {renderRow('Easements', (
          <TextField
            fullWidth
            size="small"
            placeholder="Assumed Typical"
            value={formData.easements || ''}
            onChange={(e) => handleFieldChange('easements', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ))}

        {/* Utilities */}
        {renderRow('Utilities', (
          <>
            {renderCheckbox('utilNaturalGas', 'Natural Gas')}
            {renderCheckbox('utilStormSewer', 'Storm Sewer')}
            {renderCheckbox('utilSanitarySewer', 'Sanitary Sewer')}
            {renderCheckbox('utilOpenDitch', 'Open Ditch')}
            {renderCheckbox('utilSeptic', 'Septic')}
            {renderCheckbox('utilHoldingTank', 'Holding Tank')}
          </>
        ))}

        {/* Water Supply */}
        {renderRow('Water Supply', (
          <>
            {renderCheckbox('waterMunicipal', 'Municipal')}
            {renderCheckbox('waterPrivateWell', 'Private Well')}
            {renderCheckbox('waterOther', 'Other')}
          </>
        ))}

        {/* Features */}
        {renderRow('Features', (
          <>
            {renderCheckbox('featGravelRoad', 'Gravel Road')}
            {renderCheckbox('featPavedRoad', 'Paved Road')}
            {renderCheckbox('featLane', 'Lane')}
            {renderCheckbox('featSidewalk', 'Sidewalk')}
            {renderCheckbox('featCurbs', 'Curbs')}
            {renderCheckbox('featStreetlights', 'Streetlights')}
          </>
        ))}

        {/* Electrical */}
        {renderRow('Electrical', (
          <>
            {renderCheckbox('elecOverhead', 'Overhead')}
            {renderCheckbox('elecUnderground', 'Underground')}
            {renderCheckbox('elecOffGrid', 'Off grid')}
          </>
        ))}

        {/* Driveway */}
        {renderRow('Driveway', (
          <>
            {renderCheckbox('drivewayPrivate', 'Private')}
            {renderCheckbox('drivewayShared', 'Shared')}
            {renderCheckbox('drivewayNone', 'None')}
            {renderCheckbox('drivewaySingle', 'Single')}
            {renderCheckbox('drivewayDouble', 'Double')}
            {renderCheckbox('drivewayUnderground', 'Underground')}
            {renderCheckbox('drivewayLaneway', 'Laneway')}
          </>
        ))}

        {/* Parking */}
        {renderRow('Parking', (
          <>
            {renderCheckbox('parkingGarage', 'Garage')}
            {renderCheckbox('parkingCarport', 'Carport')}
            {renderCheckbox('parkingDriveway', 'Driveway')}
            {renderCheckbox('parkingStreet', 'Street')}
            {renderCheckbox('parkingSeeComments', 'See Comments')}
          </>
        ))}

        {/* Landscaping */}
        {renderRow('Landscaping', (
          <>
            {renderCheckbox('landscapingGood', 'Good')}
            {renderCheckbox('landscapingAverage', 'Average')}
            {renderCheckbox('landscapingFair', 'Fair')}
            {renderCheckbox('landscapingPoorOther', 'Poor/Other')}
          </>
        ))}

        {/* Detrimental Conditions */}
        {renderRow('Site Detrimental Conditions', (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            {renderCheckbox('siteDetrimentalConditions', 'Observed')}
            <TextField
              size="small"
              placeholder="Underground fuel storage/tank"
              value={formData.siteDetrimentalDetails || ''}
              onChange={(e) => handleFieldChange('siteDetrimentalDetails', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        ))}

        {/* Site Comments */}
        {renderRow('Site Comments', (
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Additional site comments..."
            value={formData.siteComments || ''}
            onChange={(e) => handleFieldChange('siteComments', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        ), true)}
      </Box>
    </Box>
  );
}
