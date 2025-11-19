'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Paper,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, ModuleRegistry, AllCommunityModule, ColumnResizedEvent, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/features/library/types/property.types';

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

  // Property selection dialog
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedVenteIndex, setSelectedVenteIndex] = useState<number | null>(null);
  const [libraryProperties, setLibraryProperties] = useState<any[]>([]);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');

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

  const [comparisonGridData, setComparisonGridData] = useState<ComparisonRow[]>(() => {
    // Initialize from formData if available
    if (formData.comparisonGridData) {
      return formData.comparisonGridData;
    }
    return [
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
    ];
  });

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
            return { fontWeight: 700, backgroundColor: '#1976d2', color: '#fff' } as any;
          }
          if (['19', '36', '41'].includes(rowId)) {
            return { fontWeight: 700, backgroundColor: '#e3f2fd' } as any;
          }
          if (rowId === '16') {
            return { fontWeight: 400, backgroundColor: '#e8e8e8', whiteSpace: 'pre-line', lineHeight: '1.5' } as any;
          }
          if (rowId === '17') {
            return { fontWeight: 400, backgroundColor: '#e8e8e8' } as any;
          }
          return { fontWeight: 400, backgroundColor: '#e8e8e8' } as any;
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
            return { fontWeight: 700, backgroundColor: '#1976d2', color: '#fff' } as any;
          }
          if (['19', '36', '41'].includes(rowId)) {
            return { backgroundColor: '#e3f2fd', fontWeight: 600 } as any;
          }
          if (rowId === '16') {
            return { backgroundColor: '#e3f2fd', fontWeight: 400, whiteSpace: 'pre-line', lineHeight: '1.5' } as any;
          }
          if (rowId === '17') {
            return { backgroundColor: '#e3f2fd', fontWeight: 400 } as any;
          }
          return { backgroundColor: '#e3f2fd', fontWeight: 400 } as any;
        }
      }
    ];

    // Dynamically add vente columns based on numComparables
    for (let i = 1; i <= numComparables; i++) {
      const field = `vente${i}`;
      const venteIndex = i;
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
            return { fontWeight: 700, backgroundColor: '#1976d2', color: '#fff' } as any;
          }
          if (['19', '36', '41'].includes(rowId)) {
            return { fontWeight: 600 } as any;
          }
          if (['16', '17'].includes(rowId)) {
            return { fontWeight: 400, whiteSpace: 'pre-line', lineHeight: '1.5' } as any;
          }
          return { fontWeight: 400 } as any;
        },
        cellRenderer: (params: ICellRendererParams) => {
          // Add search icon for "Rue" row (id='2')
          if (params.data.id === '2') {
            return (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                <span style={{ flex: 1 }}>{params.value || ''}</span>
                <IconButton
                  size="small"
                  onClick={() => handleSelectFromLibrary(venteIndex)}
                  title="Select from Library"
                  sx={{ padding: '4px', color: 'primary.main' }}
                >
                  <Search fontSize="small" />
                </IconButton>
              </Box>
            );
          }
          return params.value;
        }
      });
    }

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numComparables, columnWidths]);

  const handleComparisonCellChange = useCallback((event: CellValueChangedEvent) => {
    const updatedData = [...comparisonGridData];
    const rowIndex = updatedData.findIndex(row => row.id === event.data.id);
    if (rowIndex !== -1) {
      updatedData[rowIndex] = event.data;
      setComparisonGridData(updatedData);
    }
  }, [comparisonGridData]);

  // Load properties from library
  const handleSelectFromLibrary = useCallback(async (venteIndex: number) => {
    setSelectedVenteIndex(venteIndex);
    setPropertyDialogOpen(true);

    try {
      const supabase = createClient();
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLibraryProperties(properties || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }, []);

  // Handle property selection from dialog
  const handlePropertySelect = useCallback((property: any) => {
    if (selectedVenteIndex === null) return;

    const venteKey = `vente${selectedVenteIndex}`;

    // Map property data to grid rows
    const updatedData = comparisonGridData.map(row => {
      const newRow = { ...row };

      switch (row.id) {
        case '1': // Ville
          newRow[venteKey] = property.ville || '';
          break;
        case '2': // Rue
          newRow[venteKey] = property.adresse || '';
          break;
        case '3': // No. civique
          // Extract street number from adresse if available
          newRow[venteKey] = property.numero_civique || '';
          break;
        case '4': // Type de propriété
          newRow[venteKey] = property.type_propriete || '';
          break;
        case '5': // No. enreg. / inscription
          newRow[venteKey] = property.numero_mls || property.numero_lot || '';
          break;
        case '6': // Date de vente
          newRow[venteKey] = property.date_vente || '';
          break;
        case '7': // Prix de vente
          newRow[venteKey] = property.prix_vente ? `${property.prix_vente.toLocaleString()} $` : '';
          break;
        case '10': // Superficie du terrain
          newRow[venteKey] = property.superficie_terrain_m2 || property.superficie_terrain_pi2 || '';
          break;
        case '11': // Sup. du bâtiment
          newRow[venteKey] = property.superficie_habitable_pi2 || property.aire_habitable_pi2 || '';
          break;
        case '13': // Année construction
          newRow[venteKey] = property.annee_construction || '';
          break;
      }

      return newRow;
    });

    setComparisonGridData(updatedData);
    setPropertyDialogOpen(false);
    setPropertySearchQuery('');
  }, [selectedVenteIndex, comparisonGridData]);

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
      return rest as ComparisonRow;
    });

    setComparisonGridData(updatedData);
    setNumComparables(numComparables - 1);
    setDeleteDialogOpen(false);
  }, [numComparables, comparisonGridData]);

  const handleRemoveCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  // Sync comparison grid data to parent whenever it changes
  // Use a ref to track the previous stringified data to avoid infinite loops
  const prevDataRef = useRef<string>('');

  useEffect(() => {
    // Transform grid data into a format compatible with AdjustmentsForm
    // The grid has rows with fields like: { id, field, subject, vente1, vente2, vente3, ... }
    // We need to transform this into: { subject: {...}, comparables: [{...}, {...}, ...] }
    // matching the ComparableProperty interface from DirectComparisonForm

    const getRowById = (id: string) => comparisonGridData.find(row => row.id === id);

    // Helper to parse sale price (remove $ and commas)
    const parseSalePrice = (value: string): number => {
      if (!value) return 0;
      const cleaned = String(value).replace(/[$,\s]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // Extract subject property data (matching ComparableProperty interface)
    const subject = {
      id: 'subject',
      address: `${getRowById('3')?.subject || ''} ${getRowById('2')?.subject || ''}`.trim(),
      addressLine2: getRowById('1')?.subject || '', // City
      dataSource: '',
      saleDate: '',
      salePrice: 0,
      daysOnMarket: 0,
      location: getRowById('29')?.subject || '', // Localisation
      lotSize: getRowById('10')?.subject || '',
      buildingType: getRowById('4')?.subject || '',
      designStyle: '',
      age: getRowById('13')?.subject || '',
      condition: getRowById('31')?.subject || '', // Âge / Condition
      livingArea: getRowById('11')?.subject || '',
      roomsTotal: 0,
      roomsBedrooms: 0,
      roomsBathrooms: '',
      basement: getRowById('12')?.subject || '', // Superficie / % amén. du s.-s.
      parking: getRowById('15')?.subject || '', // Dépendance(s)
      quality: getRowById('34')?.subject || '', // Qualité du bâtiment
      extras: getRowById('35')?.subject || '',
      assessedValue: getRowById('9')?.subject || '', // Valeur municipale / terrain
    };

    // Extract comparables data (vente1, vente2, vente3, etc.)
    const comparables = [];
    for (let i = 1; i <= numComparables; i++) {
      const venteKey = `vente${i}`;
      const addressNumber = getRowById('3')?.[venteKey] || '';
      const addressStreet = getRowById('2')?.[venteKey] || '';
      const addressCity = getRowById('1')?.[venteKey] || '';

      comparables.push({
        id: `comparable-${i}`,
        address: `${addressNumber} ${addressStreet}`.trim(),
        addressLine2: addressCity,
        dataSource: getRowById('5')?.[venteKey] || '', // No. enreg. / inscription
        saleDate: getRowById('6')?.[venteKey] || '',
        salePrice: parseSalePrice(getRowById('7')?.[venteKey] || '0'),
        daysOnMarket: parseInt(getRowById('8')?.[venteKey] || '0'),
        location: getRowById('29')?.[venteKey] || '', // Localisation
        lotSize: getRowById('10')?.[venteKey] || '',
        buildingType: getRowById('4')?.[venteKey] || '',
        designStyle: '',
        age: getRowById('13')?.[venteKey] || '',
        condition: getRowById('31')?.[venteKey] || '', // Âge / Condition
        livingArea: getRowById('11')?.[venteKey] || '',
        roomsTotal: 0,
        roomsBedrooms: 0,
        roomsBathrooms: '',
        basement: getRowById('12')?.[venteKey] || '', // Superficie / % amén. du s.-s.
        parking: getRowById('15')?.[venteKey] || '', // Dépendance(s)
        quality: getRowById('34')?.[venteKey] || '', // Qualité du bâtiment
        extras: getRowById('35')?.[venteKey] || '',
        assessedValue: getRowById('9')?.[venteKey] || '', // Valeur municipale / terrain
      });
    }

    // Only call onChange if the data actually changed (avoid infinite loop)
    const currentDataString = JSON.stringify({ comparisonGridData, numComparables });

    if (currentDataString !== prevDataRef.current) {
      prevDataRef.current = currentDataString;

      // Save to parent with both the grid data and the transformed data
      onChange({
        ...formData,
        comparisonGridData, // Save raw grid data for re-initialization
        subject,  // Transformed subject for AdjustmentsForm
        comparables, // Transformed comparables for AdjustmentsForm
        numComparables,
      });
    }
  }, [comparisonGridData, numComparables]); // Removed onChange and formData from dependencies

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

      {/* DIRECT COMPARISON SECTION - SINGLE COMPREHENSIVE TABLE */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Méthode de Comparaison Directe
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {numComparables > 1 && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleRemoveClick}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Remove Last
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={<Search />}
              onClick={() => handleSelectFromLibrary(numComparables <= 8 ? numComparables : 1)}
              disabled={numComparables >= 8}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #10b981 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #059669 100%)',
                }
              }}
            >
              Load from Library
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add />}
              onClick={addComparable}
              disabled={numComparables >= 8}
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

        {/* Property Selection Dialog */}
        <Dialog
          open={propertyDialogOpen}
          onClose={() => {
            setPropertyDialogOpen(false);
            setPropertySearchQuery('');
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '80vh', maxHeight: '800px' }
          }}
        >
          <DialogTitle sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700}>Select from Library</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {libraryProperties.length} {libraryProperties.length === 1 ? 'property' : 'properties'} available
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {/* Search Bar */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by address, city, MLS number, or matricule..."
                value={propertySearchQuery}
                onChange={(e) => setPropertySearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  sx: { bgcolor: 'background.paper' }
                }}
              />
            </Box>

            {/* Property List */}
            <Box sx={{ p: 2, overflowY: 'auto', height: 'calc(80vh - 240px)' }}>
              {libraryProperties.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>No properties available in library</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {libraryProperties
                    .filter(property => {
                      if (!propertySearchQuery) return true;
                      const query = propertySearchQuery.toLowerCase();
                      return (
                        property.adresse?.toLowerCase().includes(query) ||
                        property.ville?.toLowerCase().includes(query) ||
                        property.numero_mls?.toLowerCase().includes(query) ||
                        property.matricule?.toLowerCase().includes(query)
                      );
                    })
                    .map((property) => {
                      // Format living area
                      let livingAreaDisplay = '';
                      if (property.aire_habitable_pi2) {
                        livingAreaDisplay = `${property.aire_habitable_pi2.toLocaleString()} pi²`;
                      } else if (property.superficie_habitable_pi2) {
                        livingAreaDisplay = `${property.superficie_habitable_pi2.toLocaleString()} pi²`;
                      }

                      // Format lot size
                      let lotSizeDisplay = '';
                      if (property.superficie_terrain_m2) {
                        lotSizeDisplay = `${property.superficie_terrain_m2} m²`;
                      } else if (property.superficie_terrain_pi2) {
                        lotSizeDisplay = `${property.superficie_terrain_pi2.toLocaleString()} pi²`;
                      }

                      return (
                        <Paper
                          key={property.id}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover',
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                          onClick={() => {
                            handlePropertySelect(property);
                            setPropertySearchQuery('');
                          }}
                        >
                          <Grid container spacing={2}>
                            {/* Left Column - Main Info */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                {property.adresse}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {property.ville}, {property.province} {property.code_postal}
                              </Typography>
                              {property.numero_mls && (
                                <Chip
                                  label={`MLS: ${property.numero_mls}`}
                                  size="small"
                                  sx={{ mt: 1, mr: 1 }}
                                />
                              )}
                              {property.type_propriete && (
                                <Chip
                                  label={property.type_propriete}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Grid>

                            {/* Right Column - Details */}
                            <Grid item xs={12} md={6}>
                              <Grid container spacing={1.5}>
                                {property.prix_vente && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Sale Price
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} color="success.main">
                                      ${property.prix_vente.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                )}
                                {property.date_vente && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Sale Date
                                    </Typography>
                                    <Typography variant="body2">
                                      {new Date(property.date_vente).toLocaleDateString()}
                                    </Typography>
                                  </Grid>
                                )}
                                {livingAreaDisplay && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Living Area
                                    </Typography>
                                    <Typography variant="body2">
                                      {livingAreaDisplay}
                                    </Typography>
                                  </Grid>
                                )}
                                {lotSizeDisplay && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Lot Size
                                    </Typography>
                                    <Typography variant="body2">
                                      {lotSizeDisplay}
                                    </Typography>
                                  </Grid>
                                )}
                                {property.nombre_chambres !== null && property.nombre_chambres !== undefined && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Bedrooms
                                    </Typography>
                                    <Typography variant="body2">
                                      {property.nombre_chambres}
                                    </Typography>
                                  </Grid>
                                )}
                                {(property.salle_bain || property.salle_eau) && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Bathrooms
                                    </Typography>
                                    <Typography variant="body2">
                                      {property.salle_bain || 0}:{property.salle_eau || 0}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={() => {
                setPropertyDialogOpen(false);
                setPropertySearchQuery('');
              }}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
