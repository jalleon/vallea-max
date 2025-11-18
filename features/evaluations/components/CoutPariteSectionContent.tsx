'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, ModuleRegistry, AllCommunityModule, ColumnResizedEvent } from 'ag-grid-community';
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

interface CostRow {
  id: string;
  field: string;
  details: string;
  calculation: string;
  nouveau: any;
  depreciation: any;
  valeur: any;
}

interface ComparisonRow {
  id: string;
  field: string;
  subject: any;
  [key: string]: any; // Dynamic vente columns (vente1, vente2, vente3, vente4, etc.)
}

export default function CoutPariteSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: CoutPariteSectionContentProps) {

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

  const [costGridData, setCostGridData] = useState<CostRow[]>([
    { id: '1', field: 'Valeur marchande du terrain', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '2', field: 'Coût neuf du bat.:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '3', field: 'Valeur à neuf:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '4', field: 'Dépréciation:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '5', field: 'Aménagement du sous-sol:', details: 'Neuf:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '6', field: '', details: 'Dépréciation:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '7', field: 'Coût déprécié du bâtiment:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '8', field: 'Extras:', details: 'Neuf:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '9', field: '', details: 'Dépréciation:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '10', field: 'Coût à neuf des dépendances:', details: 'Neuf:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '11', field: '', details: 'Dépréciation:', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '12', field: 'Valeur contributive des aménagements extérieurs:', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '13', field: 'Commentaire(s):', details: '', calculation: '', nouveau: '', depreciation: '', valeur: '' },
    { id: '14', field: 'Valeur par la méthode du coût', details: '', calculation: 'Arrondie à:', nouveau: '', depreciation: '', valeur: '' }
  ]);

  const costColumnDefs: ColDef[] = useMemo(() => [
    {
      field: 'field',
      headerName: '',
      width: 350,
      pinned: 'left',
      wrapText: true,
      autoHeight: true,
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
      width: 120,
      editable: false,
      cellStyle: { fontWeight: 400 }
    },
    {
      field: 'calculation',
      headerName: '',
      width: 400,
      editable: true,
      wrapText: true,
      autoHeight: true,
      cellRenderer: (params: any) => {
        const rowId = params.data.id;
        if (rowId === '1') {
          return `Superficie: ${formData.costLandArea || '-'}pi² x ${formData.costLandPrice || '-'}$ = ${costValues.landValue.toFixed(0)}$`;
        }
        if (rowId === '2') {
          return `Superficie habitable: ${formData.costBuildingArea || '-'}pi² x Taux pondéré: ${formData.costWeightedRate || '-'}$`;
        }
        if (rowId === '3') {
          return '';
        }
        if (rowId === '4') {
          const physDepr = formData.costPhysicalDepr || 0;
          const funcDepr = formData.costFunctionalDepr || 0;
          const econDepr = formData.costEconomicDepr || 0;
          return `Physique: ${physDepr}% Fonctionnelle: ${funcDepr}% Économique: ${econDepr}%`;
        }
        if (rowId === '5') {
          return `${formData.costBasementNew || 0}$`;
        }
        if (rowId === '6') {
          return `${formData.costBasementDepr || 0}%`;
        }
        if (rowId === '7') {
          return '';
        }
        if (rowId === '8') {
          return `${formData.costExtrasNew || 0}$`;
        }
        if (rowId === '9') {
          return `${formData.costExtrasContrib || 0}$`;
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
        return {};
      }
    },
    {
      field: 'valeur',
      headerName: '',
      width: 150,
      editable: false,
      cellRenderer: (params: any) => {
        const rowId = params.data.id;
        if (rowId === '1') return `${costValues.landValue.toFixed(0)}$`;
        if (rowId === '3') return `${costValues.buildingNew.toFixed(0)}$`;
        if (rowId === '4') return `${costValues.totalDepr.toFixed(0)}$`;
        if (rowId === '5') return `${costValues.basementValue.toFixed(0)}$`;
        if (rowId === '6') return `${costValues.basementValue.toFixed(0)}$`;
        if (rowId === '7') return `${costValues.buildingValue.toFixed(0)}$`;
        if (rowId === '8') return `${costValues.extrasNew}$`;
        if (rowId === '9') return `${costValues.extrasContrib.toFixed(0)}$`;
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
        return { fontWeight: 600 };
      }
    },
    {
      field: 'nouveau',
      headerName: '',
      width: 150,
      editable: false,
      cellRenderer: (params: any) => {
        const rowId = params.data.id;
        if (rowId === '14') return `${costValues.rounded.toFixed(0)}$`;
        return '';
      },
      cellStyle: (params) => {
        if (params.data.id === '14') {
          return { fontWeight: 700, color: '#1976d2', backgroundColor: '#e3f2fd' };
        }
        return {};
      }
    }
  ], [formData, costValues]);

  const handleCostCellChange = useCallback((event: CellValueChangedEvent) => {
    const { data, newValue } = event;
    const rowId = data.id;

    // Editable fields are in the calculation column
    // Parse the values from user input and update formData
    if (rowId === '13') {
      // Comments field
      handleFieldChange('costComments', newValue);
    }
  }, [handleFieldChange]);

  // ========== DIRECT COMPARISON - SINGLE COMPREHENSIVE GRID ==========
  const [numComparables, setNumComparables] = useState<number>(3);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load column widths from localStorage on mount
  useEffect(() => {
    const savedWidths = localStorage.getItem('coutParite_columnWidths');
    if (savedWidths) {
      try {
        setColumnWidths(JSON.parse(savedWidths));
      } catch (e) {
        console.error('Failed to parse saved column widths', e);
      }
    }
  }, []);

  const [comparisonGridData, setComparisonGridData] = useState<ComparisonRow[]>([
    // Market Analysis Section
    { id: '1', field: 'Ville', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '2', field: 'Rue', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '3', field: 'No. civique', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '4', field: 'Type de propriété', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '5', field: 'No. enreg. / inscription', subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '6', field: 'Date de vente', subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '7', field: 'Prix de vente', subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '8', field: "Temps d'exposition", subject: 'N/A', vente1: '', vente2: '', vente3: '' },
    { id: '9', field: 'Valeur municipale / terrain', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '10', field: 'Superficie du terrain', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '11', field: 'Sup. du bâtiment (s.-s. exclu)', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '12', field: 'Superficie / % amén. du s.-s.', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '13', field: 'Année const. / Âge apparent', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '14', field: "Nombre d'étages / d'unité", subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '15', field: 'Dépendance(s)', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '16', field: 'Description complémentaire des éléments influant sur les prix de vente par rapport au sujet', subject: '', vente1: '', vente2: '', vente3: '' },

    // Revenue Analysis Section
    { id: '17', field: 'Revenus bruts effectif', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '18', field: "Frais d'exploitation", subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '19', field: 'Revenus nets', subject: '0 $', vente1: '0 $', vente2: '0 $', vente3: '0 $' },
    { id: '20', field: "Taux global d'actualisation (T.G.A.)", subject: 'N/A', vente1: '', vente2: '', vente3: '' },

    // Residual Value Calculation Section
    { id: '21', field: 'Calcul de la valeur résiduelle', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '22', field: 'Temps', subject: '-', vente1: '1.000', vente2: '1.000', vente3: '1.000' },
    { id: '23', field: 'Condition de vente', subject: '-', vente1: '1.00', vente2: '1.00', vente3: '1.00' },
    { id: '24', field: 'Prix de vente ajusté', subject: '-', vente1: '0 $', vente2: '0 $', vente3: '0 $' },
    { id: '25', field: 'Valeur du terrain', subject: '-', vente1: '0 $', vente2: '0 $', vente3: '0 $' },
    { id: '26', field: 'Prix résiduel du bâtiment', subject: '-', vente1: '0 $', vente2: '0 $', vente3: '0 $' },
    { id: '27', field: 'Prix résiduel du bât. au pi²', subject: '-', vente1: '', vente2: '', vente3: '' },

    // Adjustments Section
    { id: '28', field: 'Ajustements', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '29', field: 'Localisation', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '30', field: 'Superficie du bâtiment', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '31', field: 'Âge / Condition', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '32', field: 'Aménagement intérieur', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '33', field: 'Sous-sol', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '34', field: 'Qualité du bâtiment', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '35', field: 'Extras', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '36', field: 'Total des ajustements', subject: '', vente1: '0%', vente2: '0%', vente3: '0%' },
    { id: '37', field: 'Taux unitaire ajusté ($/pi²)', subject: '', vente1: '', vente2: '', vente3: '' },

    // Final Value Section
    { id: '38', field: 'Valeur du sujet', subject: '', vente1: '', vente2: '', vente3: '' },
    { id: '39', field: 'Superficie du terrain sujet', subject: '', vente1: 'X', vente2: '', vente3: '0 $' },
    { id: '40', field: 'Superficie du bâtiment sujet', subject: '', vente1: 'X', vente2: '', vente3: '0 $' },
    { id: '41', field: 'Valeur par la méthode de comparaison', subject: '', vente1: '', vente2: '', vente3: '' }
  ]);

  const comparisonColumnDefs: ColDef[] = useMemo(() => {
    const columns: ColDef[] = [
      // First column - Field names
      {
        field: 'field',
        headerName: 'Analyse du marché (Ventes comparables)',
        width: columnWidths['field'] || 450,
        pinned: 'left',
        sortable: false,
        headerClass: 'custom-header',
        wrapText: true,
        autoHeight: true,
        resizable: true,
        cellStyle: (params) => {
          const rowId = params.data.id;
          if (['21', '28', '38'].includes(rowId)) {
            return { fontWeight: 700, backgroundColor: '#1976d2', color: '#fff' };
          }
          if (['19', '36', '41'].includes(rowId)) {
            return { fontWeight: 700, backgroundColor: '#e3f2fd' };
          }
          if (rowId === '16') {
            return { fontWeight: 400, backgroundColor: '#e8e8e8', whiteSpace: 'pre-line', lineHeight: '1.5' };
          }
          if (rowId === '17') {
            return { fontWeight: 400, backgroundColor: '#e8e8e8' };
          }
          return { fontWeight: 400, backgroundColor: '#e8e8e8' };
        }
      },
      // Subject column
      {
        field: 'subject',
        headerName: 'Sujet',
        width: columnWidths['subject'] || 200,
        editable: true,
        sortable: false,
        headerClass: 'custom-header',
        wrapText: true,
        autoHeight: true,
        resizable: true,
        cellStyle: (params) => {
          const rowId = params.data.id;
          if (['21', '28', '38'].includes(rowId)) {
            return { fontWeight: 700, backgroundColor: '#1976d2', color: '#fff' };
          }
          if (['19', '36', '41'].includes(rowId)) {
            return { backgroundColor: '#e3f2fd', fontWeight: 600 };
          }
          if (rowId === '16') {
            return { backgroundColor: '#e3f2fd', fontWeight: 400, whiteSpace: 'pre-line', lineHeight: '1.5' };
          }
          if (rowId === '17') {
            return { backgroundColor: '#e3f2fd', fontWeight: 400 };
          }
          return { backgroundColor: '#e3f2fd', fontWeight: 400 };
        }
      }
    ];

    // Dynamically add vente columns based on numComparables
    for (let i = 1; i <= numComparables; i++) {
      const field = `vente${i}`;
      columns.push({
        field,
        headerName: `Vente no ${i}`,
        width: columnWidths[field] || 180,
        editable: true,
        sortable: false,
        headerClass: 'custom-header',
        wrapText: true,
        autoHeight: true,
        resizable: true,
        cellStyle: (params) => {
          const rowId = params.data.id;
          if (['21', '28', '38'].includes(rowId)) {
            return { fontWeight: 700, backgroundColor: '#1976d2', color: '#fff' };
          }
          if (['19', '36', '41'].includes(rowId)) {
            return { fontWeight: 600 };
          }
          if (['16', '17'].includes(rowId)) {
            return { fontWeight: 400, whiteSpace: 'pre-line', lineHeight: '1.5' };
          }
          return { fontWeight: 400 };
        }
      });
    }

    return columns;
  }, [numComparables, columnWidths]);

  const handleComparisonCellChange = useCallback((event: CellValueChangedEvent) => {
    const updatedData = [...comparisonGridData];
    const rowIndex = updatedData.findIndex(row => row.id === event.data.id);
    if (rowIndex !== -1) {
      updatedData[rowIndex] = event.data;
      setComparisonGridData(updatedData);
    }
  }, [comparisonGridData]);

  const addComparable = useCallback(() => {
    const newNum = numComparables + 1;
    const newColKey = `vente${newNum}`;

    // Add empty column to all rows
    const updatedData = comparisonGridData.map(row => ({
      ...row,
      [newColKey]: getDefaultValue(row.id)
    }));

    setComparisonGridData(updatedData);
    setNumComparables(newNum);
  }, [numComparables, comparisonGridData]);

  const handleRemoveClick = useCallback(() => {
    if (numComparables <= 1) return; // Keep at least 1 comparable
    setDeleteDialogOpen(true);
  }, [numComparables]);

  const handleRemoveConfirm = useCallback(() => {
    const colToRemove = `vente${numComparables}`;

    // Remove last column from all rows
    const updatedData = comparisonGridData.map(row => {
      const { [colToRemove]: _, ...rest } = row;
      return rest;
    });

    setComparisonGridData(updatedData);
    setNumComparables(numComparables - 1);
    setDeleteDialogOpen(false);
  }, [numComparables, comparisonGridData]);

  const handleRemoveCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  // Helper function to get default values for new columns
  const getDefaultValue = (rowId: string): string => {
    if (rowId === '19') return '0 $';
    if (rowId === '22') return '1.000';
    if (rowId === '23') return '1.00';
    if (['24', '25', '26'].includes(rowId)) return '0 $';
    if (rowId === '36') return '0%';
    if (rowId === '39' || rowId === '40') return '0 $';
    return '';
  };

  // Handle column resize and save to localStorage
  const handleColumnResized = useCallback((event: ColumnResizedEvent) => {
    if (event.finished && event.column) {
      const field = event.column.getColId();
      const newWidth = event.column.getActualWidth();

      const updatedWidths = {
        ...columnWidths,
        [field]: newWidth
      };

      setColumnWidths(updatedWidths);
      localStorage.setItem('coutParite_columnWidths', JSON.stringify(updatedWidths));
    }
  }, [columnWidths]);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Méthode du Coût
        </Typography>

        {/* Cost AG Grid - All data entry is directly in the table */}
        <Box className="ag-theme-material" sx={{ height: 550, width: '100%' }}>
          <AgGridReact
            rowData={costGridData}
            columnDefs={costColumnDefs}
            onCellValueChanged={handleCostCellChange}
            domLayout="normal"
            suppressMovableColumns={true}
            enableCellTextSelection={true}
          />
        </Box>
      </Box>

      {/* DIRECT COMPARISON SECTION - SINGLE COMPREHENSIVE TABLE */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Méthode de Comparaison Directe
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleRemoveClick}
              disabled={numComparables <= 1}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Remove Comparable
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={addComparable}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Add Comparable
            </Button>
          </Box>
        </Box>

        {/* Single comprehensive AG Grid with all sections */}
        <Box className="ag-theme-material" sx={{ height: 1200, width: '100%' }}>
          <AgGridReact
            rowData={comparisonGridData}
            columnDefs={comparisonColumnDefs}
            onCellValueChanged={handleComparisonCellChange}
            onColumnResized={handleColumnResized}
            domLayout="normal"
            suppressMovableColumns={true}
            enableCellTextSelection={true}
          />
        </Box>

        {/* Remove Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleRemoveCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Remove Comparable</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove "Vente no {numComparables}"? All data in this column will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleRemoveCancel} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              onClick={handleRemoveConfirm}
              color="error"
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
