'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper
} from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColGroupDef, CellValueChangedEvent, ICellRendererParams, ValueFormatterParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { createClient } from '@/lib/supabase/client';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface ComparableProperty {
  id: string;
  propertyId?: string | null;
  address: string;
  addressLine2?: string;
  dataSource: string;
  dataSourceAlt?: string;
  saleDate: string;
  salePrice: number;
  daysOnMarket: number;
  location: string;
  lotSize: string;
  buildingType: string;
  designStyle: string;
  age: string;
  condition: string;
  livingArea: string;
  roomsTotal: number;
  roomsBedrooms: number;
  roomsBathrooms: string;
  basement: string;
  parking: string;
  quality: string;
  extras: string;
  aboveGradeImprovements?: string;
  unitLocation?: string;
  assessedValue?: string;
  assessedValueTotal?: string;
  pricePerSqFt?: string;
  optional1?: string;
  optional2?: string;
  optional3?: string;
  optional4?: string;

  // Adjustments (only for comparables)
  adjustmentDataSource?: number;
  adjustmentSalePrice?: number;
  adjustmentLocation?: number;
  adjustmentLotSize?: number;
  adjustmentBuildingType?: number;
  adjustmentDesignStyle?: number;
  adjustmentAge?: number;
  adjustmentLivingArea?: number;
  adjustmentRooms?: number;
  adjustmentBasement?: number;
  adjustmentParking?: number;
  adjustmentQuality?: number;
  adjustmentExtras?: number;
  adjustmentAboveGrade?: number;
  adjustmentUnitLocation?: number;
  adjustmentOptional1?: number;
  adjustmentOptional2?: number;
  adjustmentOptional3?: number;
  adjustmentOptional4?: number;

  // Calculated fields
  distance?: number;
  totalAdjustment?: number;
  adjustedValue?: number;
  grossAdjustmentPercent?: number;
  netAdjustmentPercent?: number;
}

interface DirectComparisonFormProps {
  data: any;
  onChange: (data: any) => void;
  subjectPropertyType?: string;
  subjectPropertyId?: string | null;
  reloadTrigger?: number;
}

interface RowData {
  rowId: string;
  field: string;
  label: string;
  subjectData1: any;
  [key: string]: any; // For dynamic comparable columns
}

export default function DirectComparisonForm({
  data,
  onChange,
  subjectPropertyType = 'single_family',
  subjectPropertyId,
  reloadTrigger = 0
}: DirectComparisonFormProps) {
  const t = useTranslations('evaluations.sections.directComparison');
  const tCommon = useTranslations('common');
  const gridRef = useRef<AgGridReact>(null);

  const [subject, setSubject] = useState<ComparableProperty>(data.subject || createEmptySubject());
  const [comparables, setComparables] = useState<ComparableProperty[]>(
    data.comparables || [
      createEmptyComparable(1),
      createEmptyComparable(2),
      createEmptyComparable(3)
    ]
  );

  // Undo/Redo state
  const [history, setHistory] = useState<Array<{ subject: ComparableProperty; comparables: ComparableProperty[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoingRef = useRef(false);

  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectingForIndex, setSelectingForIndex] = useState<number | null>(null);
  const [libraryProperties, setLibraryProperties] = useState<any[]>([]);

  const isCondo = subjectPropertyType === 'condo';

  // Debounced onChange to prevent triggering auto-save too frequently
  const onChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);
  const loadedPropertyIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip onChange on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Clear existing timer
    if (onChangeTimerRef.current) {
      clearTimeout(onChangeTimerRef.current);
    }

    // Debounce onChange calls - only call after 300ms of no changes
    onChangeTimerRef.current = setTimeout(() => {
      onChange({ subject, comparables });
    }, 300);

    return () => {
      if (onChangeTimerRef.current) {
        clearTimeout(onChangeTimerRef.current);
      }
    };
  }, [subject, comparables]);

  // Save to history when data changes (but not during undo/redo)
  useEffect(() => {
    if (!isUndoingRef.current) {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ subject: JSON.parse(JSON.stringify(subject)), comparables: JSON.parse(JSON.stringify(comparables)) });
        // Keep only last 50 states
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }
  }, [subject, comparables]);

  // Clear loaded property ref when reload trigger changes
  useEffect(() => {
    if (reloadTrigger > 0) {
      console.log('🔄 Reload trigger changed - clearing loadedPropertyIdRef to force reload');
      loadedPropertyIdRef.current = null;
    }
  }, [reloadTrigger]);

  // Load subject property data if subjectPropertyId is provided
  useEffect(() => {
    const loadSubjectProperty = async () => {
      console.log('🔍 DirectComparisonForm - subjectPropertyId:', subjectPropertyId);
      console.log('🔍 DirectComparisonForm - loadedPropertyIdRef:', loadedPropertyIdRef.current);

      // Don't load if no ID provided
      if (!subjectPropertyId) {
        console.log('⏸️  No subjectPropertyId provided, skipping load');
        return;
      }

      // Don't load if we've already loaded this property
      if (loadedPropertyIdRef.current === subjectPropertyId) {
        console.log('⏸️  This property has already been loaded, skipping');
        return;
      }

      console.log('🚀 Loading subject property from database...');

      try {
        const supabase = createClient();
        const { data: property, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', subjectPropertyId)
          .single();

        if (error) {
          console.error('❌ Error loading subject property:', error);
          return;
        }

        if (property) {
          console.log('✅ Subject property loaded:', property);

          // Build full address with city, province, postal code
          const addressParts = [];
          if (property.adresse) addressParts.push(property.adresse);
          if (property.ville) addressParts.push(property.ville);
          if (property.province) addressParts.push(property.province);
          if (property.code_postal) addressParts.push(property.code_postal);
          const fullAddress = addressParts.join(', ');

          // Build lot size with both m² and ft²
          let lotSizeText = '';
          if (property.superficie_terrain_m2) {
            const m2 = property.superficie_terrain_m2;
            const ft2 = Math.round(m2 * 10.764);
            lotSizeText = `${m2} m² / ${ft2.toLocaleString()} ft²`;
          } else if (property.superficie_terrain_pi2) {
            const ft2 = property.superficie_terrain_pi2;
            const m2 = Math.round(ft2 / 10.764);
            lotSizeText = `${m2} m² / ${ft2.toLocaleString()} ft²`;
          }

          // Build living area with both pi² and m² - check both aire_habitable and superficie_habitable
          let livingAreaText = '';
          if (property.aire_habitable_pi2) {
            const pi2 = property.aire_habitable_pi2;
            const m2 = Math.round(pi2 / 10.764);
            livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
          } else if (property.aire_habitable_m2) {
            const m2 = property.aire_habitable_m2;
            const pi2 = Math.round(m2 * 10.764);
            livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
          } else if (property.superficie_habitable_pi2) {
            const pi2 = property.superficie_habitable_pi2;
            const m2 = Math.round(pi2 / 10.764);
            livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
          } else if (property.superficie_habitable_m2) {
            const m2 = property.superficie_habitable_m2;
            const pi2 = Math.round(m2 * 10.764);
            livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
          }

          // Update subject with property data
          // Note: Subject property doesn't have sale data (saleDate, salePrice, dataSource, daysOnMarket)
          const updatedSubject = {
            ...subject,
            propertyId: property.id,
            address: fullAddress,
            dataSource: '', // Subject property has no data source
            saleDate: '', // Subject property has no sale date
            salePrice: 0, // Subject property has no sale price
            daysOnMarket: 0, // Subject property has no days on market
            lotSize: lotSizeText,
            buildingType: property.type_propriete || '',
            age: property.chrono_age?.toString() || '',
            condition: property.eff_age?.toString() || '',
            livingArea: livingAreaText,
            roomsTotal: property.nombre_pieces || 0,
            roomsBedrooms: property.nombre_chambres || 0,
            roomsBathrooms: `${property.salle_bain || 0}:${property.salle_eau || 0}`,
            basement: property.type_sous_sol || '',
            parking: property.stationnement || ''
          };

          console.log('📝 Updating subject with:', updatedSubject);
          setSubject(updatedSubject);

          // Mark this property as loaded
          loadedPropertyIdRef.current = subjectPropertyId;
        }
      } catch (error) {
        console.error('❌ Error loading subject property:', error);
      }
    };

    loadSubjectProperty();
  }, [subjectPropertyId]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoingRef.current = true;
      const prevState = history[historyIndex - 1];
      setSubject(JSON.parse(JSON.stringify(prevState.subject)));
      setComparables(JSON.parse(JSON.stringify(prevState.comparables)));
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => { isUndoingRef.current = false; }, 0);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoingRef.current = true;
      const nextState = history[historyIndex + 1];
      setSubject(JSON.parse(JSON.stringify(nextState.subject)));
      setComparables(JSON.parse(JSON.stringify(nextState.comparables)));
      setHistoryIndex(historyIndex + 1);
      setTimeout(() => { isUndoingRef.current = false; }, 0);
    }
  };

  function createEmptySubject(): ComparableProperty {
    return {
      id: 'subject',
      address: '',
      addressLine2: '',
      dataSource: '',
      dataSourceAlt: '',
      saleDate: '',
      salePrice: 0,
      daysOnMarket: 0,
      location: '',
      lotSize: '',
      buildingType: '',
      designStyle: '',
      age: '',
      condition: '',
      livingArea: '',
      roomsTotal: 0,
      roomsBedrooms: 0,
      roomsBathrooms: '',
      basement: '',
      parking: '',
      quality: t('defaultQuality'),
      extras: t('defaultExtras')
    };
  }

  function createEmptyComparable(index: number): ComparableProperty {
    return {
      id: `comparable-${index}`,
      address: '',
      dataSource: '',
      saleDate: '',
      salePrice: 0,
      daysOnMarket: 0,
      location: '',
      lotSize: '',
      buildingType: '',
      designStyle: '',
      age: '',
      condition: '',
      livingArea: '',
      roomsTotal: 0,
      roomsBedrooms: 0,
      roomsBathrooms: '',
      basement: '',
      parking: '',
      quality: t('defaultQuality'),
      extras: t('defaultExtras'),
      adjustmentDataSource: 0,
      adjustmentSalePrice: 0,
      adjustmentLocation: 0,
      adjustmentLotSize: 0,
      adjustmentBuildingType: 0,
      adjustmentDesignStyle: 0,
      adjustmentAge: 0,
      adjustmentLivingArea: 0,
      adjustmentRooms: 0,
      adjustmentBasement: 0,
      adjustmentParking: 0,
      adjustmentQuality: 0,
      adjustmentExtras: 0,
      adjustmentAboveGrade: 0,
      adjustmentUnitLocation: 0,
      adjustmentOptional1: 0,
      adjustmentOptional2: 0,
      adjustmentOptional3: 0,
      adjustmentOptional4: 0
    };
  }

  const calculateComparableTotals = (comparable: ComparableProperty): ComparableProperty => {
    const totalAdjustment = (
      (comparable.adjustmentDataSource || 0) +
      (comparable.adjustmentSalePrice || 0) +
      (comparable.adjustmentLocation || 0) +
      (comparable.adjustmentLotSize || 0) +
      (comparable.adjustmentBuildingType || 0) +
      (comparable.adjustmentDesignStyle || 0) +
      (comparable.adjustmentAge || 0) +
      (comparable.adjustmentLivingArea || 0) +
      (comparable.adjustmentRooms || 0) +
      (comparable.adjustmentBasement || 0) +
      (comparable.adjustmentParking || 0) +
      (comparable.adjustmentQuality || 0) +
      (comparable.adjustmentExtras || 0) +
      (comparable.adjustmentAboveGrade || 0) +
      (comparable.adjustmentUnitLocation || 0) +
      (comparable.adjustmentOptional1 || 0) +
      (comparable.adjustmentOptional2 || 0) +
      (comparable.adjustmentOptional3 || 0) +
      (comparable.adjustmentOptional4 || 0)
    );

    const adjustedValue = comparable.salePrice + totalAdjustment;
    const grossAdjustmentPercent = comparable.salePrice > 0
      ? (Math.abs(totalAdjustment) / comparable.salePrice) * 100
      : 0;
    const netAdjustmentPercent = comparable.salePrice > 0
      ? (totalAdjustment / comparable.salePrice) * 100
      : 0;

    return {
      ...comparable,
      totalAdjustment,
      adjustedValue,
      grossAdjustmentPercent,
      netAdjustmentPercent
    };
  };

  const handleAddComparable = () => {
    if (comparables.length < 8) {
      setComparables([...comparables, createEmptyComparable(comparables.length + 1)]);
    }
  };

  const handleRemoveComparable = (index: number) => {
    if (comparables.length > 1) {
      const newComparables = comparables.filter((_, i) => i !== index);
      setComparables(newComparables);
    }
  };

  const handleSelectFromLibrary = async (index: number) => {
    setSelectingForIndex(index);
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
  };

  const handlePropertySelect = (property: any) => {
    if (selectingForIndex !== null) {
      const newComparables = [...comparables];

      // Build full address with city, province, postal code
      const addressParts = [];
      if (property.adresse) addressParts.push(property.adresse);
      if (property.ville) addressParts.push(property.ville);
      if (property.province) addressParts.push(property.province);
      if (property.code_postal) addressParts.push(property.code_postal);
      const fullAddress = addressParts.join(', ');

      // Build lot size with both m² and ft²
      let lotSizeText = '';
      if (property.superficie_terrain_m2) {
        const m2 = property.superficie_terrain_m2;
        const ft2 = Math.round(m2 * 10.764); // Convert m² to ft²
        lotSizeText = `${m2} m² / ${ft2.toLocaleString()} ft²`;
      } else if (property.superficie_terrain_pi2) {
        const ft2 = property.superficie_terrain_pi2;
        const m2 = Math.round(ft2 / 10.764);
        lotSizeText = `${m2} m² / ${ft2.toLocaleString()} ft²`;
      }

      // Build living area with both pi² and m² - check both aire_habitable and superficie_habitable
      let livingAreaText = '';
      if (property.aire_habitable_pi2) {
        const pi2 = property.aire_habitable_pi2;
        const m2 = Math.round(pi2 / 10.764);
        livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
      } else if (property.aire_habitable_m2) {
        const m2 = property.aire_habitable_m2;
        const pi2 = Math.round(m2 * 10.764);
        livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
      } else if (property.superficie_habitable_pi2) {
        const pi2 = property.superficie_habitable_pi2;
        const m2 = Math.round(pi2 / 10.764);
        livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
      } else if (property.superficie_habitable_m2) {
        const m2 = property.superficie_habitable_m2;
        const pi2 = Math.round(m2 * 10.764);
        livingAreaText = `${pi2.toLocaleString()} pi² / ${m2} m²`;
      }

      newComparables[selectingForIndex] = {
        ...newComparables[selectingForIndex],
        propertyId: property.id,
        address: fullAddress,
        saleDate: property.date_vente || '',
        salePrice: property.prix_vente || 0,
        daysOnMarket: property.jours_sur_marche || 0,
        lotSize: lotSizeText,
        buildingType: property.type_propriete || '',
        age: property.chrono_age?.toString() || '',
        condition: property.eff_age?.toString() || '',
        livingArea: livingAreaText,
        roomsTotal: property.nombre_pieces || 0,
        roomsBedrooms: property.nombre_chambres || 0,
        roomsBathrooms: `${property.salle_bain || 0}:${property.salle_eau || 0}`,
        basement: property.type_sous_sol || '',
        parking: property.stationnement || ''
      };
      newComparables[selectingForIndex] = calculateComparableTotals(newComparables[selectingForIndex]);
      setComparables(newComparables);
    }
    setPropertyDialogOpen(false);
    setSelectingForIndex(null);
  };

  // Helper function to determine which rows should be shown based on property type
  const shouldShowRow = (rowId: string): boolean => {
    // Land properties - only show lot/location related fields
    if (subjectPropertyType === 'land') {
      const landHiddenRows = ['livingArea', 'buildingType', 'designStyle', 'age', 'condition',
                              'roomsTotal', 'roomsBedrooms', 'roomsBathrooms', 'basement',
                              'parking', 'aboveGradeImprovements', 'unitLocation'];
      return !landHiddenRows.includes(rowId);
    }

    // Condo properties - hide lot size, show unit location
    if (isCondo) {
      if (rowId === 'lotSize') return false;
      if (rowId === 'aboveGradeImprovements') return false;
      return true;
    }

    // Commercial/Semi-commercial properties - show all fields
    if (subjectPropertyType === 'commercial' || subjectPropertyType === 'semi_commercial') {
      if (rowId === 'unitLocation') return false;
      return true;
    }

    // Residential properties (single_family, duplex, triplex, quadriplex_plus, apartment)
    // Show all standard fields except unit location
    if (rowId === 'unitLocation') return false;
    return true;
  };

  // Row definitions - filtered based on property type
  const rowDefinitions = useMemo(() => {
    const allRows = [
      { rowId: 'address', field: 'address', label: t('address'), type: 'text' },
      { rowId: 'dataSource', field: 'dataSource', label: t('dataSource'), type: 'text' },
      { rowId: 'saleDate', field: 'saleDate', label: t('saleDate'), type: 'date' },
      { rowId: 'salePrice', field: 'salePrice', label: t('salePrice'), type: 'currency' },
      { rowId: 'daysOnMarket', field: 'daysOnMarket', label: t('daysOnMarket'), type: 'number' },
      { rowId: 'location', field: 'location', label: t('location'), type: 'text' },
      { rowId: 'lotSize', field: 'lotSize', label: t('lotSize'), type: 'text' },
      { rowId: 'buildingType', field: 'buildingType', label: t('buildingType'), type: 'select' },
      { rowId: 'designStyle', field: 'designStyle', label: t('designStyle'), type: 'select' },
      { rowId: 'age', field: 'age', label: t('age'), type: 'text' },
      { rowId: 'condition', field: 'condition', label: t('condition'), type: 'text' },
      { rowId: 'livingArea', field: 'livingArea', label: t('livingArea'), type: 'text' },
      { rowId: 'roomsTotal', field: 'roomsTotal', label: t('roomsTotal'), type: 'number' },
      { rowId: 'roomsBedrooms', field: 'roomsBedrooms', label: t('roomsBedrooms'), type: 'number' },
      { rowId: 'roomsBathrooms', field: 'roomsBathrooms', label: t('roomsBathrooms'), type: 'text' },
      { rowId: 'basement', field: 'basement', label: t('basement'), type: 'select' },
      { rowId: 'parking', field: 'parking', label: t('parking'), type: 'text' },
      { rowId: 'quality', field: 'quality', label: t('quality'), type: 'text' },
      { rowId: 'extras', field: 'extras', label: t('extras'), type: 'text' },
      // Conditional rows
      { rowId: 'aboveGradeImprovements', field: 'aboveGradeImprovements', label: t('aboveGradeImprovements'), type: 'text' },
      { rowId: 'unitLocation', field: 'unitLocation', label: t('unitLocation'), type: 'text' },
      { rowId: 'assessedValue', field: 'assessedValue', label: t('assessedValue'), type: 'text' },
      { rowId: 'assessedValueTotal', field: 'assessedValueTotal', label: t('assessedValueTotal'), type: 'text' },
      { rowId: 'pricePerSqFt', field: 'pricePerSqFt', label: t('pricePerSqFt'), type: 'calculated' },
      { rowId: 'optional1', field: 'optional1', label: t('optional1'), type: 'text' },
      { rowId: 'optional2', field: 'optional2', label: t('optional2'), type: 'text' },
      { rowId: 'optional3', field: 'optional3', label: t('optional3'), type: 'text' },
      { rowId: 'optional4', field: 'optional4', label: t('optional4'), type: 'text' },
      // Summary rows (always shown)
      { rowId: 'distance', field: 'distance', label: t('distance'), type: 'calculated' },
      { rowId: 'totalAdjustment', field: 'totalAdjustment', label: t('totalAdjustment'), type: 'calculated' },
      { rowId: 'adjustedValue', field: 'adjustedValue', label: t('adjustedValue'), type: 'calculated' },
      { rowId: 'grossAdjustmentPercent', field: 'grossAdjustmentPercent', label: t('grossAdjustmentPercent'), type: 'calculated' },
      { rowId: 'netAdjustmentPercent', field: 'netAdjustmentPercent', label: t('netAdjustmentPercent'), type: 'calculated' }
    ];

    // Filter rows based on property type
    const filteredRows = allRows.filter(row => shouldShowRow(row.rowId));
    return filteredRows as any[];
  }, [isCondo, subjectPropertyType, t]);

  // Convert data to row format for AG Grid
  const rowData = useMemo(() => {
    const rows = rowDefinitions.map((rowDef) => {
      const row: RowData = {
        rowId: rowDef.rowId,
        field: rowDef.field,
        label: rowDef.label,
        subjectData1: subject[rowDef.field as keyof ComparableProperty]
      };

      // Add comparable columns
      comparables.forEach((comparable, index) => {
        row[`comp${index}Data`] = comparable[rowDef.field as keyof ComparableProperty];
        row[`comp${index}Adj`] = comparable[`adjustment${rowDef.field.charAt(0).toUpperCase() + rowDef.field.slice(1)}` as keyof ComparableProperty];
      });

      return row;
    });

    return rows;
  }, [subject, comparables, rowDefinitions]);

  // Column definitions
  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
    const cols: (ColDef | ColGroupDef)[] = [
      {
        field: 'label',
        headerName: t('elementsComparison'),
        pinned: 'left',
        width: 220,
        editable: false,
        cellStyle: (params: any) => {
          const isTotalAdjustment = params.data.rowId === 'totalAdjustment';
          const isAdjustedValue = params.data.rowId === 'adjustedValue';
          const isGrossPercent = params.data.rowId === 'grossAdjustmentPercent';
          const isNetPercent = params.data.rowId === 'netAdjustmentPercent';
          const isBoldRow = isTotalAdjustment || isAdjustedValue || isGrossPercent || isNetPercent;
          return {
            fontWeight: isBoldRow ? 700 : 600,
            backgroundColor: '#fafafa',
            borderRight: '2px solid #e0e0e0',
            fontSize: isBoldRow ? '14px' : '13px',
            paddingLeft: '12px',
            lineHeight: params.data.rowId === 'address' ? '1.4' : 'normal',
            whiteSpace: params.data.rowId === 'address' ? 'normal' : 'nowrap',
            padding: params.data.rowId === 'address' ? '8px 12px' : '4px 8px 4px 12px',
            display: 'flex',
            alignItems: params.data.rowId === 'address' ? 'flex-start' : 'center',
            borderTop: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none'))),
            borderBottom: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none')))
          };
        },
        headerClass: 'label-header'
      },
      // Subject columns
      {
        headerName: t('subject'),
        headerClass: 'subject-header',
        children: [
          {
            field: 'subjectData1',
            headerName: 'Description',
            width: 160,
            editable: (params: any) => {
              const calculated = ['distance', 'totalAdjustment', 'adjustedValue', 'grossAdjustmentPercent', 'netAdjustmentPercent', 'pricePerSqFt'];
              const subjectNotApplicable = ['dataSource', 'saleDate', 'salePrice', 'daysOnMarket'];
              return !calculated.includes(params.data.rowId) && !subjectNotApplicable.includes(params.data.rowId);
            },
            cellStyle: (params: any) => {
              const calculated = ['distance', 'totalAdjustment', 'adjustedValue', 'grossAdjustmentPercent', 'netAdjustmentPercent', 'pricePerSqFt'];
              const isTotalAdjustment = params.data.rowId === 'totalAdjustment';
              const isAdjustedValue = params.data.rowId === 'adjustedValue';
              const isGrossPercent = params.data.rowId === 'grossAdjustmentPercent';
              const isNetPercent = params.data.rowId === 'netAdjustmentPercent';
              const isBoldRow = isTotalAdjustment || isAdjustedValue || isGrossPercent || isNetPercent;
              return {
                backgroundColor: calculated.includes(params.data.rowId) ? '#e3f2fd' : '#f5f9ff',
                fontWeight: isBoldRow ? 700 : (calculated.includes(params.data.rowId) ? 600 : 400),
                fontSize: isBoldRow ? '14px' : '13px',
                lineHeight: params.data.rowId === 'address' ? '1.4' : 'normal',
                whiteSpace: params.data.rowId === 'address' ? 'normal' : 'nowrap',
                padding: params.data.rowId === 'address' ? '8px' : '4px 8px',
                display: 'flex',
                alignItems: params.data.rowId === 'address' ? 'flex-start' : 'center',
                borderTop: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none'))),
                borderBottom: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none')))
              };
            },
            cellRenderer: (params: ICellRendererParams) => {
              // Subject columns should be empty for percentage rows
              if (params.data.rowId === 'grossAdjustmentPercent' || params.data.rowId === 'netAdjustmentPercent') {
                return '';
              }

              // Subject property doesn't have sale data - keep empty
              if (['dataSource', 'saleDate', 'salePrice', 'daysOnMarket'].includes(params.data.rowId)) {
                return '';
              }

              // Format bathrooms as "full:half"
              if (params.data.rowId === 'roomsBathrooms') {
                const value = params.value || '';
                if (!value.includes(':')) {
                  return value;
                }
                const parts = value.split(':');
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', fontFamily: 'monospace' }}>
                    <span>{parts[0] || '0'}</span>
                    <span>:</span>
                    <span>{parts[1] || '0'}</span>
                  </Box>
                );
              }
              return params.value;
            }
          }
        ]
      }
    ];

    // Add comparable columns dynamically
    comparables.forEach((_, index) => {
      const isLast = index === comparables.length - 1;
      cols.push({
        headerName: `${t('comparable')} ${index + 1}`,
        headerClass: 'comparable-header',
        children: [
          {
            field: `comp${index}Data`,
            headerName: 'Description',
            width: 160,
            editable: (params: any) => {
              const calculated = ['distance', 'totalAdjustment', 'adjustedValue', 'grossAdjustmentPercent', 'netAdjustmentPercent', 'pricePerSqFt'];
              return !calculated.includes(params.data.rowId);
            },
            cellStyle: (params: any) => {
              const calculated = ['distance', 'totalAdjustment', 'adjustedValue', 'grossAdjustmentPercent', 'netAdjustmentPercent', 'pricePerSqFt'];
              const isTotalAdjustment = params.data.rowId === 'totalAdjustment';
              const isAdjustedValue = params.data.rowId === 'adjustedValue';
              const isGrossPercent = params.data.rowId === 'grossAdjustmentPercent';
              const isNetPercent = params.data.rowId === 'netAdjustmentPercent';
              const isBoldRow = isTotalAdjustment || isAdjustedValue || isGrossPercent || isNetPercent;
              return {
                backgroundColor: calculated.includes(params.data.rowId) ? '#e8eaf6' : '#fff9f5',
                fontWeight: isBoldRow ? 700 : (calculated.includes(params.data.rowId) ? 600 : 400),
                fontSize: isBoldRow ? '14px' : '13px',
                lineHeight: params.data.rowId === 'address' ? '1.4' : 'normal',
                whiteSpace: params.data.rowId === 'address' ? 'normal' : 'nowrap',
                padding: params.data.rowId === 'address' ? '8px' : '4px 8px',
                display: 'flex',
                alignItems: params.data.rowId === 'address' ? 'flex-start' : 'center',
                justifyContent: isBoldRow ? 'flex-end' : 'flex-start',
                borderTop: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none'))),
                borderBottom: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none')))
              };
            },
            colSpan: (params: any) => {
              // Merge columns for address row (no adjustment column needed)
              if (params.data.rowId === 'address') return 2;
              // Merge columns for totalAdjustment row to show dollar amount
              if (params.data.rowId === 'totalAdjustment') return 2;
              // Merge columns for adjustedValue row to show dollar amount
              if (params.data.rowId === 'adjustedValue') return 2;
              // Merge columns for percentage rows to show percentage
              if (params.data.rowId === 'grossAdjustmentPercent') return 2;
              if (params.data.rowId === 'netAdjustmentPercent') return 2;
              return 1;
            },
            cellRenderer: (params: ICellRendererParams) => {
              // Add search icon for address row
              if (params.data.rowId === 'address') {
                return (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%', py: 0.5 }}>
                    <span style={{ flex: 1, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.4 }}>
                      {params.value || ''}
                    </span>
                    <IconButton
                      size="small"
                      onClick={() => handleSelectFromLibrary(index)}
                      title={t('selectFromLibrary')}
                      sx={{ padding: '4px', color: 'primary.main', mt: -0.5 }}
                    >
                      <Search fontSize="small" />
                    </IconButton>
                  </Box>
                );
              }

              // Display dollar amount for totalAdjustment row (get from data column which has the calculated total)
              if (params.data.rowId === 'totalAdjustment') {
                const totalValue = params.data[`comp${index}Data`];
                if (!totalValue || totalValue === 0) return '';
                const val = parseFloat(totalValue);
                const formatted = val > 0 ? `+$${val.toLocaleString()}` : `-$${Math.abs(val).toLocaleString()}`;
                return (
                  <span style={{ color: val > 0 ? '#2e7d32' : '#c62828', fontWeight: 700 }}>
                    {formatted}
                  </span>
                );
              }

              // Display dollar amount for adjustedValue row
              if (params.data.rowId === 'adjustedValue') {
                const adjustedValue = params.data[`comp${index}Data`];
                if (!adjustedValue || adjustedValue === 0) return '';
                const val = parseFloat(adjustedValue);
                const formatted = `$${val.toLocaleString()}`;
                return (
                  <span style={{ color: '#2e7d32', fontWeight: 700 }}>
                    {formatted}
                  </span>
                );
              }

              // Display percentage for grossAdjustmentPercent row
              if (params.data.rowId === 'grossAdjustmentPercent') {
                const percentValue = params.data[`comp${index}Data`];
                if (!percentValue || percentValue === 0) return '0.00%';
                const val = parseFloat(percentValue);
                return (
                  <span style={{ color: '#FF9800', fontWeight: 700 }}>
                    {val.toFixed(2)}%
                  </span>
                );
              }

              // Display percentage for netAdjustmentPercent row
              if (params.data.rowId === 'netAdjustmentPercent') {
                const percentValue = params.data[`comp${index}Data`];
                if (!percentValue || percentValue === 0) return '0.00%';
                const val = parseFloat(percentValue);
                return (
                  <span style={{ color: '#9C27B0', fontWeight: 700 }}>
                    {val.toFixed(2)}%
                  </span>
                );
              }

              // Format sale price as currency
              if (params.data.rowId === 'salePrice') {
                const price = params.value;
                if (!price || price === 0) return '';
                return `$${parseFloat(price).toLocaleString()}`;
              }

              // Format bathrooms as "full:half"
              if (params.data.rowId === 'roomsBathrooms') {
                const value = params.value || '';
                // If not in format already, display as-is
                if (!value.includes(':')) {
                  return value;
                }
                // Split and display with proper formatting
                const parts = value.split(':');
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', fontFamily: 'monospace' }}>
                    <span>{parts[0] || '0'}</span>
                    <span>:</span>
                    <span>{parts[1] || '0'}</span>
                  </Box>
                );
              }

              return params.value;
            }
          },
          {
            field: `comp${index}Adj`,
            headerName: 'Adj. ($)',
            width: 110,
            editable: (params: any) => {
              const nonAdjustable = ['address', 'distance', 'totalAdjustment', 'adjustedValue', 'grossAdjustmentPercent', 'netAdjustmentPercent', 'pricePerSqFt'];
              return !nonAdjustable.includes(params.data.rowId);
            },
            cellStyle: (params: any) => {
              const calculated = ['totalAdjustment', 'adjustedValue', 'grossAdjustmentPercent', 'netAdjustmentPercent'];
              const isCalculated = calculated.includes(params.data.rowId);
              const isTotalAdjustment = params.data.rowId === 'totalAdjustment';
              const isAdjustedValue = params.data.rowId === 'adjustedValue';
              const isGrossPercent = params.data.rowId === 'grossAdjustmentPercent';
              const isNetPercent = params.data.rowId === 'netAdjustmentPercent';
              const isBoldRow = isTotalAdjustment || isAdjustedValue || isGrossPercent || isNetPercent;
              return {
                backgroundColor: isCalculated ? '#e8eaf6' : '#fff5f8',
                fontWeight: isBoldRow ? 700 : (isCalculated ? 600 : 400),
                fontSize: isBoldRow ? '14px' : '13px',
                borderRight: isLast ? 'none' : '2px solid #e0e0e0',
                color: params.value && params.value !== 0 ? (params.value > 0 ? '#2e7d32' : '#c62828') : 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderTop: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none'))),
                borderBottom: isTotalAdjustment ? '2px solid #1976D2' : (isAdjustedValue ? '2px solid #4CAF50' : (isGrossPercent ? '2px solid #FF9800' : (isNetPercent ? '2px solid #9C27B0' : 'none')))
              };
            },
            colSpan: (params: any) => {
              // Hide this column when address row spans it
              if (params.data.rowId === 'address') return 0;
              // Hide this column when totalAdjustment row spans it
              if (params.data.rowId === 'totalAdjustment') return 0;
              // Hide this column when adjustedValue row spans it
              if (params.data.rowId === 'adjustedValue') return 0;
              // Hide this column when percentage rows span it
              if (params.data.rowId === 'grossAdjustmentPercent') return 0;
              if (params.data.rowId === 'netAdjustmentPercent') return 0;
              return 1;
            },
            valueFormatter: (params: ValueFormatterParams) => {
              if (!params.value || params.value === 0) return '';
              const val = parseFloat(params.value);
              return val > 0 ? `+$${val.toLocaleString()}` : `-$${Math.abs(val).toLocaleString()}`;
            }
          }
        ]
      });
    });

    return cols;
  }, [comparables, t]);

  // Handle cell value changes
  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const { data, colDef, newValue } = event;
    const field = data.field;

    // Update subject
    if (colDef.field === 'subjectData1') {
      setSubject(prev => ({ ...prev, [field]: newValue }));
    } else if (colDef.field === 'subjectData2') {
      const secondFieldName = field === 'address' ? 'addressLine2' : field === 'dataSource' ? 'dataSourceAlt' : '';
      if (secondFieldName) {
        setSubject(prev => ({ ...prev, [secondFieldName]: newValue }));
      }
    }

    // Update comparables
    const compMatch = colDef.field?.match(/comp(\d+)(Data|Adj)/);
    if (compMatch) {
      const compIndex = parseInt(compMatch[1]);
      const isAdjustment = compMatch[2] === 'Adj';

      setComparables(prev => {
        const newComparables = [...prev];
        if (isAdjustment) {
          const adjField = `adjustment${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof ComparableProperty;
          newComparables[compIndex] = { ...newComparables[compIndex], [adjField]: parseFloat(newValue) || 0 };
        } else {
          newComparables[compIndex] = { ...newComparables[compIndex], [field]: newValue };
        }
        // Recalculate totals
        newComparables[compIndex] = calculateComparableTotals(newComparables[compIndex]);
        return newComparables;
      });
    }
  }, []);

  return (
    <Box>
      {/* Custom AG Grid Styles */}
      <style>{`
        .direct-comparison-grid .ag-header {
          background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
          border-bottom: 2px solid #1565C0;
        }

        .direct-comparison-grid .ag-header-cell {
          color: white;
          font-weight: 600;
          font-size: 13px;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .direct-comparison-grid .ag-header-group-cell {
          background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
          color: white;
          font-weight: 700;
          font-size: 14px;
          border-right: 2px solid rgba(255, 255, 255, 0.3);
        }

        .direct-comparison-grid .label-header {
          background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%) !important;
        }

        .direct-comparison-grid .subject-header {
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        }

        .direct-comparison-grid .comparable-header {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        }

        .direct-comparison-grid .ag-row {
          border-bottom: 1px solid #e0e0e0;
        }

        .direct-comparison-grid .ag-row:hover {
          background-color: rgba(33, 150, 243, 0.05);
        }

        .direct-comparison-grid .ag-cell {
          line-height: 36px;
          padding: 4px 8px;
        }

        .direct-comparison-grid .ag-cell-focus {
          border: 2px solid #2196F3 !important;
        }

        .direct-comparison-grid .ag-cell-inline-editing {
          background-color: #fff9c4 !important;
          border: 2px solid #fbc02d !important;
        }
      `}</style>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
        {t('title')}
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {comparables.length} / 8 {t('maxComparables').toLowerCase()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {comparables.length > 1 && (
            <Button
              startIcon={<Delete />}
              onClick={() => handleRemoveComparable(comparables.length - 1)}
              size="small"
              variant="outlined"
              color="error"
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Remove Last
            </Button>
          )}
          <Button
            startIcon={<Add />}
            onClick={handleAddComparable}
            disabled={comparables.length >= 8}
            size="small"
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            {t('addComparable')}
          </Button>
        </Box>
      </Box>

      <Box
        className="ag-theme-material direct-comparison-grid"
        sx={{
          height: 'calc(100vh - 350px)',
          minHeight: 800,
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            sortable: false,
            filter: false,
            cellClass: 'custom-cell'
          }}
          onCellValueChanged={onCellValueChanged}
          suppressMovableColumns={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          animateRows={false}
          suppressScrollOnNewData={true}
          getRowHeight={(params) => {
            // Taller row for address to allow wrapping
            return params.data.rowId === 'address' ? 80 : 40;
          }}
          headerHeight={48}
          groupHeaderHeight={48}
        />
      </Box>

      {/* Property Selection Dialog */}
      <Dialog open={propertyDialogOpen} onClose={() => setPropertyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('selectFromLibrary')}</DialogTitle>
        <DialogContent>
          {libraryProperties.length === 0 ? (
            <Alert severity="info">No properties available in library</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {libraryProperties.map((property) => (
                <Paper
                  key={property.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handlePropertySelect(property)}
                >
                  <Typography variant="subtitle2">{property.adresse}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.ville} • {property.prix_vente ? `$${property.prix_vente.toLocaleString()}` : 'No price'}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertyDialogOpen(false)}>{tCommon('cancel')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
