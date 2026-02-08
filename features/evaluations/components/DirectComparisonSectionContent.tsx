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
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  alpha
} from '@mui/material';
import { Add, Delete, Search, PlaylistPlay } from '@mui/icons-material';
import { Badge } from '@mui/material';
import LoadFromListDialog from './LoadFromListDialog';
import { comparableListsService } from '@/features/library/_api/comparable-lists.service';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, ModuleRegistry, AllCommunityModule, ColumnResizedEvent, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface DirectComparisonSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
  allSectionsData: any;
}

interface ComparisonRow {
  id: string;
  field: string;
  subject: any;
  [key: string]: any; // Dynamic vente columns (vente1, vente2, vente3, vente4, etc.)
}

export default function DirectComparisonSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: DirectComparisonSectionContentProps) {
  const t = useTranslations('evaluations.directComparison');

  // ========== DIRECT COMPARISON - SINGLE COMPREHENSIVE GRID ==========
  const [numComparables, setNumComparables] = useState<number>(3);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Property selection dialog
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedVenteIndex, setSelectedVenteIndex] = useState<number | null>(null);
  const [libraryProperties, setLibraryProperties] = useState<any[]>([]);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadFromListOpen, setLoadFromListOpen] = useState(false);
  const [compListCount, setCompListCount] = useState(0);

  // Fetch comp list count for badge
  useEffect(() => {
    if (appraisalData?.id) {
      comparableListsService.getByType(appraisalData.id, 'direct_comparison')
        .then(list => setCompListCount(list?.items?.length || 0))
        .catch(() => {});
    }
  }, [appraisalData?.id]);

  // Status priority for sorting (Vendu first, then Sujet, then others)
  const STATUS_PRIORITY: Record<string, number> = {
    'Vendu': 1,
    'Sujet': 2,
    'Actif': 3
  };

  // Status color mapping
  const STATUS_COLORS: Record<string, string> = {
    'Sujet': '#7c3aed',  // Purple
    'Vendu': '#059669',  // Green
    'Actif': '#2563eb'   // Blue
  };

  // Sort by status priority
  const sortByStatus = (a: any, b: any) => {
    const priorityA = STATUS_PRIORITY[a.status] || 99;
    const priorityB = STATUS_PRIORITY[b.status] || 99;
    return priorityA - priorityB;
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusKey = status?.toLowerCase();
    if (statusKey === 'sujet') return 'Sujet';
    if (statusKey === 'vendu') return 'Vendu';
    if (statusKey === 'actif') return 'Actif';
    return status;
  };

  // Load column widths from localStorage on mount
  useEffect(() => {
    const savedWidths = localStorage.getItem('directComparison_columnWidths');
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
    setStatusFilter('all');
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
  const prevDataRef = useRef<string>('');

  useEffect(() => {
    const getRowById = (id: string) => comparisonGridData.find(row => row.id === id);

    // Helper to parse sale price (remove $ and commas)
    const parseSalePrice = (value: string): number => {
      if (!value) return 0;
      const cleaned = String(value).replace(/[$,\s]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // Extract subject property data
    const subject = {
      id: 'subject',
      address: `${getRowById('3')?.subject || ''} ${getRowById('2')?.subject || ''}`.trim(),
      addressLine2: getRowById('1')?.subject || '',
      dataSource: '',
      saleDate: '',
      salePrice: 0,
      daysOnMarket: 0,
      location: getRowById('29')?.subject || '',
      lotSize: getRowById('10')?.subject || '',
      buildingType: getRowById('4')?.subject || '',
      designStyle: '',
      age: getRowById('13')?.subject || '',
      condition: getRowById('31')?.subject || '',
      livingArea: getRowById('11')?.subject || '',
      roomsTotal: 0,
      roomsBedrooms: 0,
      roomsBathrooms: '',
      basement: getRowById('12')?.subject || '',
      parking: getRowById('15')?.subject || '',
      quality: getRowById('34')?.subject || '',
      extras: getRowById('35')?.subject || '',
      assessedValue: getRowById('9')?.subject || '',
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
        dataSource: getRowById('5')?.[venteKey] || '',
        saleDate: getRowById('6')?.[venteKey] || '',
        salePrice: parseSalePrice(getRowById('7')?.[venteKey] || '0'),
        daysOnMarket: parseInt(getRowById('8')?.[venteKey] || '0'),
        location: getRowById('29')?.[venteKey] || '',
        lotSize: getRowById('10')?.[venteKey] || '',
        buildingType: getRowById('4')?.[venteKey] || '',
        designStyle: '',
        age: getRowById('13')?.[venteKey] || '',
        condition: getRowById('31')?.[venteKey] || '',
        livingArea: getRowById('11')?.[venteKey] || '',
        roomsTotal: 0,
        roomsBedrooms: 0,
        roomsBathrooms: '',
        basement: getRowById('12')?.[venteKey] || '',
        parking: getRowById('15')?.[venteKey] || '',
        quality: getRowById('34')?.[venteKey] || '',
        extras: getRowById('35')?.[venteKey] || '',
        assessedValue: getRowById('9')?.[venteKey] || '',
      });
    }

    // Only call onChange if the data actually changed
    const currentDataString = JSON.stringify({ comparisonGridData, numComparables });

    if (currentDataString !== prevDataRef.current) {
      prevDataRef.current = currentDataString;

      onChange({
        ...formData,
        comparisonGridData,
        subject,
        comparables,
        numComparables,
      });
    }
  }, [comparisonGridData, numComparables]);

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

  // Handle loading properties from comparable list
  const handleLoadFromList = useCallback((properties: any[]) => {
    let updatedData = [...comparisonGridData];
    let currentNum = numComparables;

    properties.forEach((property) => {
      // Add a new column if needed
      currentNum += 1;
      const venteKey = `vente${currentNum}`;
      updatedData = updatedData.map(row => ({
        ...row,
        [venteKey]: getDefaultValue(row.id)
      }));

      // Map property data to the new column
      updatedData = updatedData.map(row => {
        const newRow = { ...row };
        switch (row.id) {
          case '1': newRow[venteKey] = property.ville || ''; break;
          case '2': newRow[venteKey] = property.adresse || ''; break;
          case '4': newRow[venteKey] = property.type_propriete || ''; break;
          case '5': newRow[venteKey] = property.numero_mls || ''; break;
          case '6': newRow[venteKey] = property.date_vente || ''; break;
          case '7': newRow[venteKey] = property.prix_vente ? `${Number(property.prix_vente).toLocaleString()} $` : ''; break;
          case '10': newRow[venteKey] = property.superficie_terrain_m2 || property.superficie_terrain_pi2 || ''; break;
          case '11': newRow[venteKey] = property.superficie_habitable_pi2 || property.aire_habitable_pi2 || ''; break;
          case '13': newRow[venteKey] = property.annee_construction || ''; break;
        }
        return newRow;
      });
    });

    setComparisonGridData(updatedData);
    setNumComparables(currentNum);
    setLoadFromListOpen(false);
  }, [comparisonGridData, numComparables]);

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
      localStorage.setItem('directComparison_columnWidths', JSON.stringify(updatedWidths));
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
            {appraisalData?.id && (
              <Badge badgeContent={compListCount} color="primary" max={99}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PlaylistPlay />}
                  onClick={() => setLoadFromListOpen(true)}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Load from List
                </Button>
              </Badge>
            )}
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

        {/* Property Selection Dialog with Enhanced UI */}
        <Dialog
          open={propertyDialogOpen}
          onClose={() => {
            setPropertyDialogOpen(false);
            setPropertySearchQuery('');
            setStatusFilter('all');
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
            {/* Search Bar with Status Filter */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <MenuItem value="all">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        All
                      </Box>
                    </MenuItem>
                    {['Sujet', 'Vendu', 'Actif'].map((status) => (
                      <MenuItem key={status} value={status}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: STATUS_COLORS[status]
                            }}
                          />
                          {getStatusLabel(status)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Property List */}
            <Box sx={{ p: 2, overflowY: 'auto', height: 'calc(80vh - 240px)' }}>
              {libraryProperties.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>No properties available in library</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {libraryProperties
                    .filter(property => {
                      // Status filter
                      if (statusFilter !== 'all' && property.status !== statusFilter) return false;
                      // Search filter
                      if (!propertySearchQuery) return true;
                      const query = propertySearchQuery.toLowerCase();
                      return (
                        property.adresse?.toLowerCase().includes(query) ||
                        property.ville?.toLowerCase().includes(query) ||
                        property.numero_mls?.toLowerCase().includes(query) ||
                        property.matricule?.toLowerCase().includes(query) ||
                        property.status?.toLowerCase().includes(query) ||
                        property.source?.toLowerCase().includes(query)
                      );
                    })
                    .sort(sortByStatus)
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

                      const statusColor = STATUS_COLORS[property.status] || '#6b7280';

                      return (
                        <Paper
                          key={property.id}
                          elevation={0}
                          sx={{
                            p: 0,
                            border: '1px solid',
                            borderColor: alpha(statusColor, 0.3),
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            overflow: 'hidden',
                            bgcolor: alpha(statusColor, 0.03),
                            '&:hover': {
                              borderColor: statusColor,
                              bgcolor: alpha(statusColor, 0.08),
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(statusColor, 0.2)}`
                            }
                          }}
                          onClick={() => {
                            handlePropertySelect(property);
                            setPropertySearchQuery('');
                            setStatusFilter('all');
                          }}
                        >
                          <Box sx={{ display: 'flex' }}>
                            {/* Status Indicator */}
                            <Box
                              sx={{
                                width: 6,
                                background: `linear-gradient(180deg, ${statusColor} 0%, ${alpha(statusColor, 0.6)} 100%)`,
                                flexShrink: 0
                              }}
                            />
                            <Box sx={{ flex: 1, p: 2 }}>
                              <Grid container spacing={2}>
                                {/* Left Column - Main Info */}
                                <Grid item xs={12} md={5}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                                    {/* Status Icon */}
                                    <Box
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.7)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: `0 2px 8px ${alpha(statusColor, 0.4)}`
                                      }}
                                    >
                                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                                        {property.status?.charAt(0) || '?'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                        {property.adresse || 'No address specified'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {property.ville}{property.code_postal ? `, ${property.code_postal}` : ''}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                                    {/* Status Badge */}
                                    <Chip
                                      label={getStatusLabel(property.status)}
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(statusColor, 0.15),
                                        color: statusColor,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 22,
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                    {/* Source Badge */}
                                    {property.source && (
                                      <Chip
                                        label={property.source.toUpperCase()}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.65rem',
                                          height: 22,
                                          '& .MuiChip-label': { px: 1 }
                                        }}
                                      />
                                    )}
                                    {/* MLS Badge */}
                                    {property.numero_mls && (
                                      <Chip
                                        label={`MLS: ${property.numero_mls}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.65rem',
                                          height: 22,
                                          '& .MuiChip-label': { px: 1 }
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Grid>

                                {/* Center Column - Sale Info (Prominent) */}
                                <Grid item xs={6} md={3}>
                                  <Box sx={{
                                    bgcolor: alpha(statusColor, 0.08),
                                    borderRadius: 1.5,
                                    p: 1.5,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                  }}>
                                    {property.prix_vente && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                          Sale Price
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: statusColor, lineHeight: 1.2 }}>
                                          ${property.prix_vente.toLocaleString()}
                                        </Typography>
                                      </Box>
                                    )}
                                    {property.date_vente && (
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                          Sale Date
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {new Date(property.date_vente).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    )}
                                    {!property.prix_vente && !property.date_vente && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        No sale info
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>

                                {/* Right Column - Property Details */}
                                <Grid item xs={6} md={4}>
                                  <Grid container spacing={1}>
                                    {livingAreaDisplay && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                                          Living Area
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                          {livingAreaDisplay}
                                        </Typography>
                                      </Grid>
                                    )}
                                    {lotSizeDisplay && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                                          Land Area
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                          {lotSizeDisplay}
                                        </Typography>
                                      </Grid>
                                    )}
                                    {property.annee_construction && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                                          Year Built
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                          {property.annee_construction}
                                        </Typography>
                                      </Grid>
                                    )}
                                    {property.nombre_chambres !== null && property.nombre_chambres !== undefined && (
                                      <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                                          Bedrooms
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                          {property.nombre_chambres}
                                        </Typography>
                                      </Grid>
                                    )}
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Box>
                          </Box>
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
                setStatusFilter('all');
              }}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Load from Comparable List Dialog */}
        {appraisalData?.id && (
          <LoadFromListDialog
            open={loadFromListOpen}
            onClose={() => setLoadFromListOpen(false)}
            appraisalId={appraisalData.id}
            listType="direct_comparison"
            onLoadProperties={handleLoadFromList}
            existingPropertyIds={[]}
          />
        )}
      </Box>
    </Box>
  );
}
