'use client';

import { useState, useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface CostApproachSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
  allSectionsData: any;
}

interface CostRow {
  id: string;
  field: string;
  details: string;
  calculation: string;
  nouveau: any;
  depreciation: any;
  valeur: any;
}

export default function CostApproachSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: CostApproachSectionContentProps) {

  // ========== COST APPROACH GRID DATA ==========
  const calculateCostValues = useCallback(() => {
    const landArea = parseFloat(formData.costLandArea || 0);
    const landPrice = parseFloat(formData.costLandPrice || 0);
    const landValue = landArea * landPrice;

    const buildingArea = parseFloat(formData.costBuildingArea || 0);
    const weightedRate = parseFloat(formData.costWeightedRate || 0);
    const buildingNew = buildingArea * weightedRate;

    const physicalDepr = parseFloat(formData.costPhysicalDepr || 0) / 100;
    const functionalDepr = parseFloat(formData.costFunctionalDepr || 0) / 100;
    const economicDepr = parseFloat(formData.costEconomicDepr || 0) / 100;
    const totalDepr = buildingNew * (physicalDepr + functionalDepr + economicDepr);
    const buildingValue = buildingNew - totalDepr;

    const basementNew = parseFloat(formData.costBasementNew || 0);
    const basementDepr = parseFloat(formData.costBasementDepr || 0) / 100;
    const basementValue = basementNew - (basementNew * basementDepr);

    const extrasNew = parseFloat(formData.costExtrasNew || 0);
    const extrasContrib = parseFloat(formData.costExtrasContrib || 0);

    const outbuildingsNew = parseFloat(formData.costOutbuildingsNew || 0);
    const outbuildingsDepr = parseFloat(formData.costOutbuildingsDepr || 0) / 100;
    const outbuildingsValue = outbuildingsNew - (outbuildingsNew * outbuildingsDepr);

    const exteriorImprov = parseFloat(formData.costExteriorImprov || 0);

    const total = landValue + buildingValue + basementValue + extrasContrib + outbuildingsValue + exteriorImprov;
    const rounded = Math.round(total / 1000) * 1000;

    return {
      landValue,
      buildingNew,
      totalDepr,
      buildingValue,
      basementNew,
      basementValue,
      extrasNew,
      extrasContrib,
      outbuildingsNew,
      outbuildingsValue,
      exteriorImprov,
      total,
      rounded
    };
  }, [formData]);

  const costValues = calculateCostValues();

  const [costGridData] = useState<CostRow[]>([
    { id: '1', field: 'Valeur marchande du terrain', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '2', field: 'Coût neuf du bat.:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '3', field: 'Valeur à neuf:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '4', field: 'Dépréciation:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '5', field: 'Aménagement du sous-sol', details: 'Neuf:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '6', field: '', details: 'Dépréciation:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '7', field: 'Extras', details: 'Neuf:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '8', field: '', details: 'Dépréciation:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '9', field: 'Coût déprécié du bâtiment:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '10', field: 'Coût à neuf des dépendances', details: 'Neuf:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '11', field: '', details: 'Dépréciation:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '12', field: 'Valeur contributive des aménagements extérieurs:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '13', field: 'Commentaire(s):', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '14', field: 'Valeur par la méthode du coût', details: '', calculation: 'Arrondie à:', nouveau: '', depreciation: '', valeur: '' }
  ]);

  const costColumnDefs: ColDef[] = useMemo(() => [
    {
      field: 'field',
      headerName: '',
      width: 250,
      pinned: 'left',
      wrapText: true,
      autoHeight: true,
      sortable: false,
      cellStyle: (params) => {
        if (params.data.id === '14') {
          return { fontWeight: 700, backgroundColor: '#e3f2fd' };
        }
        if (params.data.id === '7') {
          return { fontWeight: 600, backgroundColor: '#f5f5f5' };
        }
        return { fontWeight: 400, backgroundColor: '#fafafa' };
      }
    },
    {
      field: 'details',
      headerName: '',
      width: 90,
      editable: false,
      sortable: false,
      cellStyle: { fontWeight: 400 }
    },
    {
      field: 'calculation',
      headerName: '',
      width: 320,
      editable: true,
      wrapText: true,
      autoHeight: true,
      sortable: false,
      cellRenderer: (params: any) => {
        const rowId = params.data.id;
        if (rowId === '1') {
          return `Superficie: ${formData.costLandArea || '-'}pi² x ${formData.costLandPrice || '-'}$ =`;
        }
        if (rowId === '2') {
          return `Superficie habitable: ${formData.costBuildingArea || '-'}pi² x Taux pondéré: ${formData.costWeightedRate || '-'}$ =`;
        }
        if (rowId === '3') {
          return '';
        }
        if (rowId === '4') {
          const physDepr = formData.costPhysicalDepr || 0;
          const funcDepr = formData.costFunctionalDepr || 0;
          const econDepr = formData.costEconomicDepr || 0;
          return `Physique: ${physDepr}% Fonctionnelle: ${funcDepr}% Économique: ${econDepr}% =`;
        }
        if (rowId === '5') {
          return `${formData.costBasementNew || 0}$`;
        }
        if (rowId === '6') {
          return `${formData.costBasementDepr || 0}%`;
        }
        if (rowId === '7') {
          return `${formData.costExtrasNew || 0}$`;
        }
        if (rowId === '8') {
          return `${formData.costExtrasContrib || 0}$`;
        }
        if (rowId === '9') {
          return '';
        }
        if (rowId === '10') {
          return `${formData.costOutbuildingsNew || '-'}$`;
        }
        if (rowId === '11') {
          return `${formData.costOutbuildingsDepr || 0}%`;
        }
        if (rowId === '12') {
          return `${formData.costExteriorImprov || 0} ${formData.costExteriorImprovPercent || 0}%`;
        }
        if (rowId === '13') {
          return formData.costComments || 'Nous avons appliqué une dépréciation annuelle conformément aux indications suggérées par les manuels de coût Marshall & Swift ou Publication CCR Québec.';
        }
        if (rowId === '14') {
          return 'Arrondie à:';
        }
        return params.value || '';
      },
      cellStyle: (params) => {
        if (params.data.id === '14') {
          return { fontWeight: 700, backgroundColor: '#e3f2fd' };
        }
        return undefined;
      }
    },
    {
      field: 'valeur',
      headerName: '',
      width: 110,
      editable: false,
      sortable: false,
      cellRenderer: (params: any) => {
        const rowId = params.data.id;
        if (rowId === '1') return `${costValues.landValue.toFixed(0)}$`;
        if (rowId === '2') return `${costValues.buildingNew.toFixed(0)}$`;
        if (rowId === '3') return `${costValues.buildingNew.toFixed(0)}$`;
        if (rowId === '4') return `${costValues.totalDepr.toFixed(0)}$`;
        if (rowId === '5') return `${costValues.basementValue.toFixed(0)}$`;
        if (rowId === '6') return `${costValues.basementValue.toFixed(0)}$`;
        if (rowId === '7') return `${costValues.extrasNew}$`;
        if (rowId === '8') return `${costValues.extrasContrib.toFixed(0)}$`;
        if (rowId === '9') return `${costValues.buildingValue.toFixed(0)}$`;
        if (rowId === '10') return `${costValues.outbuildingsNew}$`;
        if (rowId === '11') return `${costValues.outbuildingsValue.toFixed(0)}$`;
        if (rowId === '12') return `${costValues.exteriorImprov.toFixed(0)}$`;
        if (rowId === '14') return `${costValues.total.toFixed(0)}$`;
        return params.value || '';
      },
      cellStyle: (params) => {
        if (params.data.id === '14') {
          return { fontWeight: 700, color: '#1976d2', backgroundColor: '#e3f2fd' };
        }
        return { fontWeight: 600 } as any;
      }
    },
    {
      field: 'nouveau',
      headerName: '',
      width: 110,
      editable: false,
      sortable: false,
      cellRenderer: (params: any) => {
        const rowId = params.data.id;
        if (rowId === '14') return `${costValues.rounded.toFixed(0)}$`;
        return '';
      },
      cellStyle: (params) => {
        if (params.data.id === '14') {
          return { fontWeight: 700, color: '#1976d2', backgroundColor: '#e3f2fd' };
        }
        return undefined;
      }
    }
  ], [formData, costValues]);

  const handleCostCellChange = useCallback((event: CellValueChangedEvent) => {
    const { data, newValue } = event;
    const rowId = data.id;

    // Editable fields are in the calculation column
    if (rowId === '13') {
      // Comments field
      handleFieldChange('costComments', newValue);
    }
  }, [handleFieldChange]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Custom CSS for AG Grid headers */}
      <style>{`
        .custom-header {
          background-color: #1976d2 !important;
          color: white !important;
          font-weight: 600 !important;
        }
      `}</style>

      {/* COST APPROACH SECTION */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Méthode du Coût
        </Typography>

        {/* Cost AG Grid - All data entry is directly in the table */}
        <Box className="ag-theme-material" sx={{ height: 480, width: '100%' }}>
          <AgGridReact
            rowData={costGridData}
            columnDefs={costColumnDefs}
            onCellValueChanged={handleCostCellChange}
            domLayout="normal"
            suppressMovableColumns={true}
            enableCellTextSelection={true}
            headerHeight={0}
            rowHeight={28}
          />
        </Box>
      </Box>
    </Box>
  );
}
