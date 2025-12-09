'use client';

import { TextField, Typography, Box, Autocomplete } from '@mui/material';

interface ImprovementsSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function ImprovementsSection({
  formData,
  handleFieldChange,
  appraisalData
}: ImprovementsSectionProps) {

  const designStyleOptions = ['Bungalow', '1 Storey', '1 1/2 Storey', '2 Storey', 'Split Level', 'Bi-Level', 'Townhouse', 'Other'];
  const conditionOptions = ['Excellent', 'Good', 'Average', 'Fair', 'Poor'];
  const foundationTypeOptions = ['Concrete', 'Stone', 'Block', 'Wood', 'Piers', 'Slab on Grade'];
  const basementTypeOptions = ['Full Basement', 'Partial Basement', 'Crawl Space', 'None'];
  const exteriorWallsOptions = ['Brick', 'Vinyl Siding', 'Wood Siding', 'Aluminum Siding', 'Stucco', 'Stone', 'Combination'];
  const roofSurfaceOptions = ['Asphalt Shingle', 'Metal', 'Tile', 'Slate', 'Tar & Gravel', 'Other'];
  const windowsOptions = ['Vinyl', 'Wood', 'Aluminum', 'Combination'];
  const stormWindowsOptions = ['Yes', 'No', 'Partial'];
  const heatingTypeOptions = ['Forced Air Gas', 'Forced Air Oil', 'Forced Air Electric', 'Hot Water Gas', 'Hot Water Oil', 'Electric Baseboard', 'Heat Pump', 'Other'];
  const airConditioningOptions = ['Central Air', 'Window Units', 'None'];

  return (
    <Box sx={{ p: 3 }}>
      {/* GENERAL BUILDING INFORMATION */}
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
            GENERAL BUILDING INFORMATION (Page 6)
          </Typography>
        </Box>

        {/* Year Built / Effective Age */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Year Built / Effective Age</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              placeholder="Year Built"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleFieldChange('yearBuilt', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Effective Age (years)"
              value={formData.effectiveAge || ''}
              onChange={(e) => handleFieldChange('effectiveAge', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Design Style */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Design/Style</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
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
          </Box>
        </Box>

        {/* Condition / Quality */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Condition / Quality</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={conditionOptions}
              value={formData.overallCondition || ''}
              onChange={(e, newValue) => handleFieldChange('overallCondition', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('overallCondition', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Overall Condition"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={conditionOptions}
              value={formData.constructionQuality || ''}
              onChange={(e, newValue) => handleFieldChange('constructionQuality', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('constructionQuality', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Construction Quality"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Box>

      {/* FOUNDATION */}
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
            FOUNDATION
          </Typography>
        </Box>

        {/* Foundation Type / Basement */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Foundation / Basement</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={foundationTypeOptions}
              value={formData.foundationType || ''}
              onChange={(e, newValue) => handleFieldChange('foundationType', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('foundationType', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Foundation Type"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={basementTypeOptions}
              value={formData.basementType || ''}
              onChange={(e, newValue) => handleFieldChange('basementType', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('basementType', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Basement Type"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Basement Areas */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Basement Area (sq.ft.)</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              placeholder="Finished Area"
              value={formData.basementFinishedArea || ''}
              onChange={(e) => handleFieldChange('basementFinishedArea', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Unfinished Area"
              value={formData.basementUnfinishedArea || ''}
              onChange={(e) => handleFieldChange('basementUnfinishedArea', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* EXTERIOR */}
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
            EXTERIOR
          </Typography>
        </Box>

        {/* Exterior Walls / Roof */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Exterior Walls / Roof</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={exteriorWallsOptions}
              value={formData.exteriorWalls || ''}
              onChange={(e, newValue) => handleFieldChange('exteriorWalls', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('exteriorWalls', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Exterior Walls"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={roofSurfaceOptions}
              value={formData.roofSurface || ''}
              onChange={(e, newValue) => handleFieldChange('roofSurface', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('roofSurface', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Roof Surface"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Windows */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Windows / Storm</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={windowsOptions}
              value={formData.windows || ''}
              onChange={(e, newValue) => handleFieldChange('windows', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('windows', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Windows"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={stormWindowsOptions}
              value={formData.stormWindows || ''}
              onChange={(e, newValue) => handleFieldChange('stormWindows', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('stormWindows', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Storm Windows/Screens"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Box>

      {/* INTERIOR FINISH */}
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
            INTERIOR FINISH
          </Typography>
        </Box>

        {/* Floors / Walls / Ceilings */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Floors / Walls / Ceilings</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Floors (e.g., Hardwood)"
              value={formData.floors || ''}
              onChange={(e) => handleFieldChange('floors', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Walls (e.g., Drywall)"
              value={formData.walls || ''}
              onChange={(e) => handleFieldChange('walls', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Ceilings"
              value={formData.ceilings || ''}
              onChange={(e) => handleFieldChange('ceilings', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* MECHANICAL SYSTEMS */}
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
            MECHANICAL SYSTEMS
          </Typography>
        </Box>

        {/* Heating / Air Conditioning */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Heating / AC</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={heatingTypeOptions}
              value={formData.heatingType || ''}
              onChange={(e, newValue) => handleFieldChange('heatingType', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('heatingType', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Heating Type"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              forcePopupIcon
              size="small"
              options={airConditioningOptions}
              value={formData.airConditioning || ''}
              onChange={(e, newValue) => handleFieldChange('airConditioning', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('airConditioning', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Air Conditioning"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Plumbing / Electrical */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Plumbing / Electrical</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Plumbing (e.g., Copper, PVC)"
              value={formData.plumbing || ''}
              onChange={(e) => handleFieldChange('plumbing', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              placeholder="Electrical (e.g., 200 amp)"
              value={formData.electrical || ''}
              onChange={(e) => handleFieldChange('electrical', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* ROOM COUNT */}
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
            ROOM COUNT
          </Typography>
        </Box>

        {/* Rooms / Bedrooms / Bathrooms */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Rooms / Beds / Baths</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              placeholder="Total Rooms"
              value={formData.totalRooms || ''}
              onChange={(e) => handleFieldChange('totalRooms', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Bedrooms"
              value={formData.bedrooms || ''}
              onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Full Baths"
              value={formData.bathrooms || ''}
              onChange={(e) => handleFieldChange('bathrooms', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Half Baths"
              value={formData.halfBaths || ''}
              onChange={(e) => handleFieldChange('halfBaths', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* FLOOR AREAS */}
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
            FLOOR AREAS (sq.ft.)
          </Typography>
        </Box>

        {/* Floor Areas */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Main / Second / Total</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              placeholder="Main Floor"
              value={formData.mainFloorArea || ''}
              onChange={(e) => handleFieldChange('mainFloorArea', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Second Floor"
              value={formData.secondFloorArea || ''}
              onChange={(e) => handleFieldChange('secondFloorArea', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Total Above Grade"
              value={formData.totalAboveGradeArea || ''}
              onChange={(e) => handleFieldChange('totalAboveGradeArea', e.target.value)}
              sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* ADDITIONAL FEATURES */}
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
            ADDITIONAL FEATURES
          </Typography>
        </Box>

        {/* Special Features */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Special Features</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="e.g., Fireplace, Finished Basement, Central Vac, Security System, etc."
              value={formData.specialFeatures || ''}
              onChange={(e) => handleFieldChange('specialFeatures', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Recent Improvements */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Recent Improvements</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="List any recent improvements with approximate dates and costs..."
              value={formData.recentImprovements || ''}
              onChange={(e) => handleFieldChange('recentImprovements', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Required Repairs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Required Repairs</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="List any repairs that are required..."
              value={formData.requiredRepairs || ''}
              onChange={(e) => handleFieldChange('requiredRepairs', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
