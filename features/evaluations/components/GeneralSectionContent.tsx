'use client';

import { useEffect, useMemo } from 'react';
import {
  TextField,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  InputAdornment
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRememberedInputs } from '../hooks/useRememberedInputs';
import TextFieldWithHistory from './TextFieldWithHistory';

interface GeneralSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
  allSectionsData?: any;
}

export default function GeneralSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: GeneralSectionContentProps) {
  const tGen = useTranslations('evaluations.sections.generalSection');

  // Hook for save/load field values
  const { savePreference, getAllVariations, clearPreference, preferences } = useRememberedInputs();

  // Get saved variations for general section
  const generalVariations = useMemo(() => {
    console.log('[GeneralSection] Computing generalVariations, preferences changed');
    return getAllVariations('section_general');
  }, [preferences, getAllVariations]);

  // Helper to get all saveable general fields
  const getGeneralFieldsData = () => ({
    evaluationPurpose: formData.evaluationPurpose || '',
    propertyRightEvaluated: formData.propertyRightEvaluated || '',
    summaryDescription: formData.summaryDescription || '',
    favorableFactors: formData.favorableFactors || '',
    unfavorableFactors: formData.unfavorableFactors || '',
    sectorComments: formData.sectorComments || '',
    marketComments: formData.marketComments || '',
    zoningComments: formData.zoningComments || '',
    additionalComments: formData.additionalComments || ''
  });

  // Save variation handler
  const handleSaveVariation = async (variationName: string, data: any) => {
    console.log('[GeneralSection] Saving variation:', { variationName, data });
    const result = await savePreference('section_general', data, variationName);
    console.log('[GeneralSection] Save result:', result);
  };

  // Delete variation handler
  const handleDeleteVariation = async (variationName: string) => {
    if (confirm(`Delete variation "${variationName}"?`)) {
      await clearPreference('section_general', variationName);
    }
  };

  // Auto-populate on first load
  useEffect(() => {
    if (appraisalData && Object.keys(formData).length === 0) {
      const initialData = {
        evaluationPurpose: formData.evaluationPurpose || 'Estimer la valeur marchande aux fins de financement hypothécaire',
        propertyRightEvaluated: formData.propertyRightEvaluated || 'Droit du (des) propriétaire(s)',
        address: appraisalData.address || '',
        city: appraisalData.city || '',
        lotNumber: formData.lotNumber || '',
        cadastre: formData.cadastre || 'Cadastre du Québec',
        ownerName: formData.ownerName || '',
        ownerPhone: formData.ownerPhone || '',
        summaryDescription: formData.summaryDescription || '',
        constructionStatus: formData.constructionStatus || 'existing',

        // Secteur
        sectorTrend: formData.sectorTrend || 'stable',
        sectorAge: formData.sectorAge || '25-80',
        sectorAccessibility: formData.sectorAccessibility || 'good',
        sectorConformity: formData.sectorConformity || 'good',
        sectorHomogeneity: formData.sectorHomogeneity || 'good',
        dominantPropertyType: formData.dominantPropertyType || '',
        favorableFactors: formData.favorableFactors || '',
        unfavorableFactors: formData.unfavorableFactors || '',

        // Services proximité
        proximityConvenience: formData.proximityConvenience || 'nearby',
        proximitySchool: formData.proximitySchool || '1-2km',
        proximitySupermarket: formData.proximitySupermarket || '2-3km',
        proximityTransport: formData.proximityTransport || 'nearby',
        proximityShoppingCenter: formData.proximityShoppingCenter || '2-3km',
        proximityPark: formData.proximityPark || 'nearby',
        sectorComments: formData.sectorComments || '',

        // Marché immobilier
        propertiesForSaleNearby: formData.propertiesForSaleNearby || 'few',
        salesDelay: formData.salesDelay || '0-4months',
        supplyDemand: formData.supplyDemand || 'unbalanced',
        marketType: formData.marketType || 'seller',
        landPriceTrend: formData.landPriceTrend || 'growing',
        constructionCostTrend: formData.constructionCostTrend || 'growing',
        rentTrend: formData.rentTrend || 'growing',
        interestRateTrend: formData.interestRateTrend || 'stable',
        shortTermTrend: formData.shortTermTrend || 'growing',
        mediumTermTrend: formData.mediumTermTrend || 'stable',
        marketComments: formData.marketComments || '',

        // Données municipales
        matriculeNumber: formData.matriculeNumber || '',
        roleYear: formData.roleYear || '2023-2024-2025',
        marketDate: formData.marketDate || '',
        median: formData.median || '100',
        landValue: formData.landValue || '',
        buildingValue: formData.buildingValue || '',
        totalValue: formData.totalValue || '',
        municipalTax: formData.municipalTax || '',
        schoolTax: formData.schoolTax || '',
        totalTax: formData.totalTax || '',
        zoningConform: formData.zoningConform || true,
        zoningComments: formData.zoningComments || '',

        // Services
        serviceAqueduct: formData.serviceAqueduct || false,
        serviceStormSewer: formData.serviceStormSewer || false,
        serviceSanitarySewer: formData.serviceSanitarySewer || false,
        serviceWell: formData.serviceWell || false,
        serviceSepticTank: formData.serviceSepticTank || false,
        serviceLighting: formData.serviceLighting || false,
        serviceNaturalGas: formData.serviceNaturalGas || false,
        serviceFireHydrants: formData.serviceFireHydrants || false,
        serviceDitch: formData.serviceDitch || false,
        serviceDrainField: formData.serviceDrainField || false,

        streetPaving: formData.streetPaving || false,
        streetSidewalk: formData.streetSidewalk || false,
        streetCurb: formData.streetCurb || false,
        streetAlley: formData.streetAlley || false,
        streetBikePath: formData.streetBikePath || false,
        streetOther: formData.streetOther || '',

        additionalComments: formData.additionalComments || ''
      };
      setFormData(initialData);
      onChange(initialData);
    }
  }, [appraisalData]);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          GÉNÉRALITÉS
        </Typography>
      </Box>

      {/* Compact Table-Style Form */}
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
        {/* Section Divider: GÉNÉRALITÉS */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            GÉNÉRALITÉS
          </Typography>
        </Box>

        {/* But de l'évaluation */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>But de l'évaluation</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.evaluationPurpose || ''}
              onChange={(val) => handleFieldChange('evaluationPurpose', val)}
              savedVariations={generalVariations}
              fieldKey="evaluationPurpose"
              onDeleteVariation={handleDeleteVariation}
              onSaveVariation={handleSaveVariation}
              getAllFieldsData={getGeneralFieldsData}
              groupLabel="Général Info"
              placeholder="Estimer la valeur marchande aux fins de financement hypothécaire"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Droit de propriété évalué */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Droit de propriété évalué</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.propertyRightEvaluated || ''}
              onChange={(e) => handleFieldChange('propertyRightEvaluated', e.target.value)}
              placeholder="Droit du (des) propriétaire(s)"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Section Divider: IDENTIFICATION DE L'IMMEUBLE */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            IDENTIFICATION DE L'IMMEUBLE
          </Typography>
        </Box>

        {/* Adresse (auto-populated) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'info.lighter' }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Adresse</Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="body1" sx={{ fontSize: '14px' }}>
              {allSectionsData?.presentation?.fullAddress || appraisalData?.address || 'Adresse non spécifiée'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', mt: 0.5 }}>
              Auto-populated from Presentation section
            </Typography>
          </Box>
        </Box>

        {/* Ville (auto-populated) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'info.lighter' }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Ville</Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="body1" sx={{ fontSize: '14px' }}>
              {allSectionsData?.presentation?.city || appraisalData?.city || ''}
            </Typography>
          </Box>
        </Box>

        {/* Désignation cadastrale: Lot / Cadastre */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Désignation cadastrale</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Lot:</Typography>
            <TextField
              size="small"
              value={formData.lotNumber || ''}
              onChange={(e) => handleFieldChange('lotNumber', e.target.value)}
              placeholder="3 492 120"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
            />
            <Typography variant="body2" sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}>,</Typography>
            <TextField
              size="small"
              value={formData.cadastre || ''}
              onChange={(e) => handleFieldChange('cadastre', e.target.value)}
              placeholder="Cadastre du Québec"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 2 }}
            />
          </Box>
        </Box>

        {/* Nom du propriétaire / Téléphone */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Nom du propriétaire / Tél.</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              value={formData.ownerName || ''}
              onChange={(e) => handleFieldChange('ownerName', e.target.value)}
              placeholder="Nom du propriétaire"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 2 }}
            />
            <TextField
              size="small"
              value={formData.ownerPhone || ''}
              onChange={(e) => handleFieldChange('ownerPhone', e.target.value)}
              placeholder="(514) 555-1234"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
            />
          </Box>
        </Box>

        {/* Description sommaire */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Description sommaire</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.summaryDescription || ''}
              onChange={(val) => handleFieldChange('summaryDescription', val)}
              savedVariations={generalVariations}
              fieldKey="summaryDescription"
              onDeleteVariation={handleDeleteVariation}
              onSaveVariation={handleSaveVariation}
              getAllFieldsData={getGeneralFieldsData}
              groupLabel="Général Info"
              placeholder="Le sujet est une propriété..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Statut de la construction */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Statut de la construction</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <RadioGroup
              row
              value={formData.constructionStatus || 'existing'}
              onChange={(e) => handleFieldChange('constructionStatus', e.target.value)}
            >
              <FormControlLabel value="renovation" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '14px' }}>En rénovation</Typography>} />
              <FormControlLabel value="toBeBuilt" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '14px' }}>À construire</Typography>} />
              <FormControlLabel value="existing" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '14px' }}>Existante</Typography>} />
            </RadioGroup>
          </Box>
        </Box>

        {/* Section Divider: SECTEUR */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            SECTEUR
          </Typography>
        </Box>

        {/* Secteur - Tendance / Accessibilité */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Tendance / Accessibilité</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={formData.sectorTrend || 'stable'}
                onChange={(e) => handleFieldChange('sectorTrend', e.target.value)}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="growing">En croissance</MenuItem>
                <MenuItem value="stable">Stable</MenuItem>
                <MenuItem value="declining">En déclin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={formData.sectorAccessibility || 'good'}
                onChange={(e) => handleFieldChange('sectorAccessibility', e.target.value)}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="excellent">Excellente</MenuItem>
                <MenuItem value="good">Bonne</MenuItem>
                <MenuItem value="average">Moyenne</MenuItem>
                <MenuItem value="poor">Faible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Âge / Conformité du sujet */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Âge / Conformité</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              value={formData.sectorAge || ''}
              onChange={(e) => handleFieldChange('sectorAge', e.target.value)}
              placeholder="25 à 80 ans"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, flex: 1 }}
            />
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={formData.sectorConformity || 'good'}
                onChange={(e) => handleFieldChange('sectorConformity', e.target.value)}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="excellent">Excellente</MenuItem>
                <MenuItem value="good">Bonne</MenuItem>
                <MenuItem value="average">Moyenne</MenuItem>
                <MenuItem value="poor">Faible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Homogénéité */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Homogénéité</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <FormControl size="small" fullWidth>
              <Select
                value={formData.sectorHomogeneity || 'good'}
                onChange={(e) => handleFieldChange('sectorHomogeneity', e.target.value)}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="excellent">Excellente</MenuItem>
                <MenuItem value="good">Bonne</MenuItem>
                <MenuItem value="average">Moyenne</MenuItem>
                <MenuItem value="poor">Faible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Type dominant de propriétés */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Type dominant de propriétés</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.dominantPropertyType || ''}
              onChange={(e) => handleFieldChange('dominantPropertyType', e.target.value)}
              placeholder="Semi-commerciale"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Facteurs favorables */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Facteurs favorables</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.favorableFactors || ''}
              onChange={(val) => handleFieldChange('favorableFactors', val)}
              savedVariations={generalVariations}
              fieldKey="favorableFactors"
              onDeleteVariation={handleDeleteVariation}
              onSaveVariation={handleSaveVariation}
              getAllFieldsData={getGeneralFieldsData}
              groupLabel="Général Info"
              placeholder="L'emplacement du sujet..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Facteurs défavorables */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Facteurs défavorables</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextFieldWithHistory
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.unfavorableFactors || ''}
              onChange={(val) => handleFieldChange('unfavorableFactors', val)}
              savedVariations={generalVariations}
              fieldKey="unfavorableFactors"
              onDeleteVariation={handleDeleteVariation}
              onSaveVariation={handleSaveVariation}
              getAllFieldsData={getGeneralFieldsData}
              groupLabel="Général Info"
              placeholder="Aucun facteur défavorable..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* Proximité des services & Commentaires */}
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
        {/* Section Divider */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            PROXIMITÉ DES SERVICES
          </Typography>
        </Box>

        {/* Services row 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Dépannage</Typography>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <Select value={formData.proximityConvenience || 'nearby'} onChange={(e) => handleFieldChange('proximityConvenience', e.target.value)} sx={{ fontSize: '13px' }}>
                <MenuItem value="nearby">À proximité</MenuItem>
                <MenuItem value="1-2km">1 - 2 km</MenuItem>
                <MenuItem value="2-3km">2 - 3 km</MenuItem>
                <MenuItem value="3-5km">3 - 5 km</MenuItem>
                <MenuItem value="5+km">5+ km</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>École</Typography>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <Select value={formData.proximitySchool || '1-2km'} onChange={(e) => handleFieldChange('proximitySchool', e.target.value)} sx={{ fontSize: '13px' }}>
                <MenuItem value="nearby">À proximité</MenuItem>
                <MenuItem value="1-2km">1 - 2 km</MenuItem>
                <MenuItem value="2-3km">2 - 3 km</MenuItem>
                <MenuItem value="3-5km">3 - 5 km</MenuItem>
                <MenuItem value="5+km">5+ km</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Supermarché</Typography>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <Select value={formData.proximitySupermarket || '2-3km'} onChange={(e) => handleFieldChange('proximitySupermarket', e.target.value)} sx={{ fontSize: '13px' }}>
                <MenuItem value="nearby">À proximité</MenuItem>
                <MenuItem value="1-2km">1 - 2 km</MenuItem>
                <MenuItem value="2-3km">2 - 3 km</MenuItem>
                <MenuItem value="3-5km">3 - 5 km</MenuItem>
                <MenuItem value="5+km">5+ km</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Transport</Typography>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <Select value={formData.proximityTransport || 'nearby'} onChange={(e) => handleFieldChange('proximityTransport', e.target.value)} sx={{ fontSize: '13px' }}>
                <MenuItem value="nearby">À proximité</MenuItem>
                <MenuItem value="1-2km">1 - 2 km</MenuItem>
                <MenuItem value="2-3km">2 - 3 km</MenuItem>
                <MenuItem value="3-5km">3 - 5 km</MenuItem>
                <MenuItem value="5+km">5+ km</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Services row 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Centre comm.</Typography>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <Select value={formData.proximityShoppingCenter || '2-3km'} onChange={(e) => handleFieldChange('proximityShoppingCenter', e.target.value)} sx={{ fontSize: '13px' }}>
                <MenuItem value="nearby">À proximité</MenuItem>
                <MenuItem value="1-2km">1 - 2 km</MenuItem>
                <MenuItem value="2-3km">2 - 3 km</MenuItem>
                <MenuItem value="3-5km">3 - 5 km</MenuItem>
                <MenuItem value="5+km">5+ km</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Parc</Typography>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <Select value={formData.proximityPark || 'nearby'} onChange={(e) => handleFieldChange('proximityPark', e.target.value)} sx={{ fontSize: '13px' }}>
                <MenuItem value="nearby">À proximité</MenuItem>
                <MenuItem value="1-2km">1 - 2 km</MenuItem>
                <MenuItem value="2-3km">2 - 3 km</MenuItem>
                <MenuItem value="3-5km">3 - 5 km</MenuItem>
                <MenuItem value="5+km">5+ km</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ p: 1, gridColumn: 'span 2' }} />
        </Box>

        {/* Commentaire(s) */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', color: 'text.secondary', display: 'block', mb: 0.5 }}>Commentaire(s)</Typography>
          <TextFieldWithHistory
            fullWidth
            multiline
            rows={3}
            size="small"
            value={formData.sectorComments || ''}
            onChange={(val) => handleFieldChange('sectorComments', val)}
            savedVariations={generalVariations}
            fieldKey="sectorComments"
            onDeleteVariation={handleDeleteVariation}
            onSaveVariation={handleSaveVariation}
            getAllFieldsData={getGeneralFieldsData}
            groupLabel="Général Info"
            placeholder="Le sujet est situé..."
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        </Box>
      </Box>

      {/* Services disponibles */}
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
            SERVICES DISPONIBLES
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <FormGroup>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceAqueduct || false} onChange={(e) => handleFieldChange('serviceAqueduct', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Aqueduc</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceStormSewer || false} onChange={(e) => handleFieldChange('serviceStormSewer', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Égout pluvial</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceSanitarySewer || false} onChange={(e) => handleFieldChange('serviceSanitarySewer', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Égout sanitaire</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceWell || false} onChange={(e) => handleFieldChange('serviceWell', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Puits</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceSepticTank || false} onChange={(e) => handleFieldChange('serviceSepticTank', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Fosse septique</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceLighting || false} onChange={(e) => handleFieldChange('serviceLighting', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Éclairage</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceNaturalGas || false} onChange={(e) => handleFieldChange('serviceNaturalGas', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Gaz naturel</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceFireHydrants || false} onChange={(e) => handleFieldChange('serviceFireHydrants', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Bornes d'incendie</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceDitch || false} onChange={(e) => handleFieldChange('serviceDitch', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Fossé</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.serviceDrainField || false} onChange={(e) => handleFieldChange('serviceDrainField', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Champ d'épuration</Typography>} />
            </Box>
          </FormGroup>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1, fontSize: '12px' }}>Rue(s)</Typography>
          <FormGroup>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <FormControlLabel control={<Checkbox size="small" checked={formData.streetPaving || false} onChange={(e) => handleFieldChange('streetPaving', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Pavage</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.streetSidewalk || false} onChange={(e) => handleFieldChange('streetSidewalk', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Trottoir</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.streetCurb || false} onChange={(e) => handleFieldChange('streetCurb', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Bordure</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.streetAlley || false} onChange={(e) => handleFieldChange('streetAlley', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Ruelle</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={formData.streetBikePath || false} onChange={(e) => handleFieldChange('streetBikePath', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Piste cyclable</Typography>} />
            </Box>
            <TextField
              fullWidth
              size="small"
              value={formData.streetOther || ''}
              onChange={(e) => handleFieldChange('streetOther', e.target.value)}
              placeholder="Autre..."
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, mt: 1 }}
            />
          </FormGroup>
        </Box>
      </Box>

      {/* Commentaires additionnels */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ bgcolor: 'grey.100', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px' }}>
            COMMENTAIRES ADDITIONNELS
          </Typography>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <TextFieldWithHistory
            fullWidth
            multiline
            rows={4}
            size="small"
            value={formData.additionalComments || ''}
            onChange={(val) => handleFieldChange('additionalComments', val)}
            savedVariations={generalVariations}
            fieldKey="additionalComments"
            onDeleteVariation={handleDeleteVariation}
            onSaveVariation={handleSaveVariation}
            getAllFieldsData={getGeneralFieldsData}
            groupLabel="Général Info"
            placeholder="Nous considérons et présumons..."
            sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
          />
        </Box>
      </Box>
    </Box>
  );
}
