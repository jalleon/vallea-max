'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Save,
  Refresh,
  Sync,
  Calculate,
  Info,
  Close
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { AdjustmentsData, DefaultRates, ComparableAdjustments, AdjustmentDetail, PropertyType } from '../types/adjustments.types';
import { DEFAULT_RATES_BY_PROPERTY_TYPE, ADJUSTMENT_CATEGORIES } from '../constants/adjustments.constants';
import { adjustmentPresetsService } from '../_api/adjustment-presets.service';

interface AdjustmentsFormProps {
  data: AdjustmentsData;
  onChange: (data: AdjustmentsData) => void;
  directComparisonData: any; // Subject + comparables from Direct Comparison
  propertyType: PropertyType;
  effectiveDate?: string | null;
  onSyncToDirectComparison?: () => void;
  onClose?: () => void;
  measurementSystem?: 'imperial' | 'metric'; // From Direct Comparison
}

export default function AdjustmentsForm({
  data,
  onChange,
  directComparisonData,
  propertyType,
  effectiveDate,
  onSyncToDirectComparison,
  onClose,
  measurementSystem = 'imperial' // Default to imperial
}: AdjustmentsFormProps) {
  const t = useTranslations('evaluations.sections.adjustments');
  const tCommon = useTranslations('common');

  const [adjustmentsData, setAdjustmentsData] = useState<AdjustmentsData>(data);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>(propertyType);

  // Helper function to format area measurements based on selected measurement system
  const formatAreaMeasurement = (value: string | number | null | undefined): string => {
    if (!value) return 'N/A';

    const strValue = String(value);

    // Check if value contains both units (e.g., "558.65 m² / 6,013 ft²" or "6,013 pi² / 558.65 m²")
    if (strValue.includes('/')) {
      const parts = strValue.split('/');

      // Determine which part is metric and which is imperial by checking the unit symbols
      const firstPart = parts[0].trim();
      const secondPart = parts[1].trim();

      const firstIsMetric = firstPart.includes('m²');
      const firstIsImperial = firstPart.includes('pi²') || firstPart.includes('ft²');

      if (measurementSystem === 'imperial') {
        // Return the imperial part (pi² or ft²)
        if (firstIsImperial) {
          return firstPart;
        } else {
          return secondPart;
        }
      } else {
        // Return the metric part (m²)
        if (firstIsMetric) {
          return firstPart;
        } else {
          return secondPart;
        }
      }
    }

    // If no slash, return as-is (already in single format)
    return strValue;
  };

  // Load organization presets and initialize defaultRates
  useEffect(() => {
    const loadOrganizationPresets = async () => {
      const needsInit = !adjustmentsData.defaultRates || !adjustmentsData.ratesByType;

      if (needsInit) {
        // Try to load organization preset for this property type
        const orgPreset = await adjustmentPresetsService.getOrganizationPreset(propertyType);

        // Use organization preset if available, otherwise use hardcoded defaults
        const defaultRates = orgPreset || DEFAULT_RATES_BY_PROPERTY_TYPE[propertyType] || DEFAULT_RATES_BY_PROPERTY_TYPE.single_family;

        setAdjustmentsData(prev => ({
          ...prev,
          defaultRates,
          ratesByType: {
            [propertyType]: defaultRates
          }
        }));
      }
    };

    loadOrganizationPresets();
  }, []);

  // Propagate changes to parent component
  useEffect(() => {
    onChange(adjustmentsData);
  }, [adjustmentsData]);

  // Initialize adjustments data from Direct Comparison
  useEffect(() => {
    if (directComparisonData?.comparables?.length > 0) {
      if (!adjustmentsData.comparables || adjustmentsData.comparables.length === 0) {
        initializeFromDirectComparison();
      }
    }
  }, [directComparisonData]);

  // Update area labels when measurement system changes
  useEffect(() => {
    if (adjustmentsData.comparables && adjustmentsData.comparables.length > 0) {
      const subject = directComparisonData.subject;

      const updatedComparables = adjustmentsData.comparables.map(comp => {
        const updatedAdjustments: any = { ...comp.adjustments };

        // Update livingArea labels
        if (updatedAdjustments.livingArea) {
          updatedAdjustments.livingArea = {
            ...updatedAdjustments.livingArea,
            subjectLabel: formatAreaMeasurement(subject?.livingArea),
            comparableLabel: formatAreaMeasurement(updatedAdjustments.livingArea.comparableValue)
          };
        }

        // Update lotSize labels
        if (updatedAdjustments.lotSize) {
          updatedAdjustments.lotSize = {
            ...updatedAdjustments.lotSize,
            subjectLabel: formatAreaMeasurement(subject?.lotSize),
            comparableLabel: formatAreaMeasurement(updatedAdjustments.lotSize.comparableValue)
          };
        }

        return {
          ...comp,
          adjustments: updatedAdjustments
        };
      });

      setAdjustmentsData(prev => ({
        ...prev,
        comparables: updatedComparables
      }));
    }
  }, [measurementSystem]);

  // Recalculate adjustments when default rates change
  useEffect(() => {
    if (adjustmentsData.comparables && adjustmentsData.comparables.length > 0) {
      const updatedComparables = adjustmentsData.comparables.map((comp, index) => {
        const newAdjustments: any = { ...comp.adjustments };
        let total = 0;

        // Recalculate each category
        ADJUSTMENT_CATEGORIES.forEach(category => {
          if (category.applicablePropertyTypes.includes(propertyType)) {
            const amount = calculateAdjustment(category.id, index);
            if (newAdjustments[category.id]) {
              newAdjustments[category.id] = {
                ...newAdjustments[category.id],
                calculatedAmount: amount
              };
              total += amount;
            }
          }
        });

        const salePrice = parseFloat(directComparisonData?.comparables?.[index]?.salePrice || '0');
        return {
          ...comp,
          adjustments: newAdjustments,
          totalAdjustment: total,
          adjustedValue: salePrice + total
        };
      });

      setAdjustmentsData(prev => ({
        ...prev,
        comparables: updatedComparables
      }));
    }
  }, [adjustmentsData.defaultRates]);

  const initializeFromDirectComparison = () => {
    const subject = directComparisonData.subject;
    const comparables = directComparisonData.comparables || [];
    const defaultRates = DEFAULT_RATES_BY_PROPERTY_TYPE[propertyType] || DEFAULT_RATES_BY_PROPERTY_TYPE.single_family;

    const newComparables: ComparableAdjustments[] = comparables.map((comp: any) => {
      // Initialize each adjustment category with data from Direct Comparison
      const adjustments: any = {};

      // Timing - Calculate timing adjustment
      const timingAmount = (() => {
        if (comp.saleDate && effectiveDate) {
          const saleDate = new Date(comp.saleDate);
          const effDate = new Date(effectiveDate);
          const months = (effDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          const salePrice = parseFloat(comp.salePrice) || 0;
          return ((defaultRates.marketAppreciationRate / 100) / 12) * months * salePrice;
        }
        return 0;
      })();

      adjustments.timing = {
        category: 'timing',
        enabled: true,
        subjectValue: effectiveDate || null,
        subjectLabel: effectiveDate || 'N/A (Effective Date)',
        comparableValue: comp.saleDate || null,
        comparableLabel: comp.saleDate || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.marketAppreciationRate,
        calculatedAmount: timingAmount,
        notes: 'Based on market appreciation rate'
      };

      // Living Area - Calculate living area adjustment
      const compArea = parseFloat(comp.livingArea?.replace(/[^0-9.]/g, '') || '0');
      const subjectArea = parseFloat(subject?.livingArea?.replace(/[^0-9.]/g, '') || '0');
      const areaDiff = compArea - subjectArea;
      const livingAreaAmount = -areaDiff * defaultRates.livingAreaRate;

      adjustments.livingArea = {
        category: 'livingArea',
        enabled: true,
        subjectValue: subject?.livingArea || null,
        subjectLabel: formatAreaMeasurement(subject?.livingArea),
        comparableValue: comp.livingArea || null,
        comparableLabel: formatAreaMeasurement(comp.livingArea),
        difference: areaDiff,
        adjustmentRate: defaultRates.livingAreaRate,
        calculatedAmount: livingAreaAmount
      };

      // Lot Size
      adjustments.lotSize = {
        category: 'lotSize',
        enabled: true,
        subjectValue: subject?.lotSize || null,
        subjectLabel: formatAreaMeasurement(subject?.lotSize),
        comparableValue: comp.lotSize || null,
        comparableLabel: formatAreaMeasurement(comp.lotSize),
        difference: 0,
        adjustmentRate: defaultRates.landRate,
        depreciationRate: defaultRates.landDepreciationRate,
        calculatedAmount: 0
      };

      // Quality
      adjustments.quality = {
        category: 'quality',
        enabled: true,
        subjectValue: subject?.quality || null,
        subjectLabel: subject?.quality || 'N/A',
        comparableValue: comp.quality || null,
        comparableLabel: comp.quality || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.qualityAdjustmentValue,
        calculatedAmount: 0
      };

      // Effective Age
      adjustments.effectiveAge = {
        category: 'effectiveAge',
        enabled: true,
        subjectValue: subject?.age || null,
        subjectLabel: subject?.age ? `${subject.age} years` : 'N/A',
        comparableValue: comp.age || null,
        comparableLabel: comp.age ? `${comp.age} years` : 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.ageAdjustmentRate,
        calculatedAmount: 0
      };

      // Basement
      adjustments.basement = {
        category: 'basement',
        enabled: true,
        subjectValue: subject?.basement || null,
        subjectLabel: subject?.basement || 'N/A',
        comparableValue: comp.basement || null,
        comparableLabel: comp.basement || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.basementFinishRate,
        depreciationRate: defaultRates.basementDepreciationRate,
        calculatedAmount: 0
      };

      // Bathrooms
      adjustments.bathrooms = {
        category: 'bathrooms',
        enabled: true,
        subjectValue: subject?.bathrooms || null,
        subjectLabel: subject?.bathrooms || 'N/A',
        comparableValue: comp.bathrooms || null,
        comparableLabel: comp.bathrooms || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.bathroomValue,
        depreciationRate: defaultRates.bathroomDepreciationRate,
        calculatedAmount: 0
      };

      // Garage
      adjustments.garage = {
        category: 'garage',
        enabled: true,
        subjectValue: subject?.garage || null,
        subjectLabel: subject?.garage || 'N/A',
        comparableValue: comp.garage || null,
        comparableLabel: comp.garage || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.garageValue,
        calculatedAmount: 0
      };

      // Floor (condos)
      adjustments.floor = {
        category: 'floor',
        enabled: true,
        subjectValue: subject?.floor || null,
        subjectLabel: subject?.floor || 'N/A',
        comparableValue: comp.floor || null,
        comparableLabel: comp.floor || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.floorValue,
        calculatedAmount: 0
      };

      // Landscaping
      adjustments.landscaping = {
        category: 'landscaping',
        enabled: true,
        subjectValue: subject?.landscaping || null,
        subjectLabel: subject?.landscaping || 'N/A',
        comparableValue: comp.landscaping || null,
        comparableLabel: comp.landscaping || 'N/A',
        difference: 0,
        depreciationRate: defaultRates.landscapingDepreciationRate,
        calculatedAmount: 0
      };

      // Extras
      adjustments.extras = {
        category: 'extras',
        enabled: true,
        subjectValue: subject?.extras || null,
        subjectLabel: subject?.extras || 'N/A',
        comparableValue: comp.extras || null,
        comparableLabel: comp.extras || 'N/A',
        difference: 0,
        depreciationRate: defaultRates.extrasDepreciationRate,
        calculatedAmount: 0
      };

      // Unit Location (condos)
      adjustments.unitLocation = {
        category: 'unitLocation',
        enabled: true,
        subjectValue: subject?.unitLocation || null,
        subjectLabel: subject?.unitLocation || 'N/A',
        comparableValue: comp.unitLocation || null,
        comparableLabel: comp.unitLocation || 'N/A',
        difference: 0,
        adjustmentRate: defaultRates.cornerUnitPremium,
        calculatedAmount: 0
      };

      return {
        comparableId: comp.id,
        comparableAddress: comp.address,
        adjustments,
        totalAdjustment: 0,
        adjustedValue: parseFloat(comp.salePrice) || 0
      };
    });

    setAdjustmentsData(prev => ({
      ...prev,
      subjectPropertyId: subject?.propertyId || null,
      propertyType: propertyType as any,
      comparables: newComparables,
      defaultRates
    }));
  };

  // Handle property type change
  const handlePropertyTypeChange = (newPropertyType: PropertyType) => {
    // Save current rates for current property type
    const updatedRatesByType = {
      ...adjustmentsData.ratesByType,
      [selectedPropertyType]: adjustmentsData.defaultRates
    };

    // Load rates for new property type (or use defaults)
    const newRates = updatedRatesByType[newPropertyType] || DEFAULT_RATES_BY_PROPERTY_TYPE[newPropertyType] || adjustmentsData.defaultRates;

    setSelectedPropertyType(newPropertyType);
    setAdjustmentsData(prev => ({
      ...prev,
      defaultRates: newRates,
      ratesByType: updatedRatesByType
    }));
  };

  // Update rates for selected property type
  const updateRate = async (rateKey: keyof DefaultRates, value: number) => {
    const updatedRates = {
      ...adjustmentsData.defaultRates,
      [rateKey]: value
    };

    // Save to organization presets
    await adjustmentPresetsService.saveOrganizationPreset(selectedPropertyType, updatedRates);

    setAdjustmentsData(prev => ({
      ...prev,
      defaultRates: updatedRates,
      ratesByType: {
        ...prev.ratesByType,
        [selectedPropertyType]: updatedRates
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Calculate adjustment for a specific category and comparable
  const calculateAdjustment = (
    categoryId: string,
    comparableIndex: number
  ): number => {
    const comparable = directComparisonData.comparables[comparableIndex];
    const subject = directComparisonData.subject;
    const rates = adjustmentsData.defaultRates;

    if (!comparable || !subject) return 0;

    let adjustment = 0;

    switch (categoryId) {
      case 'timing': {
        // Formula: ((rate% / 12) × months × sale price)
        if (comparable.saleDate && effectiveDate) {
          const saleDate = new Date(comparable.saleDate);
          const effDate = new Date(effectiveDate);
          const months = (effDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          const salePrice = parseFloat(comparable.salePrice) || 0;
          adjustment = ((rates.marketAppreciationRate / 100) / 12) * months * salePrice;
        }
        break;
      }

      case 'livingArea': {
        // (comp_living_area - subject_living_area) × rate_per_sqft
        const compArea = parseFloat(comparable.livingArea?.replace(/[^0-9.]/g, '') || '0');
        const subjectArea = parseFloat(subject.livingArea?.replace(/[^0-9.]/g, '') || '0');
        const diff = compArea - subjectArea;
        adjustment = -diff * rates.livingAreaRate; // Negative if comp is larger
        break;
      }

      case 'lotSize': {
        // (comp_lot - subject_lot) × land_rate_per_sqft × (1 - depreciation_rate)
        const compLot = parseFloat(comparable.lotSize?.replace(/[^0-9.]/g, '') || '0');
        const subjectLot = parseFloat(subject.lotSize?.replace(/[^0-9.]/g, '') || '0');
        const diff = compLot - subjectLot;
        const depreciationFactor = 1 - (rates.landDepreciationRate / 100);
        adjustment = -diff * rates.landRate * depreciationFactor;
        break;
      }

      case 'quality': {
        const salePrice = parseFloat(comparable.salePrice) || 0;
        if (rates.qualityAdjustmentMethod === 'percentage') {
          // Compare quality levels (simplified - you may need more logic)
          adjustment = salePrice * (rates.qualityAdjustmentValue / 100);
        } else {
          adjustment = rates.qualityAdjustmentValue;
        }
        break;
      }

      case 'effectiveAge': {
        const compAge = parseFloat(comparable.age || '0');
        const subjectAge = parseFloat(subject.age || '0');
        const ageDiff = compAge - subjectAge;

        if (rates.ageAdjustmentMethod === 'per_year') {
          adjustment = -ageDiff * rates.ageAdjustmentRate;
        } else {
          const salePrice = parseFloat(comparable.salePrice) || 0;
          adjustment = -ageDiff * salePrice * (rates.ageAdjustmentRate / 100);
        }
        break;
      }

      case 'basement': {
        // Simplified - you may need to parse basement finish sqft
        const compBasement = comparable.basement || '';
        const subjectBasement = subject.basement || '';
        // This is simplified - you'd need actual sqft values
        adjustment = 0; // TODO: Implement proper basement calculation
        break;
      }

      case 'bathrooms': {
        // Parse bathrooms (format: "full:half")
        const parseBathrooms = (str: string) => {
          const parts = str?.split(':') || ['0', '0'];
          return parseFloat(parts[0] || '0') + parseFloat(parts[1] || '0') * 0.5;
        };

        const compBath = parseBathrooms(comparable.roomsBathrooms);
        const subjectBath = parseBathrooms(subject.roomsBathrooms);
        const diff = compBath - subjectBath;
        const depreciationFactor = 1 - (rates.bathroomDepreciationRate / 100);
        adjustment = -diff * rates.bathroomValue * depreciationFactor;
        break;
      }

      case 'garage': {
        // Simplified - assumes garage counts
        adjustment = 0; // TODO: Parse garage data
        break;
      }

      case 'floor': {
        // Condo floor adjustment
        if (propertyType === 'condo') {
          // TODO: Get floor numbers from data
          adjustment = 0;
        }
        break;
      }

      case 'landscaping': {
        // TODO: Get landscaping values
        adjustment = 0;
        break;
      }

      case 'extras': {
        // TODO: Get extras values
        adjustment = 0;
        break;
      }

      case 'unitLocation': {
        // Condo unit location (corner vs center)
        if (propertyType === 'condo') {
          // TODO: Determine if corner unit
          adjustment = 0;
        }
        break;
      }
    }

    return Math.round(adjustment);
  };

  // Calculate all adjustments for all comparables
  const calculateAllAdjustments = () => {
    const updatedComparables = adjustmentsData.comparables.map((comp, index) => {
      const newAdjustments: any = {};
      let total = 0;

      ADJUSTMENT_CATEGORIES.forEach(category => {
        if (category.applicablePropertyTypes.includes(propertyType)) {
          const amount = calculateAdjustment(category.id, index);
          newAdjustments[category.id] = {
            category: category.id,
            enabled: true,
            subjectValue: null,
            comparableValue: null,
            difference: 0,
            adjustmentRate: 0,
            calculatedAmount: amount,
            calculationFormula: `${category.id} adjustment`
          };
          total += amount;
        }
      });

      const comparable = directComparisonData.comparables[index];
      const salePrice = parseFloat(comparable?.salePrice || '0');

      return {
        ...comp,
        adjustments: newAdjustments,
        totalAdjustment: total,
        adjustedValue: salePrice + total
      };
    });

    setAdjustmentsData(prev => ({
      ...prev,
      comparables: updatedComparables,
      lastSyncedAt: new Date().toISOString()
    }));

    onChange({
      ...adjustmentsData,
      comparables: updatedComparables,
      lastSyncedAt: new Date().toISOString()
    });

    setHasUnsavedChanges(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const resetToDefaults = () => {
    setAdjustmentsData(prev => ({
      ...prev,
      defaultRates: DEFAULT_RATES_BY_PROPERTY_TYPE[propertyType] || DEFAULT_RATES_BY_PROPERTY_TYPE.single_family
    }));
    setHasUnsavedChanges(true);
  };

  // Get applicable categories for current property type
  const applicableCategories = ADJUSTMENT_CATEGORIES.filter(cat =>
    cat.applicablePropertyTypes.includes(propertyType)
  );

  // Show loading state while initializing
  if (!adjustmentsData.defaultRates) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('subtitle')} - {propertyType}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onClose && (
            <Button
              startIcon={<Close />}
              onClick={onClose}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              {tCommon('close')}
            </Button>
          )}
          <Button
            startIcon={<Refresh />}
            onClick={resetToDefaults}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            {tCommon('reset')}
          </Button>
          <Button
            startIcon={<Calculate />}
            onClick={calculateAllAdjustments}
            variant="contained"
            size="small"
            sx={{ textTransform: 'none' }}
            color="primary"
          >
            {t('calculate')}
          </Button>
          {onSyncToDirectComparison && (
            <Button
              startIcon={<Sync />}
              onClick={onSyncToDirectComparison}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none' }}
              color="success"
            >
              {t('syncToTable')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Default Rates Section */}
      <Card sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('defaultRates')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>{t('viewingRatesFor')}</InputLabel>
                <Select
                  value={selectedPropertyType}
                  onChange={(e) => handlePropertyTypeChange(e.target.value as PropertyType)}
                  label={t('viewingRatesFor')}
                >
                  <MenuItem value="single_family">{t('propertyTypes.single_family')}</MenuItem>
                  <MenuItem value="condo">{t('propertyTypes.condo')}</MenuItem>
                  <MenuItem value="duplex">{t('propertyTypes.duplex')}</MenuItem>
                  <MenuItem value="triplex">{t('propertyTypes.triplex')}</MenuItem>
                  <MenuItem value="quadruplex_plus">{t('propertyTypes.quadruplex_plus')}</MenuItem>
                  <MenuItem value="apartment">{t('propertyTypes.apartment')}</MenuItem>
                  <MenuItem value="semi_commercial">{t('propertyTypes.semi_commercial')}</MenuItem>
                  <MenuItem value="commercial">{t('propertyTypes.commercial')}</MenuItem>
                  <MenuItem value="land">{t('propertyTypes.land')}</MenuItem>
                  <MenuItem value="other">{t('propertyTypes.other')}</MenuItem>
                </Select>
              </FormControl>
              {selectedPropertyType !== propertyType && (
                <Chip
                  label={t('viewingDifferentType')}
                  color="warning"
                  size="small"
                  icon={<Info />}
                />
              )}
            </Box>
          </Box>

          <Grid container spacing={2}>
            {/* Market & Timing */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('marketAppreciationRate')}
                type="number"
                value={adjustmentsData.defaultRates.marketAppreciationRate}
                onChange={(e) => updateRate('marketAppreciationRate', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">% / year</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Living Area */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('livingAreaRate')}
                type="number"
                value={adjustmentsData.defaultRates.livingAreaRate}
                onChange={(e) => updateRate('livingAreaRate', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/sq.ft.</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Land */}
            {selectedPropertyType !== 'condo' && selectedPropertyType !== 'apartment' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={t('landRate')}
                    type="number"
                    value={adjustmentsData.defaultRates.landRate}
                    onChange={(e) => updateRate('landRate', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/sq.ft.</InputAdornment>
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={t('landDepreciationRate')}
                    type="number"
                    value={adjustmentsData.defaultRates.landDepreciationRate}
                    onChange={(e) => updateRate('landDepreciationRate', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    size="small"
                  />
                </Grid>
              </>
            )}

            {/* Basement */}
            {selectedPropertyType !== 'condo' && selectedPropertyType !== 'apartment' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={t('basementFinishRate')}
                    type="number"
                    value={adjustmentsData.defaultRates.basementFinishRate}
                    onChange={(e) => updateRate('basementFinishRate', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/sq.ft.</InputAdornment>
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={t('basementDepreciationRate')}
                    type="number"
                    value={adjustmentsData.defaultRates.basementDepreciationRate}
                    onChange={(e) => updateRate('basementDepreciationRate', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    size="small"
                  />
                </Grid>
              </>
            )}

            {/* Quality */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('qualityAdjustmentMethod')}</InputLabel>
                <Select
                  value={adjustmentsData.defaultRates.qualityAdjustmentMethod}
                  onChange={(e) => updateRate('qualityAdjustmentMethod' as any, e.target.value as any)}
                  label={t('qualityAdjustmentMethod')}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('qualityAdjustmentValue')}
                type="number"
                value={adjustmentsData.defaultRates.qualityAdjustmentValue}
                onChange={(e) => updateRate('qualityAdjustmentValue', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: adjustmentsData.defaultRates.qualityAdjustmentMethod === 'fixed' ? <InputAdornment position="start">$</InputAdornment> : null,
                  endAdornment: <InputAdornment position="end">{adjustmentsData.defaultRates.qualityAdjustmentMethod === 'percentage' ? '%' : ''}</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Age */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('ageAdjustmentMethod')}</InputLabel>
                <Select
                  value={adjustmentsData.defaultRates.ageAdjustmentMethod}
                  onChange={(e) => updateRate('ageAdjustmentMethod' as any, e.target.value as any)}
                  label={t('ageAdjustmentMethod')}
                >
                  <MenuItem value="per_year">Per Year</MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('ageAdjustmentRate')}
                type="number"
                value={adjustmentsData.defaultRates.ageAdjustmentRate}
                onChange={(e) => updateRate('ageAdjustmentRate', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: adjustmentsData.defaultRates.ageAdjustmentMethod === 'per_year' ? <InputAdornment position="start">$</InputAdornment> : null,
                  endAdornment: <InputAdornment position="end">{adjustmentsData.defaultRates.ageAdjustmentMethod === 'percentage' ? '%' : '/ year'}</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Bathrooms */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('bathroomValue')}
                type="number"
                value={adjustmentsData.defaultRates.bathroomValue}
                onChange={(e) => updateRate('bathroomValue', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('bathroomDepreciationRate')}
                type="number"
                value={adjustmentsData.defaultRates.bathroomDepreciationRate}
                onChange={(e) => updateRate('bathroomDepreciationRate', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Garage */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('garageValue')}
                type="number"
                value={adjustmentsData.defaultRates.garageValue}
                onChange={(e) => updateRate('garageValue', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Floor (Condos/Apartments) */}
            {(selectedPropertyType === 'condo' || selectedPropertyType === 'apartment') && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={t('floorValue')}
                  type="number"
                  value={adjustmentsData.defaultRates.floorValue}
                  onChange={(e) => updateRate('floorValue', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/ floor</InputAdornment>
                  }}
                  size="small"
                />
              </Grid>
            )}

            {/* Landscaping */}
            {selectedPropertyType !== 'condo' && selectedPropertyType !== 'apartment' && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={t('landscapingDepreciationRate')}
                  type="number"
                  value={adjustmentsData.defaultRates.landscapingDepreciationRate}
                  onChange={(e) => updateRate('landscapingDepreciationRate', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  size="small"
                />
              </Grid>
            )}

            {/* Extras */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('extrasDepreciationRate')}
                type="number"
                value={adjustmentsData.defaultRates.extrasDepreciationRate}
                onChange={(e) => updateRate('extrasDepreciationRate', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                size="small"
              />
            </Grid>

            {/* Unit Location (Condos/Apartments) */}
            {(selectedPropertyType === 'condo' || selectedPropertyType === 'apartment') && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={t('cornerUnitPremium')}
                  type="number"
                  value={adjustmentsData.defaultRates.cornerUnitPremium}
                  onChange={(e) => updateRate('cornerUnitPremium', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Comparables - One Card Per Comparable */}
      {(!adjustmentsData.comparables || adjustmentsData.comparables.length === 0) ? (
        <Card sx={{ mb: 3, borderRadius: '16px' }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No comparables found. Please add comparables in the Direct Comparison section first.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        adjustmentsData.comparables.map((comparable, compIdx) => {
          const compData = directComparisonData?.comparables?.[compIdx] || {};
          const subjectData = directComparisonData?.subject || {};

          return (
            <Card key={compIdx} sx={{ mb: 3, borderRadius: '16px' }}>
            <CardContent>
              {/* Comparable Header */}
              <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {t('comparable')} {compIdx + 1}: {comparable.comparableAddress || 'N/A'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Sale Price
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${compData.salePrice?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Sale Date
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {compData.saleDate || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Adjustments by Category */}
              {applicableCategories.map((category) => {
                const adjustment = comparable.adjustments[category.id];
                const amount = adjustment?.calculatedAmount || 0;

                return (
                  <Box key={category.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: '12px' }}>
                    {/* Category Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {t(`categories.${category.labelKey}`)}
                        </Typography>
                        {category.id === 'timing' && (() => {
                          const saleDate = adjustment?.comparableValue ? new Date(adjustment.comparableValue) : null;
                          const effDate = adjustment?.subjectValue ? new Date(adjustment.subjectValue) : null;
                          if (saleDate && effDate) {
                            const months = Math.round((effDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                            const rate = adjustmentsData.defaultRates.marketAppreciationRate || 0;
                            const salePrice = parseFloat(compData.salePrice) || 0;
                            return (
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                ({rate}% / 12) × {months} months × ${salePrice.toLocaleString()}
                              </Typography>
                            );
                          }
                          return null;
                        })()}
                        {category.id !== 'timing' && (
                          <Typography variant="caption" color="text.secondary">
                            {t(`categories.${category.labelKey}Description`)}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={`${amount >= 0 ? '+' : ''}$${Math.round(amount).toLocaleString()}`}
                        size="small"
                        color={amount > 0 ? 'success' : amount < 0 ? 'error' : 'default'}
                        sx={{ fontWeight: 600, minWidth: 100 }}
                      />
                    </Box>

                    {/* Subject | Comparable | Difference | Adjustment */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'white' }}>
                          <Typography variant="caption" color="primary.main" fontWeight={600} display="block" mb={1}>
                            SUBJECT
                          </Typography>
                          <Typography variant="body2">
                            {(category.id === 'livingArea' || category.id === 'lotSize')
                              ? formatAreaMeasurement(adjustment?.subjectValue)
                              : (adjustment?.subjectLabel || adjustment?.subjectValue || '-')}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'white' }}>
                          <Typography variant="caption" color="secondary.main" fontWeight={600} display="block" mb={1}>
                            COMPARABLE
                          </Typography>
                          <Typography variant="body2">
                            {(category.id === 'livingArea' || category.id === 'lotSize')
                              ? formatAreaMeasurement(adjustment?.comparableValue)
                              : (adjustment?.comparableLabel || adjustment?.comparableValue || '-')}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                            DIFFERENCE
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {(() => {
                              if (category.id === 'timing') {
                                const saleDate = adjustment?.comparableValue ? new Date(adjustment.comparableValue) : null;
                                const effDate = adjustment?.subjectValue ? new Date(adjustment.subjectValue) : null;
                                if (saleDate && effDate) {
                                  const months = Math.round((effDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                                  return `${months} months`;
                                }
                                return '-';
                              }
                              // For other categories, show the difference
                              const diff = adjustment?.difference || 0;
                              return diff !== 0 ? diff.toLocaleString() : '-';
                            })()}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Adjustment"
                          type="text"
                          value={Math.round(adjustment?.manualOverride ?? adjustment?.calculatedAmount ?? 0).toLocaleString('fr-CA').replace(/,/g, ' ')}
                          size="small"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}

              {/* Total Summary */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid', borderColor: 'primary.main' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={700}>
                      Total Adjustment:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      ${comparable.totalAdjustment?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={700}>
                      Adjusted Value:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body1" fontWeight={700} color="success.main">
                      ${comparable.adjustedValue?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
          );
        })
      )}
    </Box>
  );
}
