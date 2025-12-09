'use client';

import { TextField, Typography, Box, Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';

interface SiteSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function SiteSection({
  formData,
  handleFieldChange,
  appraisalData
}: SiteSectionProps) {

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

  const renderYesNo = (field: string, label: string, showOther?: boolean) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 180, mr: 1 }}>{label}</Typography>
      <RadioGroup
        row
        value={formData[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
      >
        <FormControlLabel value="yes" control={<Radio size="small" />} label="YES" />
        <FormControlLabel value="no" control={<Radio size="small" />} label="NO" />
      </RadioGroup>
      {showOther && (
        <TextField
          size="small"
          placeholder="Other"
          value={formData[`${field}Other`] || ''}
          onChange={(e) => handleFieldChange(`${field}Other`, e.target.value)}
          sx={{ ml: 1, flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* SITE */}
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

        {/* Main Content - Two Columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {/* Left Column - Site Info */}
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', p: 1.5 }}>
            {/* Site Dimensions */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>SITE DIMENSIONS:</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., 50' x 100', Irregular"
                value={formData.siteDimensions || ''}
                onChange={(e) => handleFieldChange('siteDimensions', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Lot Size */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 70 }}>LOT SIZE:</Typography>
              <TextField
                size="small"
                placeholder="Size"
                value={formData.lotSize || ''}
                onChange={(e) => handleFieldChange('lotSize', e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
              <Typography variant="body2" sx={{ mx: 1 }}>Unit of Measurement_</Typography>
              <TextField
                size="small"
                placeholder="Sq Ft"
                value={formData.lotSizeUnit || 'Sq Ft'}
                onChange={(e) => handleFieldChange('lotSizeUnit', e.target.value)}
                sx={{ width: 80, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Source */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 70 }}>SOURCE:</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Survey, Assessment, etc."
                value={formData.lotSizeSource || ''}
                onChange={(e) => handleFieldChange('lotSizeSource', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Topography */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100 }}>TOPOGRAPHY:</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Level, Sloping, etc."
                value={formData.topography || ''}
                onChange={(e) => handleFieldChange('topography', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Configuration */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100 }}>CONFIGURATION:</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Regular, Irregular, Corner, etc."
                value={formData.configuration || ''}
                onChange={(e) => handleFieldChange('configuration', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Zoning Code/Description */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 160 }}>ZONING CODE/DESCRIPTION:</Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.zoningCode || ''}
                onChange={(e) => handleFieldChange('zoningCode', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Zoning Source */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>ZONING SOURCE:</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Online municipal zoning map"
                value={formData.zoningSource || ''}
                onChange={(e) => handleFieldChange('zoningSource', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Other Land Use Controls */}
            {renderYesNo('otherLandUseControls', 'OTHER LAND USE CONTROLS:', true)}

            {/* Existing Use Conforms */}
            {renderYesNo('existingUseConforms', 'EXISTING USE CONFORMS:')}

            {/* In Floodplain/Flood Zone */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 180, mr: 1 }}>IN FLOODPLAIN/FLOOD ZONE:</Typography>
              <RadioGroup
                row
                value={formData.inFloodZone || ''}
                onChange={(e) => handleFieldChange('inFloodZone', e.target.value)}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="YES" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="NO" />
              </RadioGroup>
              <Typography variant="body2" sx={{ mx: 1, color: '#00897b', fontWeight: 600 }}>FLOOD MAP DATE:</Typography>
              <TextField
                size="small"
                type="date"
                value={formData.floodMapDate || ''}
                onChange={(e) => handleFieldChange('floodMapDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>

            {/* Easements */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90 }}>EASEMENTS:</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Assumed Typical"
                value={formData.easements || ''}
                onChange={(e) => handleFieldChange('easements', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
              />
            </Box>
          </Box>

          {/* Right Column - Utilities & Features */}
          <Box sx={{ p: 1.5 }}>
            {/* Utilities */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90 }}>UTILITIES:</Typography>
                {renderCheckbox('utilNaturalGas', 'Natural Gas')}
                {renderCheckbox('utilStormSewer', 'Storm Sewer')}
                {renderCheckbox('utilSanitarySewer', 'Sanitary Sewer')}
                {renderCheckbox('utilOpenDitch', 'Open Ditch')}
                {renderCheckbox('utilSeptic', 'Septic')}
                {renderCheckbox('utilHoldingTank', 'Holding Tank')}
              </Box>
            </Box>

            {/* Water Supply */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100 }}>WATER SUPPLY:</Typography>
              {renderCheckbox('waterMunicipal', 'Municipal')}
              {renderCheckbox('waterPrivateWell', 'Private Well')}
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={formData.waterOther || false}
                    onChange={(e) => handleFieldChange('waterOther', e.target.checked)}
                  />
                }
                label={<Typography variant="body2">Other</Typography>}
                sx={{ mr: 0 }}
              />
            </Box>

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1, mt: 1 }} />

            {/* Features */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>FEATURES:</Typography>
              {renderCheckbox('featGravelRoad', 'Gravel Road')}
              {renderCheckbox('featPavedRoad', 'Paved Road')}
              {renderCheckbox('featLane', 'Lane')}
              {renderCheckbox('featSidewalk', 'Sidewalk')}
              {renderCheckbox('featCurbs', 'Curbs')}
              {renderCheckbox('featStreetlights', 'Streetlights')}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 10 }}>
              {renderCheckbox('featOther', 'Other (specify)')}
              {formData.featOther && (
                <TextField
                  size="small"
                  value={formData.featOtherDetails || ''}
                  onChange={(e) => handleFieldChange('featOtherDetails', e.target.value)}
                  sx={{ ml: 1, flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            </Box>

            {/* Electrical */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90 }}>ELECTRICAL:</Typography>
              {renderCheckbox('elecOverhead', 'Overhead')}
              {renderCheckbox('elecUnderground', 'Underground')}
              {renderCheckbox('elecOffGrid', 'Off grid')}
            </Box>

            {/* Driveway */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90 }}>DRIVEWAY:</Typography>
              {renderCheckbox('drivewayPrivate', 'Private')}
              {renderCheckbox('drivewayShared', 'Shared')}
              {renderCheckbox('drivewayNone', 'None')}
              {renderCheckbox('drivewaySingle', 'Single')}
              {renderCheckbox('drivewayDouble', 'Double')}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 10 }}>
              {renderCheckbox('drivewayUnderground', 'Underground')}
              {renderCheckbox('drivewayLaneway', 'Laneway')}
            </Box>

            {/* Parking */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>PARKING:</Typography>
              {renderCheckbox('parkingGarage', 'Garage')}
              {renderCheckbox('parkingCarport', 'Carport')}
              {renderCheckbox('parkingDriveway', 'Driveway')}
              {renderCheckbox('parkingStreet', 'Street')}
              {renderCheckbox('parkingSeeComments', 'See Comments')}
            </Box>

            {/* Landscaping */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100 }}>LANDSCAPING:</Typography>
              {renderCheckbox('landscapingGood', 'Good')}
              {renderCheckbox('landscapingAverage', 'Average')}
              {renderCheckbox('landscapingFair', 'Fair')}
              {renderCheckbox('landscapingPoorOther', 'Poor/Other')}
            </Box>
          </Box>
        </Box>

        {/* Detrimental Conditions Row */}
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderCheckbox('siteDetrimentalConditions', 'Detrimental Conditions Observed')}
            <TextField
              size="small"
              placeholder="Underground fuel storage/tank"
              value={formData.siteDetrimentalDetails || ''}
              onChange={(e) => handleFieldChange('siteDetrimentalDetails', e.target.value)}
              sx={{ flex: 1, ml: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Comments Row */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>SITE COMMENTS:</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Additional site comments..."
            value={formData.siteComments || ''}
            onChange={(e) => handleFieldChange('siteComments', e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        </Box>
      </Box>
    </Box>
  );
}
