'use client';

import { useMemo } from 'react';
import { TextField, Typography, Box, Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';

interface ImprovementsSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

// Room types for the allocation grid
const ROOM_TYPES = [
  'entrance', 'living', 'dining', 'kitchen', 'family',
  'bedrooms', 'den', 'fullBath', 'partBath', 'laundry',
  'recRoom1', 'recRoom2', 'recRoom3'
];

const ROOM_LABELS = [
  'ENTRANCE', 'LIVING', 'DINING', 'KITCHEN', 'FAMILY',
  'BEDROOMS', 'DEN', 'FULL BATH', 'PART BATH', 'LAUNDRY',
  'Rec Room', 'Rec Room', 'Rec Room'
];

const FLOOR_LEVELS = ['main', 'second', 'third', 'basement'];
const FLOOR_LABELS = ['MAIN', 'SECOND', 'THIRD', 'BASEMENT'];

export default function ImprovementsSection({
  formData,
  handleFieldChange,
  appraisalData
}: ImprovementsSectionProps) {

  // Helper to render checkbox
  const renderCheckbox = (field: string, label: string) => (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={formData[field] || false}
          onChange={(e) => handleFieldChange(field, e.target.checked)}
        />
      }
      label={<Typography variant="body2" sx={{ fontSize: '12px' }}>{label}</Typography>}
      sx={{ mr: 1, minWidth: 'auto', '& .MuiFormControlLabel-label': { ml: 0.5 } }}
    />
  );

  // Helper to render condition checkboxes (Good/Average/Fair/Poor)
  const renderConditionCheckboxes = (fieldPrefix: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {renderCheckbox(`${fieldPrefix}Good`, 'Good')}
      {renderCheckbox(`${fieldPrefix}Average`, 'Average')}
      {renderCheckbox(`${fieldPrefix}Fair`, 'Fair')}
      {renderCheckbox(`${fieldPrefix}Poor`, 'Poor')}
    </Box>
  );

  // Get room count for a specific floor and room type
  const getRoomCount = (floor: string, roomType: string): number => {
    const key = `room_${floor}_${roomType}`;
    return parseInt(formData[key]) || 0;
  };

  // Get area for a specific floor
  const getFloorArea = (floor: string): number => {
    const key = `area_${floor}`;
    return parseFloat(formData[key]) || 0;
  };

  // Calculate totals
  const calculations = useMemo(() => {
    // Above grade totals (main + second + third)
    const aboveGradeFloors = ['main', 'second', 'third'];

    // Room totals by type (above grade only)
    const roomTotalsByType: Record<string, number> = {};
    ROOM_TYPES.forEach(type => {
      roomTotalsByType[type] = aboveGradeFloors.reduce((sum, floor) => sum + getRoomCount(floor, type), 0);
    });

    // Total rooms per floor
    const roomTotalsByFloor: Record<string, number> = {};
    [...FLOOR_LEVELS].forEach(floor => {
      roomTotalsByFloor[floor] = ROOM_TYPES.reduce((sum, type) => sum + getRoomCount(floor, type), 0);
    });

    // Above grade room total
    const aboveGradeRoomTotal = aboveGradeFloors.reduce((sum, floor) => sum + roomTotalsByFloor[floor], 0);

    // Total bedrooms (above grade)
    const totalBedrooms = roomTotalsByType['bedrooms'];

    // Total bathrooms (full + part, all floors including basement)
    const totalFullBath = FLOOR_LEVELS.reduce((sum, floor) => sum + getRoomCount(floor, 'fullBath'), 0);
    const totalPartBath = FLOOR_LEVELS.reduce((sum, floor) => sum + getRoomCount(floor, 'partBath'), 0);

    // Total area (above grade)
    const totalAboveGradeArea = aboveGradeFloors.reduce((sum, floor) => sum + getFloorArea(floor), 0);

    return {
      roomTotalsByType,
      roomTotalsByFloor,
      aboveGradeRoomTotal,
      totalBedrooms,
      totalFullBath,
      totalPartBath,
      totalAboveGradeArea
    };
  }, [formData]);

  // Grid cell style for room allocation
  const gridCellStyle = {
    border: '1px solid',
    borderColor: 'divider',
    p: 0.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32
  };

  const headerCellStyle = {
    ...gridCellStyle,
    bgcolor: '#e3f2fd',
    fontWeight: 600,
    fontSize: '10px'
  };

  const labelCellStyle = {
    ...gridCellStyle,
    bgcolor: 'grey.100',
    justifyContent: 'flex-start',
    pl: 1,
    fontWeight: 600
  };

  const totalCellStyle = {
    ...gridCellStyle,
    bgcolor: '#fff3e0',
    fontWeight: 600
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* IMPROVEMENTS Header */}
      <Box
        sx={{
          bgcolor: '#1565c0',
          p: 1,
          borderRadius: '8px 8px 0 0'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
          IMPROVEMENTS
        </Typography>
      </Box>

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: 'none', bgcolor: 'background.paper', overflow: 'hidden' }}>
        {/* TOP SECTION - Three columns on large screens, stacked on small */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          borderBottom: '2px solid',
          borderColor: 'divider'
        }}>

          {/* LEFT COLUMN - Building Info */}
          <Box sx={{ borderRight: { xs: 'none', md: '1px solid' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider', overflow: 'hidden', minWidth: 0 }}>
            {/* Year Built */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 160px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', wordBreak: 'break-word' }}>YEAR BUILT (estimated):</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={formData.yearBuilt || ''}
                  onChange={(e) => handleFieldChange('yearBuilt', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Year Additions */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 160px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>YEAR ADDITIONS (estimated):</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={formData.yearAdditions || ''}
                  onChange={(e) => handleFieldChange('yearAdditions', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Effective Age */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 160px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>EFFECTIVE AGE:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  value={formData.effectiveAge || ''}
                  onChange={(e) => handleFieldChange('effectiveAge', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
                <Typography variant="body2" sx={{ fontSize: '11px' }}>years</Typography>
              </Box>
            </Box>

            {/* Remaining Economic Life */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 160px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: '#b3e5fc', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#01579b' }}>REMAINING ECONOMIC LIFE:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  value={formData.remainingEconomicLife || ''}
                  onChange={(e) => handleFieldChange('remainingEconomicLife', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
                <Typography variant="body2" sx={{ fontSize: '11px' }}>years</Typography>
              </Box>
            </Box>

            {/* Checkboxes - Under Construction, Appraised As Is, As if Complete */}
            <Box sx={{ p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              {renderCheckbox('underConstruction', 'Under Construction')}
            </Box>
            <Box sx={{ p: 0.75, pl: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              {renderCheckbox('appraisedAsIs', 'Appraised As Is')}
            </Box>
            <Box sx={{ p: 0.75, pl: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              {renderCheckbox('asIfComplete', 'As if Complete (new construction/renovation)')}
            </Box>

            {/* Energy Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: '#b3e5fc', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#01579b' }}>Energy Label</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Not Provided"
                  value={formData.energyLabel || ''}
                  onChange={(e) => handleFieldChange('energyLabel', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: '#b3e5fc', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#e65100' }}>Efficiency Rating</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={formData.efficiencyRating || ''}
                  onChange={(e) => handleFieldChange('efficiencyRating', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: '#b3e5fc', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#e65100' }}>EV Charger Type</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Not Applicable"
                  value={formData.evChargerType || ''}
                  onChange={(e) => handleFieldChange('evChargerType', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Solar Panels */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', mr: 1 }}>Solar Panels</Typography>
              <RadioGroup
                row
                value={formData.solarPanels || ''}
                onChange={(e) => handleFieldChange('solarPanels', e.target.value)}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '11px' } }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="YES" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="NO" />
              </RadioGroup>
              <TextField
                size="small"
                placeholder="Leased as reported by owner"
                value={formData.solarPanelsDetails || ''}
                onChange={(e) => handleFieldChange('solarPanelsDetails', e.target.value)}
                sx={{ flex: 1, ml: 1, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
              />
            </Box>

            {/* Electrical */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>ELECTRICAL:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {renderCheckbox('elecFuses', 'Fuses')}
                {renderCheckbox('elecBreakers', 'Breakers')}
                <TextField
                  size="small"
                  placeholder="Knob and Tube"
                  value={formData.elecOther || ''}
                  onChange={(e) => handleFieldChange('elecOther', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Estimated Rated Capacity */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 200px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>ESTIMATED RATED CAPACITY OF MAIN PANEL:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  value={formData.mainPanelCapacity || ''}
                  onChange={(e) => handleFieldChange('mainPanelCapacity', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
                <Typography variant="body2" sx={{ fontSize: '11px' }}>amps</Typography>
              </Box>
            </Box>

            {/* Heating System */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>HEATING SYSTEM:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Forced Air"
                  value={formData.heatingSystem || ''}
                  onChange={(e) => handleFieldChange('heatingSystem', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
                <Typography variant="body2" sx={{ fontSize: '11px', color: '#00897b', fontWeight: 600 }}>fuel type</Typography>
                <TextField
                  size="small"
                  placeholder="Other (specify)"
                  value={formData.heatingFuelType || ''}
                  onChange={(e) => handleFieldChange('heatingFuelType', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Water Heater */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>WATER HEATER:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Natural Gas"
                  value={formData.waterHeater || ''}
                  onChange={(e) => handleFieldChange('waterHeater', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Cooling System */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>COOLING SYSTEM:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Heat Pump"
                  value={formData.coolingSystem || ''}
                  onChange={(e) => handleFieldChange('coolingSystem', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              </Box>
            </Box>
          </Box>

          {/* MIDDLE COLUMN - Property Type, Design, Construction */}
          <Box sx={{ borderRight: { xs: 'none', md: '1px solid' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider', overflow: 'hidden', minWidth: 0 }}>
            {/* Property Type */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>PROPERTY TYPE:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Link"
                  value={formData.propertyType || ''}
                  onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Design/Style */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>DESIGN/STYLE:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="3 or more Storey"
                  value={formData.designStyle || ''}
                  onChange={(e) => handleFieldChange('designStyle', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Construction */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>CONSTRUCTION:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Log"
                  value={formData.construction || ''}
                  onChange={(e) => handleFieldChange('construction', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Windows */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>WINDOWS:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', gap: 0.5 }}>
                <TextField
                  size="small"
                  placeholder="Other (specify)"
                  value={formData.windowsType || ''}
                  onChange={(e) => handleFieldChange('windowsType', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
                <TextField
                  size="small"
                  placeholder="Other (specify)"
                  value={formData.windowsType2 || ''}
                  onChange={(e) => handleFieldChange('windowsType2', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Basement */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>BASEMENT:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Other (specify)"
                  value={formData.basementType || ''}
                  onChange={(e) => handleFieldChange('basementType', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Basement Area */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: '#b3e5fc', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#01579b' }}>BASEMENT AREA:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  value={formData.basementArea || ''}
                  onChange={(e) => handleFieldChange('basementArea', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
                <Typography variant="body2" sx={{ fontSize: '11px' }}>Sq Ft</Typography>
              </Box>
            </Box>

            {/* Basement Finish */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: '#b3e5fc', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#01579b' }}>BASEMENT FINISH:</Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  value={formData.basementFinish || ''}
                  onChange={(e) => handleFieldChange('basementFinish', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
                <Typography variant="body2" sx={{ fontSize: '11px' }}>%</Typography>
              </Box>
            </Box>

            {/* Foundation Walls */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 120px) 1fr', borderBottom: '2px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>FOUNDATION WALLS:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Insulated Concrete Forms"
                  value={formData.foundationWalls || ''}
                  onChange={(e) => handleFieldChange('foundationWalls', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Interior Finish Section */}
            <Box sx={{ bgcolor: '#e8f5e9', p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#2e7d32' }}>INTERIOR FINISH:</Typography>
            </Box>

            {/* Walls/Ceilings checkboxes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}></Box>
              <Box sx={{ p: 0.5, borderRight: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '10px', fontWeight: 600, color: '#00897b' }}>Walls</Typography>
              </Box>
              <Box sx={{ p: 0.5, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '10px', fontWeight: 600, color: '#00897b' }}>Ceilings</Typography>
              </Box>
            </Box>

            {/* Drywall */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontSize: '10px' }}>Drywall</Typography>
              </Box>
              <Box sx={{ p: 0.25, borderRight: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.drywallWalls || false} onChange={(e) => handleFieldChange('drywallWalls', e.target.checked)} />
              </Box>
              <Box sx={{ p: 0.25, display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.drywallCeilings || false} onChange={(e) => handleFieldChange('drywallCeilings', e.target.checked)} />
              </Box>
            </Box>

            {/* Plaster */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontSize: '10px' }}>Plaster</Typography>
              </Box>
              <Box sx={{ p: 0.25, borderRight: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.plasterWalls || false} onChange={(e) => handleFieldChange('plasterWalls', e.target.checked)} />
              </Box>
              <Box sx={{ p: 0.25, display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.plasterCeilings || false} onChange={(e) => handleFieldChange('plasterCeilings', e.target.checked)} />
              </Box>
            </Box>

            {/* Paneling */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontSize: '10px' }}>Paneling</Typography>
              </Box>
              <Box sx={{ p: 0.25, borderRight: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.panelingWalls || false} onChange={(e) => handleFieldChange('panelingWalls', e.target.checked)} />
              </Box>
              <Box sx={{ p: 0.25, display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.panelingCeilings || false} onChange={(e) => handleFieldChange('panelingCeilings', e.target.checked)} />
              </Box>
            </Box>

            {/* Other / T-Bar */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontSize: '10px' }}>Other</Typography>
              </Box>
              <Box sx={{ p: 0.25, borderRight: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Checkbox size="small" checked={formData.otherWalls || false} onChange={(e) => handleFieldChange('otherWalls', e.target.checked)} />
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '10px', mr: 0.5 }}>T-Bar</Typography>
                <Checkbox size="small" checked={formData.tbarCeilings || false} onChange={(e) => handleFieldChange('tbarCeilings', e.target.checked)} />
              </Box>
            </Box>

            {/* Plumbing Lines */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>PLUMBING LINES:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Kitec"
                  value={formData.plumbingLines || ''}
                  onChange={(e) => handleFieldChange('plumbingLines', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Built-ins */}
            <Box sx={{ p: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', mb: 0.5 }}>BUILT-INS:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {renderCheckbox('builtInCooktop', 'Cooktop')}
                {renderCheckbox('builtInOven', 'Oven')}
                {renderCheckbox('builtInDishwasher', 'Dishwasher')}
                {renderCheckbox('builtInMicrowave', 'Microwave')}
                {renderCheckbox('builtInWaterSoftener', 'Water Softener')}
              </Box>
            </Box>

            {/* Extras */}
            <Box sx={{ p: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', mb: 0.5 }}>EXTRAS:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {renderCheckbox('extraSecuritySystem', 'Security System')}
                {renderCheckbox('extraFireplaceGas', 'Fireplace (Gas)')}
                {renderCheckbox('extraPool', 'Pool')}
                {renderCheckbox('extraHRVVentillator', 'HR/ER Ventillator')}
                {renderCheckbox('extraOther', 'Other (specify)')}
              </Box>
              {formData.extraOther && (
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Specify other extras..."
                  value={formData.extraOtherDetails || ''}
                  onChange={(e) => handleFieldChange('extraOtherDetails', e.target.value)}
                  sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              )}
            </Box>

            {/* Overall Interior Condition */}
            <Box sx={{ p: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', mb: 0.5 }}>OVERALL INT. COND.:</Typography>
              {renderConditionCheckboxes('intCond')}
              <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Source of Interior Information: Observed by AIC Member
              </Typography>
            </Box>
          </Box>

          {/* RIGHT COLUMN - Roofing, Exterior */}
          <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
            {/* Roofing */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>ROOFING:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="PVC/Polycarbonate/Plastic"
                  value={formData.roofing || ''}
                  onChange={(e) => handleFieldChange('roofing', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Roofing Condition */}
            <Box sx={{ p: 0.75, borderBottom: '2px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontSize: '11px', mb: 0.5 }}>Condition:</Typography>
              {renderConditionCheckboxes('roofCond')}
            </Box>

            {/* Exterior Finish */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>EXTERIOR FINISH:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Log"
                  value={formData.exteriorFinish || ''}
                  onChange={(e) => handleFieldChange('exteriorFinish', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>

            {/* Exterior Condition */}
            <Box sx={{ p: 0.75, borderBottom: '2px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontSize: '11px', mb: 0.5 }}>Condition:</Typography>
              {renderConditionCheckboxes('extCond')}
            </Box>

            {/* Flooring section */}
            <Box sx={{ bgcolor: '#e8f5e9', p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: '#2e7d32' }}>Flooring:</Typography>
            </Box>
            <Box sx={{ p: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {renderCheckbox('floorCeramic', 'Ceramic')}
                {renderCheckbox('floorLaminate', 'Laminate')}
                {renderCheckbox('floorOther', 'Other (specify)')}
              </Box>
              {formData.floorOther && (
                <TextField
                  size="small"
                  fullWidth
                  value={formData.floorOtherDetails || ''}
                  onChange={(e) => handleFieldChange('floorOtherDetails', e.target.value)}
                  sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
                />
              )}
            </Box>

            {/* Info Source */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 80px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>Info Source:</Typography>
              </Box>
              <Box sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={formData.infoSource || ''}
                  onChange={(e) => handleFieldChange('infoSource', e.target.value)}
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ROOM ALLOCATION SECTION */}
        <Box sx={{ bgcolor: '#e3f2fd', p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12px', color: '#1565c0' }}>
            ROOM ALLOCATION
          </Typography>
        </Box>

        {/* Room Allocation Grid - Fixed within frame */}
        <Box sx={{ overflow: 'hidden' }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(50px, 60px) repeat(13, minmax(30px, 1fr)) minmax(40px, 60px) minmax(40px, 60px)',
            fontSize: '10px'
          }}>
            {/* Header Row */}
            <Box sx={headerCellStyle}>
              <Typography sx={{ fontSize: '8px', fontWeight: 600 }}>LEVEL</Typography>
            </Box>
            {ROOM_LABELS.map((label, idx) => (
              <Box key={idx} sx={headerCellStyle}>
                <Typography sx={{ fontSize: '7px', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>{label}</Typography>
              </Box>
            ))}
            <Box sx={headerCellStyle}>
              <Typography sx={{ fontSize: '7px', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>ROOM TOTAL</Typography>
            </Box>
            <Box sx={headerCellStyle}>
              <Typography sx={{ fontSize: '8px', fontWeight: 600 }}>AREA</Typography>
            </Box>

            {/* MAIN Row */}
            <Box sx={labelCellStyle}>
              <Typography sx={{ fontSize: '9px', fontWeight: 600 }}>MAIN</Typography>
            </Box>
            {ROOM_TYPES.map((type, idx) => (
              <Box key={idx} sx={gridCellStyle}>
                <TextField
                  size="small"
                  type="number"
                  value={formData[`room_main_${type}`] || ''}
                  onChange={(e) => handleFieldChange(`room_main_${type}`, e.target.value)}
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
                />
              </Box>
            ))}
            <Box sx={totalCellStyle}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{calculations.roomTotalsByFloor.main || 0}</Typography>
            </Box>
            <Box sx={gridCellStyle}>
              <TextField
                size="small"
                type="number"
                value={formData.area_main || ''}
                onChange={(e) => handleFieldChange('area_main', e.target.value)}
                inputProps={{ style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
              />
            </Box>

            {/* SECOND Row */}
            <Box sx={labelCellStyle}>
              <Typography sx={{ fontSize: '9px', fontWeight: 600 }}>SECOND</Typography>
            </Box>
            {ROOM_TYPES.map((type, idx) => (
              <Box key={idx} sx={gridCellStyle}>
                <TextField
                  size="small"
                  type="number"
                  value={formData[`room_second_${type}`] || ''}
                  onChange={(e) => handleFieldChange(`room_second_${type}`, e.target.value)}
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
                />
              </Box>
            ))}
            <Box sx={totalCellStyle}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{calculations.roomTotalsByFloor.second || 0}</Typography>
            </Box>
            <Box sx={gridCellStyle}>
              <TextField
                size="small"
                type="number"
                value={formData.area_second || ''}
                onChange={(e) => handleFieldChange('area_second', e.target.value)}
                inputProps={{ style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
              />
            </Box>

            {/* THIRD Row */}
            <Box sx={labelCellStyle}>
              <Typography sx={{ fontSize: '9px', fontWeight: 600 }}>THIRD</Typography>
            </Box>
            {ROOM_TYPES.map((type, idx) => (
              <Box key={idx} sx={gridCellStyle}>
                <TextField
                  size="small"
                  type="number"
                  value={formData[`room_third_${type}`] || ''}
                  onChange={(e) => handleFieldChange(`room_third_${type}`, e.target.value)}
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
                />
              </Box>
            ))}
            <Box sx={totalCellStyle}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{calculations.roomTotalsByFloor.third || 0}</Typography>
            </Box>
            <Box sx={gridCellStyle}>
              <TextField
                size="small"
                type="number"
                value={formData.area_third || ''}
                onChange={(e) => handleFieldChange('area_third', e.target.value)}
                inputProps={{ style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
              />
            </Box>

            {/* ABOVE GRADE TOTALS Row */}
            <Box sx={{ ...labelCellStyle, bgcolor: '#fff3e0', gridColumn: 'span 2' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 600 }}>ABOVE GRADE:</Typography>
            </Box>
            <Box sx={{ ...totalCellStyle, justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{calculations.aboveGradeRoomTotal}</Typography>
            </Box>
            <Box sx={{ ...totalCellStyle, gridColumn: 'span 3' }}></Box>
            <Box sx={{ ...totalCellStyle, gridColumn: 'span 2', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '8px', mr: 0.25 }}>BED:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#1565c0' }}>{calculations.totalBedrooms}</Typography>
            </Box>
            <Box sx={{ ...totalCellStyle, gridColumn: 'span 2', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#1565c0' }}>{calculations.totalFullBath}</Typography>
              <Typography sx={{ fontSize: '8px', color: '#e65100', mx: 0.25 }}>F</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#1565c0' }}>{calculations.totalPartBath}</Typography>
              <Typography sx={{ fontSize: '8px', color: '#e65100' }}>P</Typography>
            </Box>
            <Box sx={{ ...totalCellStyle, gridColumn: 'span 5' }}></Box>
            <Box sx={{ ...totalCellStyle, bgcolor: '#c8e6c9' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{calculations.totalAboveGradeArea || 0}</Typography>
            </Box>

            {/* BASEMENT Row */}
            <Box sx={{ ...labelCellStyle, bgcolor: '#e0e0e0' }}>
              <Typography sx={{ fontSize: '9px', fontWeight: 600 }}>BSMT</Typography>
            </Box>
            {ROOM_TYPES.map((type, idx) => (
              <Box key={idx} sx={gridCellStyle}>
                <TextField
                  size="small"
                  type="number"
                  value={formData[`room_basement_${type}`] || ''}
                  onChange={(e) => handleFieldChange(`room_basement_${type}`, e.target.value)}
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
                />
              </Box>
            ))}
            <Box sx={totalCellStyle}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{calculations.roomTotalsByFloor.basement || 0}</Typography>
            </Box>
            <Box sx={gridCellStyle}>
              <TextField
                size="small"
                type="number"
                value={formData.area_basement || ''}
                onChange={(e) => handleFieldChange('area_basement', e.target.value)}
                inputProps={{ style: { textAlign: 'center', fontSize: '10px', padding: '1px' } }}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, width: '100%' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Source of Measurement / Unit of Measurement */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 600 }}>SOURCE OF MEASUREMENT:</Typography>
          <TextField
            size="small"
            placeholder="Other (specify)"
            value={formData.sourceOfMeasurement || ''}
            onChange={(e) => handleFieldChange('sourceOfMeasurement', e.target.value)}
            sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
          />
          <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 600 }}>UNIT OF MEASUREMENT:</Typography>
          <TextField
            size="small"
            placeholder="SqM"
            value={formData.unitOfMeasurement || ''}
            onChange={(e) => handleFieldChange('unitOfMeasurement', e.target.value)}
            sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
          />
        </Box>

        {/* GARAGE/PARKING Section */}
        <Box sx={{ bgcolor: '#e3f2fd', p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12px', color: '#1565c0' }}>
            GARAGE/PARKING
          </Typography>
        </Box>
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {renderCheckbox('garageAttached', 'Attached')}
            {renderCheckbox('garageDetached', 'Detached')}
            {renderCheckbox('garageBuiltIn', 'Built-in')}
            {renderCheckbox('garageSingle', 'Single')}
            {renderCheckbox('garageDouble', 'Double')}
            {renderCheckbox('garageTriple', 'Triple')}
            {renderCheckbox('garageUnderground', 'Underground')}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {renderCheckbox('garageSecond', 'Second Garage (size)')}
            {formData.garageSecond && (
              <TextField
                size="small"
                value={formData.garageSecondSize || ''}
                onChange={(e) => handleFieldChange('garageSecondSize', e.target.value)}
                sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {renderCheckbox('carport', 'Carport (size)')}
            {formData.carport && (
              <TextField
                size="small"
                value={formData.carportSize || ''}
                onChange={(e) => handleFieldChange('carportSize', e.target.value)}
                sx={{ width: 150, '& .MuiInputBase-input': { fontSize: '11px', p: 0.5 } }}
              />
            )}
          </Box>
        </Box>

        {/* SITE IMPROVEMENTS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>SITE IMPROVEMENTS:</Typography>
          </Box>
          <Box sx={{ p: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              value={formData.siteImprovements || ''}
              onChange={(e) => handleFieldChange('siteImprovements', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
            />
          </Box>
        </Box>

        {/* DETRIMENTAL CONDITIONS */}
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {renderCheckbox('detrimentalConditionsObserved', 'Detrimental Conditions Observed')}
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', ml: 3 }}>
            Damaged by (specify Fire, Flood, Earthquake, Landslide, Tornado, Storm, Other, Unknown)
          </Typography>
          {formData.detrimentalConditionsObserved && (
            <TextField
              size="small"
              fullWidth
              value={formData.detrimentalConditionsDetails || ''}
              onChange={(e) => handleFieldChange('detrimentalConditionsDetails', e.target.value)}
              sx={{ mt: 0.5, ml: 3, width: 'calc(100% - 24px)', '& .MuiInputBase-input': { fontSize: '12px', p: 0.5 } }}
            />
          )}
        </Box>

        {/* COMMENTS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>COMMENTS:</Typography>
          </Box>
          <Box sx={{ p: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              multiline
              rows={3}
              value={formData.improvementsComments || ''}
              onChange={(e) => handleFieldChange('improvementsComments', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
            />
          </Box>
        </Box>

        {/* BASEMENT */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 100px) 1fr' }}>
          <Box sx={{ p: 0.75, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>BASEMENT:</Typography>
          </Box>
          <Box sx={{ p: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              multiline
              rows={3}
              value={formData.basementComments || ''}
              onChange={(e) => handleFieldChange('basementComments', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
