'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface CoutPariteSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
  allSectionsData: any;
}

interface ComparableRow {
  id: string;
  field: string;
  subject: any;
  vente1: any;
  vente2: any;
  vente3: any;
}

export default function CoutPariteSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: CoutPariteSectionContentProps) {

  // Calculate values for cost approach
  const landValue = (parseFloat(formData.landArea || 0) * parseFloat(formData.landPricePerSqFt || 0));
  const buildingNewCost = (parseFloat(formData.buildingArea || 0) * parseFloat(formData.weightedRate || 0));
  const physicalDepr = parseFloat(formData.depreciationPhysical || 0) / 100;
  const functionalDepr = parseFloat(formData.depreciationFunctional || 0) / 100;
  const economicDepr = parseFloat(formData.depreciationEconomic || 0) / 100;
  const totalDepreciation = buildingNewCost * (physicalDepr + functionalDepr + economicDepr);
  const depreciatedBuildingCost = buildingNewCost - totalDepreciation;

  const basementNew = parseFloat(formData.basementNew || 0);
  const basementDepr = basementNew * (parseFloat(formData.basementDepreciation || 0) / 100);
  const basementValue = basementNew - basementDepr;

  const extrasNew = parseFloat(formData.extrasNew || 0);
  const extrasValue = parseFloat(formData.extrasContribution || 0);

  const outbuildingsNew = parseFloat(formData.outbuildingsNew || 0);
  const outbuildingsDepr = outbuildingsNew * (parseFloat(formData.outbuildingsDepreciation || 0) / 100);
  const outbuildingsValue = outbuildingsNew - outbuildingsDepr;

  const exteriorImprovements = parseFloat(formData.exteriorImprovements || 0);

  const totalCostValue = landValue + depreciatedBuildingCost + basementValue + extrasValue + outbuildingsValue + exteriorImprovements;
  const roundedCostValue = Math.round(totalCostValue / 1000) * 1000;

  // Direct Comparison Grid Data
  const [gridData, setGridData] = useState<ComparableRow[]>([
    { id: '1', field: 'Ville', subject: formData.ville || '', vente1: '', vente2: '', vente3: '' },
    { id: '2', field: 'Rue', subject: formData.rue || '', vente1: '', vente2: '', vente3: '' },
    { id: '3', field: 'No. civique', subject: formData.noCivique || '', vente1: '', vente2: '', vente3: '' },
    { id: '4', field: 'Type de propriété', subject: formData.typePropriete || '', vente1: '', vente2: '', vente3: '' },
    { id: '5', field: 'No. enreg. / inscription', subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '6', field: 'Date de vente', subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '7', field: 'Prix de vente', subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '8', field: "Temps d'exposition", subject: 'N/A', vente1: ' jours', vente2: ' jours', vente3: ' jours' },
    { id: '9', field: 'Valeur municipale / terrain', subject: formData.valeurMunicipale || '', vente1: '', vente2: '', vente3: '' },
    { id: '10', field: 'Superficie du terrain', subject: formData.superficieTerrain || '', vente1: '', vente2: '', vente3: '' },
    { id: '11', field: 'Sup. du bâtiment (s.-s. exclu)', subject: formData.superficieBatiment || '', vente1: '', vente2: '', vente3: '' },
    { id: '12', field: 'Superficie / % amén. du s.-s.', subject: `${formData.superficieSousSol || 'N/D'}\t${formData.pctAmenagement || '0%'}`, vente1: '', vente2: '', vente3: '' },
    { id: '13', field: 'Année const. / Âge apparent', subject: `${formData.anneeConstruction || ''}\t${formData.ageApparent || ''} ans`, vente1: ' ans', vente2: 'ans', vente3: ' ans' },
    { id: '14', field: "Nombre d'étages / d'unité", subject: `${formData.nbEtages || ''}\t${formData.nbUnites || ''}`, vente1: '1\t1', vente2: '1\t1', vente3: '1\t1' },
    { id: '15', field: 'Dépendance(s)', subject: formData.dependances || 'Aucune', vente1: 'Aucune', vente2: 'Aucune', vente3: 'Aucune' },
    { id: '16', field: 'Description complémentaire', subject: formData.descriptionComplementaire || '', vente1: '', vente2: '', vente3: '' },
  ]);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'field',
      headerName: 'Analyse du marché (Ventes comparables)',
      width: 300,
      pinned: 'left',
      cellStyle: { fontWeight: 600, backgroundColor: '#f5f5f5' }
    },
    {
      field: 'subject',
      headerName: 'Sujet',
      width: 200,
      editable: false,
      cellStyle: { backgroundColor: '#e3f2fd' }
    },
    {
      field: 'vente1',
      headerName: 'Vente no 1',
      width: 180,
      editable: true
    },
    {
      field: 'vente2',
      headerName: 'Vente no 2',
      width: 180,
      editable: true
    },
    {
      field: 'vente3',
      headerName: 'Vente no 3',
      width: 180,
      editable: true
    }
  ], []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log('Cell value changed:', event);
    // Handle cell changes and update formData
    handleFieldChange('gridData', gridData);
  }, [gridData, handleFieldChange]);

  return (
    <Box sx={{ p: 3 }}>
      {/* MÉTHODE DU COÛT */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          mb: 4
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>
            MÉTHODE DU COÛT
          </Typography>
        </Box>

        {/* Land Value */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 150px 80px 50px 100px auto', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Valeur marchande du terrain</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '11px' }}>Superficie :</Typography>
            <TextField size="small" value={formData.landArea || ''} onChange={(e) => handleFieldChange('landArea', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
            <Typography variant="caption" sx={{ fontSize: '11px' }}>pi²</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2">x</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <TextField size="small" value={formData.landPricePerSqFt || ''} onChange={(e) => handleFieldChange('landPricePerSqFt', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '50px' }} />
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2">=</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>${landValue.toLocaleString()}</Typography>
          </Box>
        </Box>

        {/* Building New Cost */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 150px 80px 50px 100px auto', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Coût neuf du bât. :</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '11px' }}>Superficie habitable :</Typography>
            <TextField size="small" value={formData.buildingArea || ''} onChange={(e) => handleFieldChange('buildingArea', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
            <Typography variant="caption" sx={{ fontSize: '11px' }}>pi²</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2">x</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '11px' }}>Taux pondéré :</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
            <TextField size="small" value={formData.weightedRate || ''} onChange={(e) => handleFieldChange('weightedRate', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>${buildingNewCost.toLocaleString()}</Typography>
          </Box>
        </Box>

        {/* Depreciation */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', '&:hover': { bgcolor: 'action.hover' } }}>
            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Dépréciation :</Typography>
            </Box>
            <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Physique :</Typography>
                <TextField size="small" type="number" value={formData.depreciationPhysical || 0} onChange={(e) => handleFieldChange('depreciationPhysical', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '60px' }} />
                <Typography variant="caption" sx={{ fontSize: '11px' }}>%</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Fonctionnelle :</Typography>
                <TextField size="small" type="number" value={formData.depreciationFunctional || 0} onChange={(e) => handleFieldChange('depreciationFunctional', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '60px' }} />
                <Typography variant="caption" sx={{ fontSize: '11px' }}>%</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Économique :</Typography>
                <TextField size="small" type="number" value={formData.depreciationEconomic || 0} onChange={(e) => handleFieldChange('depreciationEconomic', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '60px' }} />
                <Typography variant="caption" sx={{ fontSize: '11px' }}>%</Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>${depreciatedBuildingCost.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Basement */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Aménagement du sous-sol :</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Neuf :</Typography>
              <TextField size="small" value={formData.basementNew || 0} onChange={(e) => handleFieldChange('basementNew', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
              <Typography variant="caption" sx={{ fontSize: '11px' }}>$</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Dépréciation :</Typography>
              <TextField size="small" type="number" value={formData.basementDepreciation || 0} onChange={(e) => handleFieldChange('basementDepreciation', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '60px' }} />
              <Typography variant="caption" sx={{ fontSize: '11px' }}>%</Typography>
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>${basementValue.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Extras */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Extras :</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Neuf :</Typography>
              <TextField size="small" value={formData.extrasNew || 0} onChange={(e) => handleFieldChange('extrasNew', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
              <Typography variant="caption" sx={{ fontSize: '11px' }}>$</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Dépréciation :</Typography>
              <TextField size="small" value={formData.extrasContribution || 0} onChange={(e) => handleFieldChange('extrasContribution', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>${extrasValue.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Depreciated Building Cost */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f5f5f5' }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.200', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Coût déprécié du bâtiment :</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>${depreciatedBuildingCost.toLocaleString()}</Typography>
          </Box>
        </Box>

        {/* Outbuildings */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Coût à neuf des dépendances :</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Neuf :</Typography>
              <TextField size="small" value={formData.outbuildingsNew || 0} onChange={(e) => handleFieldChange('outbuildingsNew', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '80px' }} />
              <Typography variant="caption" sx={{ fontSize: '11px' }}>$</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Dépréciation :</Typography>
              <TextField size="small" type="number" value={formData.outbuildingsDepreciation || 0} onChange={(e) => handleFieldChange('outbuildingsDepreciation', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '60px' }} />
              <Typography variant="caption" sx={{ fontSize: '11px' }}>%</Typography>
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>${outbuildingsValue.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Exterior Improvements */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px auto 100px', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Valeur contributive des aménagements extérieurs :</Typography>
          </Box>
          <Box sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <TextField size="small" value={formData.exteriorImprovements || 0} onChange={(e) => handleFieldChange('exteriorImprovements', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' }, width: '100px' }} />
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.exteriorImprovementsPercent || 0}%</Typography>
          </Box>
        </Box>

        {/* Comments */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Commentaire(s) :</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.costComments || "Nous avons appliqué une dépréciation annuelle conformément aux indications suggérées par les manuels de coût Marshall & Swift ou Publication CCR Québec."}
              onChange={(e) => handleFieldChange('costComments', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }}
            />
          </Box>
        </Box>

        {/* Total Cost Value */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', bgcolor: 'primary.lighter' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>Valeur par la méthode du coût</Typography>
          </Box>
          <Box sx={{ p: 2, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>${totalCostValue.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ p: 2, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ fontSize: '11px' }}>Arrondie à :</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>${roundedCostValue.toLocaleString()}</Typography>
          </Box>
        </Box>
      </Box>

      {/* MÉTHODE DE COMPARAISON */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>
            MÉTHODE DE COMPARAISON
          </Typography>
        </Box>

        {/* AG Grid */}
        <Box sx={{ height: 600, width: '100%' }} className="ag-theme-material">
          <AgGridReact
            rowData={gridData}
            columnDefs={columnDefs}
            defaultColDef={{
              resizable: true,
              sortable: false,
              filter: false,
              cellStyle: { fontSize: '13px' }
            }}
            onCellValueChanged={onCellValueChanged}
            suppressMovableColumns={true}
            domLayout="normal"
          />
        </Box>

        {/* Revenue Section */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Revenus bruts effectif:</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Frais d'exploitation :</Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px 200px 200px', gap: 1, mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Revenus nets :</Typography>
            <TextField size="small" value={formData.netIncomeSubject || '0 $'} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            <TextField size="small" value={formData.netIncomeVente1 || '0 $'} onChange={(e) => handleFieldChange('netIncomeVente1', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            <TextField size="small" value={formData.netIncomeVente2 || '0 $'} onChange={(e) => handleFieldChange('netIncomeVente2', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            <TextField size="small" value={formData.netIncomeVente3 || '0 $'} onChange={(e) => handleFieldChange('netIncomeVente3', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px 200px 200px', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Taux global d'actualisation (T.G.A.)</Typography>
            <TextField size="small" value={formData.tgaSubject || 'N/A'} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            <TextField size="small" value={formData.tgaVente1 || '#DIV/0!'} onChange={(e) => handleFieldChange('tgaVente1', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            <TextField size="small" value={formData.tgaVente2 || '#DIV/0!'} onChange={(e) => handleFieldChange('tgaVente2', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            <TextField size="small" value={formData.tgaVente3 || '#DIV/0!'} onChange={(e) => handleFieldChange('tgaVente3', e.target.value)} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
          </Box>
        </Box>

        {/* Residual Value Calculation */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, bgcolor: 'info.lighter', p: 1, borderRadius: '4px' }}>
            Calcul de la valeur résiduelle
          </Typography>

          {/* Additional calculation rows would go here */}
        </Box>

        {/* Final Value */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px', bgcolor: 'primary.lighter', p: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>Valeur par la méthode de comparaison</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>$0</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
