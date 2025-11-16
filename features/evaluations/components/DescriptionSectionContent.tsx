'use client';

import {
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  Autocomplete
} from '@mui/material';

interface DescriptionSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
  allSectionsData: any;
}

export default function DescriptionSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: DescriptionSectionContentProps) {

  // Dropdown options
  const topographyOptions = [
    'Plane et en relation avec les lots avoisinants',
    'Accidenté',
    'Montagneux',
    'Pente ascendante',
    'Pente descendante',
    'Plane',
    'Plateau',
    'Surélevé',
    'Vallonnée'
  ];

  const floodRiskOptions = [
    'Aucun',
    'Contrôlé par digue ou barrage',
    'Faible risque',
    'Non vérifié',
    'Risque centenaire (0-100 ans)',
    "Risque d'embâcle",
    'Risque modéré',
    'Risque 20 ans (0-20 ans)'
  ];

  const contaminationRiskOptions = [
    'Imperceptible',
    'Imperceptible et historique inconnu',
    'Risque à proximité',
    'Risque de contamination'
  ];

  const propertyTypeOptions = [
    'Semi-commercial',
    'Plain-pied détaché',
    'Plain-pied jumelé',
    'Cottage détaché',
    'Cottage jumelé',
    'Unité de condominium',
    'Palier multiple',
    'Maison mobile',
    'Split level'
  ];

  const constructionQualityOptions = [
    'Standard',
    'Bas de gamme',
    'Économique',
    'Moyenne',
    'Pauvre',
    'Prestigieuse',
    'Standard +',
    'Supérieure'
  ];

  const foundationOptions = [
    'Pierre et mortiers',
    'Béton coulé',
    'Blocs de béton',
    'Sur pilotis',
    'Dalle sur le sol'
  ];

  const structureOptions = [
    "Charpente de bois ou l'équivalent",
    "Structure d'acier",
    'Structure de béton',
    'Blocs de béton'
  ];

  const insulationOptions = [
    "Laine minérale thermique ou l'équivalent",
    "Laine minérale ou l'équivalent",
    'Uréthane giclé'
  ];

  const roofOptions = [
    "Bardeaux d'asphalte (+/- 7 ans)",
    "Bardeaux d'asphalte",
    'Goudron / Gravier',
    'Membrane élastomère',
    'Tôle',
    "Tuiles d'argile"
  ];

  const soffitOptions = [
    'Aluminium ventilé',
    'Bois',
    'PVC ventilé'
  ];

  const doorsOptions = [
    'Portes aluminium vitrée et acier vitrée',
    'Acier',
    'Acier et portes patio'
  ];

  const heatingOptions = [
    'Bi-énergie / Électricité et huile x (3)',
    'Plinthes / Électricité',
    'Air pulsé et plinthes / Électricité',
    'Plinthes et convecteur / Électricité',
    'Bi-énergie / Électricité et gaz',
    'Bi-énergie / Électricité et huile'
  ];

  const cabinetsOptions = [
    'Mélamine / Stratifié',
    'Bois mou / Armoires de mélamine',
    'Bois mou / Armoires de bois'
  ];

  const builtInElementsOptions = [
    'Aucun',
    'Hotte, appareils ménagers, etc.'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* DESCRIPTION SOMMAIRE DU TERRAIN */}
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
            DESCRIPTION SOMMAIRE DU TERRAIN
          </Typography>
        </Box>

        {/* Topographie & Risque d'inondation */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Topographie</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              size="small"
              options={topographyOptions}
              value={formData.topography || ''}
              onChange={(e, newValue) => handleFieldChange('topography', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('topography', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Plane et en relation avec les lots avoisinants"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', ml: 2 }}>Risque d'inondation :</Typography>
            <Autocomplete
              freeSolo
              size="small"
              options={floodRiskOptions}
              value={formData.floodRisk || ''}
              onChange={(e, newValue) => handleFieldChange('floodRisk', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('floodRisk', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Aucun"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Risque de contamination */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Risque de contamination</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={contaminationRiskOptions}
              value={formData.contaminationRisk || ''}
              onChange={(e, newValue) => handleFieldChange('contaminationRisk', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('contaminationRisk', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Imperceptible et historique inconnu"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Certificat de localisation */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Certificat de localisation</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', minWidth: '80px' }}>Consulté :</Typography>
              <TextField
                size="small"
                value={formData.certConsulted || ''}
                onChange={(e) => handleFieldChange('certConsulted', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', minWidth: '150px', ml: 2 }}>Mise à jour recommandée :</Typography>
              <TextField
                size="small"
                value={formData.certUpdateRecommended || ''}
                onChange={(e) => handleFieldChange('certUpdateRecommended', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', minWidth: '110px' }}>Commentaires :</Typography>
              <TextField
                size="small"
                value={formData.certComments || ''}
                onChange={(e) => handleFieldChange('certComments', e.target.value)}
                placeholder="Le certificat de localisation date du"
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Dimensions */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Dimensions</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>Façade :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.landFrontage || ''}
              onChange={(e) => handleFieldChange('landFrontage', e.target.value)}
              placeholder="51.57"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '100px' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2 }}>Profondeur :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.landDepth || ''}
              onChange={(e) => handleFieldChange('landDepth', e.target.value)}
              placeholder="173.85"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '100px' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2 }}>Superficie :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.landArea || ''}
              onChange={(e) => handleFieldChange('landArea', e.target.value)}
              placeholder="8499"
              InputProps={{
                endAdornment: <InputAdornment position="end">pi²</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '130px' }}
            />
          </Box>
        </Box>

        {/* Accessibilité (entrée) */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Accessibilité (entrée)</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.accessibility || 'mitoyenne'}
              onChange={(e) => handleFieldChange('accessibility', e.target.value)}
            >
              <FormControlLabel value="mitoyenne" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>Mitoyenne</Typography>} />
              <FormControlLabel value="privee" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>Privée</Typography>} />
              <FormControlLabel value="publique" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>Publique</Typography>} />
              <FormControlLabel value="autre" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>Autre</Typography>} />
            </RadioGroup>
          </Box>
        </Box>

        {/* Usage le meilleur et le plus profitable */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Usage le meilleur et le plus profitable</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <RadioGroup
                row
                value={formData.highestBestUse || 'oui'}
                onChange={(e) => handleFieldChange('highestBestUse', e.target.value)}
              >
                <FormControlLabel value="oui" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>Oui</Typography>} />
                <FormControlLabel value="non" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>Non</Typography>} />
              </RadioGroup>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2 }}>Si non, commentez :</Typography>
              <TextField
                size="small"
                value={formData.highestBestUseComments || ''}
                onChange={(e) => handleFieldChange('highestBestUseComments', e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
              />
            </Box>
            <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', fontStyle: 'italic' }}>
              L'usage le meilleur et le plus profitable est défini comme étant celui qui, au moment de l'évaluation, est le plus susceptible de produire le rendement net le plus élevé, soit en argent ou en aménités.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* AMÉNAGEMENT EXTÉRIEUR / STATIONNEMENT & DÉPENDANCES */}
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
            AMÉNAGEMENT EXTÉRIEUR / STATIONNEMENT
          </Typography>
        </Box>

        {/* Stationnement */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Stationnement</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>Int. :</Typography>
              <TextField
                size="small"
                type="number"
                value={formData.parkingInterior || ''}
                onChange={(e) => handleFieldChange('parkingInterior', e.target.value)}
                placeholder="Nb."
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '70px' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>Ext. :</Typography>
              <TextField
                size="small"
                type="number"
                value={formData.parkingExterior || ''}
                onChange={(e) => handleFieldChange('parkingExterior', e.target.value)}
                placeholder="Nb."
                sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '70px' }}
              />
            </Box>
            <FormControlLabel
              control={
                <Radio
                  size="small"
                  checked={formData.parkingNone || false}
                  onChange={(e) => handleFieldChange('parkingNone', e.target.checked)}
                />
              }
              label={<Typography sx={{ fontSize: '13px' }}>Aucun</Typography>}
            />
          </Box>
        </Box>

        {/* Aménagement description */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Aménagement extérieur</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.exteriorAmenities || ''}
              onChange={(e) => handleFieldChange('exteriorAmenities', e.target.value)}
              placeholder="Asphalte, pelouse, arbres, arbustes, clôture, trottoirs, piscine hors-terre (non considérée), etc. (Valeur contributive)"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Dépendances / Annexes */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Dépendances / Annexes</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.dependencies || ''}
              onChange={(e) => handleFieldChange('dependencies', e.target.value)}
              placeholder="Aucune dépendance."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* DESCRIPTION SOMMAIRE DU BÂTIMENT ET DES DÉPENDANCES */}
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
            DESCRIPTION SOMMAIRE DU BÂTIMENT - GÉNÉRALITÉS
          </Typography>
        </Box>

        {/* Utilisation du bâtiment */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Utilisation du bâtiment</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.buildingUse || ''}
              onChange={(e) => handleFieldChange('buildingUse', e.target.value)}
              placeholder="Résidentielle et commerciale"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Type de propriété & Dimensions au sol */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Type de propriété</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              size="small"
              options={propertyTypeOptions}
              value={formData.propertyType || ''}
              onChange={(e, newValue) => handleFieldChange('propertyType', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('propertyType', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Semi-commercial"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2, whiteSpace: 'nowrap' }}>Dimensions au sol :</Typography>
            <TextField
              size="small"
              value={formData.buildingDimensions || ''}
              onChange={(e) => handleFieldChange('buildingDimensions', e.target.value)}
              placeholder="IRR x IRR"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '120px' }}
            />
          </Box>
        </Box>

        {/* Qualité de la construction & Nombre d'unité(s) */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Qualité de la construction</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              size="small"
              options={constructionQualityOptions}
              value={formData.constructionQuality || ''}
              onChange={(e, newValue) => handleFieldChange('constructionQuality', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('constructionQuality', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Standard"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2, whiteSpace: 'nowrap' }}>Nombre d'unité(s) :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.numberOfUnits || ''}
              onChange={(e) => handleFieldChange('numberOfUnits', e.target.value)}
              placeholder="4"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '70px' }}
            />
          </Box>
        </Box>

        {/* Année de la construction & Âge apparent / Vie économique */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Année de construction</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleFieldChange('yearBuilt', e.target.value)}
              placeholder="1930"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '90px' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2, whiteSpace: 'nowrap' }}>Âge apparent :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.apparentAge || ''}
              onChange={(e) => handleFieldChange('apparentAge', e.target.value)}
              placeholder="95"
              InputProps={{
                endAdornment: <InputAdornment position="end">ans</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '90px' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2, whiteSpace: 'nowrap' }}>Vie économique :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.economicLife || ''}
              onChange={(e) => handleFieldChange('economicLife', e.target.value)}
              placeholder="28"
              InputProps={{
                endAdornment: <InputAdornment position="end">ans</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '90px' }}
            />
          </Box>
        </Box>

        {/* Nombre d'étage(s) & Superficie au sol */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Nombre d'étage(s)</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              value={formData.numberOfFloors || ''}
              onChange={(e) => handleFieldChange('numberOfFloors', e.target.value)}
              placeholder="2"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '70px' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', ml: 2, whiteSpace: 'nowrap' }}>Superficie au sol :</Typography>
            <TextField
              size="small"
              type="number"
              value={formData.groundFloorArea || ''}
              onChange={(e) => handleFieldChange('groundFloorArea', e.target.value)}
              placeholder="3411"
              InputProps={{
                endAdornment: <InputAdornment position="end">pi²</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '130px' }}
            />
          </Box>
        </Box>
      </Box>

      {/* UTILISATION DES ESPACES */}
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
            UTILISATION DES ESPACES
          </Typography>
        </Box>

        {/* Superficie du sous-sol */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Superficie du sous-sol</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              size="small"
              value={formData.basementArea || ''}
              onChange={(e) => handleFieldChange('basementArea', e.target.value)}
              placeholder="N/D"
              InputProps={{
                endAdornment: <InputAdornment position="end">pi²</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '150px' }}
            />
          </Box>
        </Box>

        {/* Superficie habitable (s-s exclus) */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Superf. habitable (s-s exclus)</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              size="small"
              type="number"
              value={formData.livingArea || ''}
              onChange={(e) => handleFieldChange('livingArea', e.target.value)}
              placeholder="6632"
              InputProps={{
                endAdornment: <InputAdornment position="end">pi²</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '150px' }}
            />
          </Box>
        </Box>

        {/* % aménagé du sous-sol */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>% aménagé du sous-sol</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              size="small"
              type="number"
              value={formData.basementFinishedPercent || ''}
              onChange={(e) => handleFieldChange('basementFinishedPercent', e.target.value)}
              placeholder="0"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, width: '100px' }}
            />
          </Box>
        </Box>

        {/* Source de la superficie */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Source de la superficie</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.areaSource || ''}
              onChange={(e) => handleFieldChange('areaSource', e.target.value)}
              placeholder="Certificat de localisation et mesuré"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* COMPOSANTES */}
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
            COMPOSANTES & OBSERVATIONS
          </Typography>
        </Box>

        {/* Foundation */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Fondation</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={foundationOptions}
              value={formData.foundation || ''}
              onChange={(e, newValue) => handleFieldChange('foundation', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('foundation', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Pierre et mortiers"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Ossature */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Ossature</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={structureOptions}
              value={formData.structure || ''}
              onChange={(e, newValue) => handleFieldChange('structure', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('structure', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Charpente de bois ou l'équivalent"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Murs extérieurs */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Murs extérieurs</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.exteriorWalls || ''}
              onChange={(e) => handleFieldChange('exteriorWalls', e.target.value)}
              placeholder="Brique, Vinyle et aluminium"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Isolant */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Isolant</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={insulationOptions}
              value={formData.insulation || ''}
              onChange={(e, newValue) => handleFieldChange('insulation', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('insulation', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Laine minérale thermique ou l'équivalent"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Toiture */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Toiture</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={roofOptions}
              value={formData.roof || ''}
              onChange={(e, newValue) => handleFieldChange('roof', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('roof', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Bardeaux d'asphalte (+/- 7 ans)"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Soffite/corniche */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Soffite/corniche</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={soffitOptions}
              value={formData.soffit || ''}
              onChange={(e, newValue) => handleFieldChange('soffit', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('soffit', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Aluminium ventilé"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Fenêtres */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Fenêtres</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.windows || ''}
              onChange={(e) => handleFieldChange('windows', e.target.value)}
              placeholder="Coulissantes et Fixes / Aluminium et PVC"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Portes */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Portes</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={doorsOptions}
              value={formData.doors || ''}
              onChange={(e, newValue) => handleFieldChange('doors', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('doors', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Portes aluminium vitrée et acier vitrée"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Plomberie */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Plomberie</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.plumbing || ''}
              onChange={(e) => handleFieldChange('plumbing', e.target.value)}
              placeholder="Standard / Chauffe-eau: (1) x 60 et (1) x 40 gallons"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Électricité */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Électricité</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.electrical || ''}
              onChange={(e) => handleFieldChange('electrical', e.target.value)}
              placeholder="(2) x 100 et (2) x 200 ampères à disjoncteurs"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Chauffage / Énergie */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Chauffage / Énergie</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={heatingOptions}
              value={formData.heating || ''}
              onChange={(e, newValue) => handleFieldChange('heating', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('heating', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Bi-énergie / Électricité et huile x (3)"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Armoires / Comptoirs */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Armoires / Comptoirs</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={cabinetsOptions}
              value={formData.cabinets || ''}
              onChange={(e, newValue) => handleFieldChange('cabinets', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('cabinets', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Mélamine / Stratifié"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Éléments incorporés */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Éléments incorporés</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={builtInElementsOptions}
              value={formData.builtInElements || ''}
              onChange={(e, newValue) => handleFieldChange('builtInElements', newValue)}
              onInputChange={(e, newValue) => handleFieldChange('builtInElements', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Aucun"
                  sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Nb. de salles de bain */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Nb. de salles de bain</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.bathrooms || ''}
              onChange={(e) => handleFieldChange('bathrooms', e.target.value)}
              placeholder="(1) x 4 appareils, (2) x 3 appareils et (1) x 2 appareils"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Foyer / Poêle */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Foyer / Poêle</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.fireplace || ''}
              onChange={(e) => handleFieldChange('fireplace', e.target.value)}
              placeholder="Aucun"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Climatisation / Ventilation */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Climatisation / Ventilation</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.airConditioning || ''}
              onChange={(e) => handleFieldChange('airConditioning', e.target.value)}
              placeholder="Ventilateur de salle de bain"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Équipements spéciaux */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Équipements spéciaux</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.specialEquipment || ''}
              onChange={(e) => handleFieldChange('specialEquipment', e.target.value)}
              placeholder="Aspirateur central, système d'alarme"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Observations et état général */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Observations et état général</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              size="small"
              value={formData.generalObservations || ''}
              onChange={(e) => handleFieldChange('generalObservations', e.target.value)}
              placeholder="*La visite des lieux nous a permis de constater que la condition générale du sujet est jugée bonne..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* AMÉNAGEMENT INTÉRIEUR ET FINITION */}
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
            AMÉNAGEMENT INTÉRIEUR ET FINITION
          </Typography>
        </Box>

        {/* Sous-sol */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Sous-sol</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.basementDescription || ''}
              onChange={(e) => handleFieldChange('basementDescription', e.target.value)}
              placeholder="Description des pièces et finitions..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Rez-de-chaussée */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Rez-de-chaussée</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.groundFloorDescription || ''}
              onChange={(e) => handleFieldChange('groundFloorDescription', e.target.value)}
              placeholder="#15166 - Commerce de vente au détail (fleuriste): Vestibule et salle d'eau (2 appareils)..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Étage-type */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Étage-type</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.upperFloorDescription || ''}
              onChange={(e) => handleFieldChange('upperFloorDescription', e.target.value)}
              placeholder="#15170 - Unité de type 4.5: Entrée, cuisine, salon, (2) chambres à coucher..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
