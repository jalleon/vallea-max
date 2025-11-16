'use client';

import { useMemo } from 'react';
import { Alert, AlertTitle, Box, List, ListItem, ListItemText, Collapse } from '@mui/material';
import { Warning, Error as ErrorIcon, Info } from '@mui/icons-material';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  field: string;
  message: string;
  suggestion?: string;
}

interface SmartValidationWarningsProps {
  formData: Record<string, any>;
  propertyType?: string;
  sectionId: string;
}

/**
 * Smart validation component that analyzes form data for anomalies
 * Phase 4: Smart Forms & Auto-Population
 */
export default function SmartValidationWarnings({
  formData,
  propertyType = 'single_family',
  sectionId
}: SmartValidationWarningsProps) {
  const issues = useMemo(() => {
    return detectIssues(formData, propertyType, sectionId);
  }, [formData, propertyType, sectionId]);

  if (issues.length === 0) {
    return null;
  }

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return (
    <Box sx={{ mb: 3 }}>
      {errors.length > 0 && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: '12px' }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Errors Found</AlertTitle>
          <List dense>
            {errors.map((issue, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={issue.message}
                  secondary={issue.suggestion}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 2, borderRadius: '12px' }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Warnings</AlertTitle>
          <List dense>
            {warnings.map((issue, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={issue.message}
                  secondary={issue.suggestion}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {infos.length > 0 && (
        <Alert severity="info" icon={<Info />} sx={{ borderRadius: '12px' }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Suggestions</AlertTitle>
          <List dense>
            {infos.map((issue, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={issue.message}
                  secondary={issue.suggestion}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  );
}

/**
 * Detect data anomalies and validation issues
 */
function detectIssues(
  formData: Record<string, any>,
  propertyType: string,
  sectionId: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Reference Sheet validation
  if (sectionId === 'fiche_reference') {
    // Check for missing critical fields
    if (!formData.address || formData.address.trim() === '') {
      issues.push({
        severity: 'error',
        field: 'address',
        message: 'Property address is required',
        suggestion: 'Please enter the full civic address'
      });
    }

    if (!formData.ownerName || formData.ownerName.trim() === '') {
      issues.push({
        severity: 'warning',
        field: 'ownerName',
        message: 'Owner name is missing',
        suggestion: 'Consider adding owner information for completeness'
      });
    }
  }

  // Direct Comparison validation
  if (sectionId === 'methode_parite') {
    const livingArea = parseFloat(formData.livingArea);
    const bedrooms = parseInt(formData.roomsBedrooms);
    const bathrooms = parseFloat(formData.roomsBathrooms);
    const salePrice = parseFloat(formData.salePrice);

    // Living area too small for number of bedrooms
    if (!isNaN(livingArea) && !isNaN(bedrooms) && bedrooms > 0) {
      const minAreaPerBedroom = 400; // sq ft
      const expectedMinArea = bedrooms * minAreaPerBedroom;

      if (livingArea < expectedMinArea) {
        issues.push({
          severity: 'warning',
          field: 'livingArea',
          message: `Living area (${livingArea} sq ft) seems small for ${bedrooms} bedrooms`,
          suggestion: `Expected at least ${expectedMinArea} sq ft. Please verify the data.`
        });
      }
    }

    // Unusual bathroom ratio
    if (!isNaN(bedrooms) && !isNaN(bathrooms) && bedrooms > 0 && bathrooms > 0) {
      if (bathrooms > bedrooms * 1.5) {
        issues.push({
          severity: 'info',
          field: 'roomsBathrooms',
          message: 'Unusually high bathroom-to-bedroom ratio',
          suggestion: `${bathrooms} bathrooms for ${bedrooms} bedrooms is uncommon. Please verify.`
        });
      }
    }

    // Price per sq ft validation
    if (!isNaN(salePrice) && !isNaN(livingArea) && livingArea > 0) {
      const pricePerSqFt = salePrice / livingArea;

      if (pricePerSqFt < 50) {
        issues.push({
          severity: 'warning',
          field: 'salePrice',
          message: `Price per sq ft ($${pricePerSqFt.toFixed(2)}) is unusually low`,
          suggestion: 'This may indicate an error in sale price or living area'
        });
      }

      if (pricePerSqFt > 1000) {
        issues.push({
          severity: 'warning',
          field: 'salePrice',
          message: `Price per sq ft ($${pricePerSqFt.toFixed(2)}) is unusually high`,
          suggestion: 'This may indicate a luxury property or data entry error'
        });
      }
    }

    // Missing critical comparable data
    if (!formData.saleDate || formData.saleDate === '') {
      issues.push({
        severity: 'error',
        field: 'saleDate',
        message: 'Sale date is required for comparables',
        suggestion: 'Enter the date of sale transaction'
      });
    }

    if (!formData.dataSource || formData.dataSource.trim() === '') {
      issues.push({
        severity: 'warning',
        field: 'dataSource',
        message: 'Data source is not specified',
        suggestion: 'Indicate where this comparable data came from (MLS, Centris, etc.)'
      });
    }
  }

  // Condo-specific validation
  if (propertyType === 'condo') {
    if (!formData.unitLocation || formData.unitLocation.trim() === '') {
      issues.push({
        severity: 'warning',
        field: 'unitLocation',
        message: 'Unit location is missing',
        suggestion: 'For condos, specify floor level and unit position'
      });
    }

    if (!formData.condoFees) {
      issues.push({
        severity: 'info',
        field: 'condoFees',
        message: 'Condo fees not specified',
        suggestion: 'Monthly condo fees are important for condo valuations'
      });
    }
  }

  // Land-specific validation
  if (propertyType === 'land') {
    if (!formData.lotSize || formData.lotSize === '') {
      issues.push({
        severity: 'error',
        field: 'lotSize',
        message: 'Lot size is required for land parcels',
        suggestion: 'Enter the lot size in acres or square feet'
      });
    }

    if (!formData.zoning || formData.zoning.trim() === '') {
      issues.push({
        severity: 'warning',
        field: 'zoning',
        message: 'Zoning information is missing',
        suggestion: 'Zoning is critical for land valuations'
      });
    }

    // Warn if building-specific fields are filled for land
    if (formData.livingArea && formData.livingArea !== '') {
      issues.push({
        severity: 'info',
        field: 'livingArea',
        message: 'Living area specified for land parcel',
        suggestion: 'Living area is typically not applicable for vacant land'
      });
    }
  }

  // Multi-family validation
  if (propertyType === 'multi_family') {
    if (!formData.numberOfUnits || parseInt(formData.numberOfUnits) < 2) {
      issues.push({
        severity: 'error',
        field: 'numberOfUnits',
        message: 'Number of units must be 2 or more for multi-family',
        suggestion: 'Multi-family properties have multiple rental units'
      });
    }

    if (formData.monthlyIncome && formData.numberOfUnits) {
      const incomePerUnit = parseFloat(formData.monthlyIncome) / parseInt(formData.numberOfUnits);
      if (incomePerUnit < 500) {
        issues.push({
          severity: 'warning',
          field: 'monthlyIncome',
          message: `Income per unit ($${incomePerUnit.toFixed(0)}/month) seems low`,
          suggestion: 'Verify rental income figures for accuracy'
        });
      }
    }
  }

  // Commercial validation
  if (propertyType === 'commercial') {
    if (!formData.commercialUse || formData.commercialUse.trim() === '') {
      issues.push({
        severity: 'error',
        field: 'commercialUse',
        message: 'Commercial use type is required',
        suggestion: 'Specify the type of commercial use (retail, office, industrial, etc.)'
      });
    }

    if (!formData.zoning || formData.zoning.trim() === '') {
      issues.push({
        severity: 'warning',
        field: 'zoning',
        message: 'Zoning information is missing',
        suggestion: 'Zoning is critical for commercial properties'
      });
    }
  }

  return issues;
}
