'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { Calculate, Close } from '@mui/icons-material';

interface Component {
  id: string;
  name: string;
  percentage: number;
  lifespan: number;
  renovationYears: number;
}

interface EffectiveAgeCalculatorProps {
  data: any;
  onChange: (data: any) => void;
  constructionYear?: number;
  effectiveDate?: string | null;
  onClose?: () => void;
}

const DEFAULT_COMPONENTS: Component[] = [
  { id: 'fondations', name: 'Fondations (semelles et murs)', percentage: 9.5, lifespan: 65, renovationYears: 0 },
  { id: 'dalle', name: 'Dalle au sol', percentage: 3.0, lifespan: 65, renovationYears: 0 },
  { id: 'charpente', name: 'Charpente des murs et du toit', percentage: 12.5, lifespan: 65, renovationYears: 0 },
  { id: 'toit', name: 'Toit', percentage: 5.5, lifespan: 25, renovationYears: 0 },
  { id: 'portes_fenetres', name: 'Portes et fenêtres', percentage: 2.5, lifespan: 20, renovationYears: 0 },
  { id: 'planchers_structure', name: 'Structure de planchers & escaliers', percentage: 6.5, lifespan: 65, renovationYears: 0 },
  { id: 'cloisons_structure', name: 'Structure de cloisons', percentage: 3.5, lifespan: 65, renovationYears: 0 },
  { id: 'plafonds_structure', name: 'Structure de plafonds', percentage: 2.5, lifespan: 65, renovationYears: 0 },
  { id: 'electricite', name: 'Électricité', percentage: 3.5, lifespan: 35, renovationYears: 0 },
  { id: 'plomberie', name: 'Plomberie', percentage: 2.5, lifespan: 25, renovationYears: 0 },
  { id: 'chauffage', name: 'Chauffage', percentage: 5.5, lifespan: 30, renovationYears: 0 },
  { id: 'planchers_fini', name: 'Planchers (fini)', percentage: 3.0, lifespan: 45, renovationYears: 0 },
  { id: 'cloisons_fini', name: 'Cloisons (fini)', percentage: 7.5, lifespan: 65, renovationYears: 0 },
  { id: 'plafonds_fini', name: 'Plafonds (fini)', percentage: 2.5, lifespan: 65, renovationYears: 0 },
  { id: 'portes_moulures', name: 'Portes, moulures, boiseries', percentage: 5.5, lifespan: 30, renovationYears: 0 },
  { id: 'parement', name: 'Parement', percentage: 10.0, lifespan: 65, renovationYears: 0 },
  { id: 'cuisine_sdb', name: 'Finition cuisine & salle de bains', percentage: 12.5, lifespan: 30, renovationYears: 0 },
  { id: 'peinture', name: 'Peinture', percentage: 1.5, lifespan: 15, renovationYears: 0 }
];

export default function EffectiveAgeCalculator({
  data,
  onChange,
  constructionYear,
  effectiveDate,
  onClose
}: EffectiveAgeCalculatorProps) {
  const [components, setComponents] = useState<Component[]>(
    data.components || DEFAULT_COMPONENTS
  );
  const [totalLifespan, setTotalLifespan] = useState<number>(data.totalLifespan || 65);

  // Calculate chronological age
  const chronologicalAge = useMemo(() => {
    if (!constructionYear) return 0;
    const currentYear = effectiveDate
      ? new Date(effectiveDate).getFullYear()
      : new Date().getFullYear();
    return currentYear - constructionYear;
  }, [constructionYear, effectiveDate]);

  // Calculate effective age for each component
  const calculatedData = useMemo(() => {
    return components.map(component => {
      const renovationYears = component.renovationYears || 0;
      const componentAge = Math.max(0, chronologicalAge - renovationYears);

      // Remaining life percentage
      const remainingLifePercent = Math.max(0, Math.min(100,
        ((component.lifespan - componentAge) / component.lifespan) * 100
      ));

      // Consumed life percentage
      const consumedLifePercent = 100 - remainingLifePercent;

      // Weighted consumed percentage
      const weightedConsumed = (consumedLifePercent * component.percentage) / 100;

      // Effective age contribution
      const effectiveAgeContribution = (componentAge / component.lifespan) * component.percentage;

      // Apparent age percentage
      const apparentAgePercent = (componentAge / component.lifespan) * 100;

      return {
        ...component,
        componentAge,
        remainingLifePercent,
        consumedLifePercent,
        weightedConsumed,
        effectiveAgeContribution,
        apparentAgePercent
      };
    });
  }, [components, chronologicalAge]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalWeightedConsumed = calculatedData.reduce((sum, c) => sum + c.weightedConsumed, 0);
    const totalEffectiveAge = calculatedData.reduce((sum, c) => sum + c.effectiveAgeContribution, 0);
    const apparentAge = Math.round((totalEffectiveAge / 100) * totalLifespan);
    const remainingEconomicLife = Math.max(0, totalLifespan - apparentAge);
    const physicalDepreciation = (apparentAge / totalLifespan) * 100;

    return {
      totalWeightedConsumed,
      totalEffectiveAge,
      apparentAge,
      remainingEconomicLife,
      physicalDepreciation
    };
  }, [calculatedData, totalLifespan]);

  // Update parent when data changes
  useEffect(() => {
    onChange({
      components,
      totalLifespan,
      chronologicalAge,
      ...totals
    });
  }, [components, totalLifespan, chronologicalAge, totals]);

  const handleRenovationYearsChange = (id: string, value: number) => {
    setComponents(prev =>
      prev.map(c => c.id === id ? { ...c, renovationYears: value } : c)
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Calculate sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Effective Age Calculator
          </Typography>
        </Box>
        {onClose && (
          <Button
            startIcon={<Close />}
            onClick={onClose}
            variant="outlined"
            size="small"
          >
            Close
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Construction Year
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {constructionYear || 'N/A'}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Chronological Age
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {chronologicalAge} years
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Total Lifespan
            </Typography>
            <TextField
              type="number"
              value={totalLifespan}
              onChange={(e) => setTotalLifespan(parseInt(e.target.value) || 65)}
              size="small"
              sx={{ width: 100 }}
              InputProps={{ endAdornment: <Typography variant="caption">years</Typography> }}
            />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Apparent Age
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {totals.apparentAge} years
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Remaining Economic Life
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {totals.remainingEconomicLife} years
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Physical Depreciation
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {totals.physicalDepreciation.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Components Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Component</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>%</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Lifespan</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Renovation (years ago)</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Component Age</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Remaining Life %</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Consumed %</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Weighted Consumed</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Apparent Age %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calculatedData.map((component, index) => (
              <TableRow
                key={component.id}
                sx={{
                  bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <TableCell>{component.name}</TableCell>
                <TableCell align="center">{component.percentage}%</TableCell>
                <TableCell align="center">{component.lifespan} years</TableCell>
                <TableCell align="center">
                  <TextField
                    type="number"
                    value={component.renovationYears}
                    onChange={(e) => handleRenovationYearsChange(component.id, parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 80 }}
                    inputProps={{ min: 0, max: chronologicalAge }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500 }}>
                  {component.componentAge} years
                </TableCell>
                <TableCell align="center" sx={{ color: component.remainingLifePercent < 25 ? 'error.main' : 'text.primary' }}>
                  {component.remainingLifePercent.toFixed(1)}%
                </TableCell>
                <TableCell align="center">
                  {component.consumedLifePercent.toFixed(1)}%
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500 }}>
                  {component.weightedConsumed.toFixed(2)}%
                </TableCell>
                <TableCell align="center">
                  {component.apparentAgePercent.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}

            {/* Totals Row */}
            <TableRow sx={{ bgcolor: 'action.selected' }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>100%</TableCell>
              <TableCell colSpan={5} />
              <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totals.totalWeightedConsumed.toFixed(2)}%
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totals.totalEffectiveAge.toFixed(2)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
