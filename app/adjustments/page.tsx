'use client'

import React, { useState } from 'react'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  Divider,
  InputAdornment,
  Fab,
  Tooltip
} from '@mui/material'
import {
  Add,
  Balance,
  Calculate,
  Home,
  Business,
  AttachMoney,
  CompareArrows,
  TrendingUp,
  TrendingDown,
  Save,
  Print,
  Share,
  Edit,
  SquareFoot,
  CalendarToday,
  DirectionsCar,
  Star,
  LocationOn
} from '@mui/icons-material'
import { MaterialDashboardLayout } from '../../components/layout/MaterialDashboardLayout'

// Données factices pour les ajustements
const adjustmentCriteria = [
  {
    id: 1,
    criteria: 'Surface habitable',
    subject: '1,250 pi²',
    comparable: '1,180 pi²',
    difference: '+70 pi²',
    adjustment: 14000,
    unit: 'pi²',
    rate: 200
  },
  {
    id: 2,
    criteria: 'Année de construction',
    subject: '2005',
    comparable: '2010',
    difference: '-5 ans',
    adjustment: -8000,
    unit: 'années',
    rate: 1600
  },
  {
    id: 3,
    criteria: 'Garage',
    subject: 'Oui (2 places)',
    comparable: 'Non',
    difference: '+1',
    adjustment: 15000,
    unit: 'garage',
    rate: 15000
  },
  {
    id: 4,
    criteria: 'État général',
    subject: 'Bon',
    comparable: 'Très bon',
    difference: '-1 niveau',
    adjustment: -5000,
    unit: 'condition',
    rate: 5000
  },
  {
    id: 5,
    criteria: 'Localisation',
    subject: 'Centre-ville',
    comparable: 'Banlieue proche',
    difference: '+1 niveau',
    adjustment: 12000,
    unit: 'zone',
    rate: 12000
  }
]

const stats = [
  {
    title: 'Calculs ce mois',
    value: '24',
    change: '+18%',
    icon: Calculate,
    color: 'primary'
  },
  {
    title: 'Précision moyenne',
    value: '96.8%',
    change: '+2.1%',
    icon: Star,
    color: 'success'
  },
  {
    title: 'Temps économisé',
    value: '42h',
    change: '+25%',
    icon: TrendingUp,
    color: 'info'
  },
  {
    title: 'Comparables utilisés',
    value: '156',
    change: '+12',
    icon: CompareArrows,
    color: 'warning'
  }
]

const recentCalculations = [
  {
    id: 1,
    property: '123 Rue Principale',
    city: 'Montréal',
    comparable: '456 Avenue des Pins',
    baseValue: 445000,
    adjustment: 16000,
    finalValue: 461000,
    date: '2024-03-15',
    status: 'completed'
  },
  {
    id: 2,
    property: '789 Boulevard René-Lévesque',
    city: 'Québec',
    comparable: '321 Rue Cartier',
    baseValue: 380000,
    adjustment: -8500,
    finalValue: 371500,
    date: '2024-03-14',
    status: 'completed'
  },
  {
    id: 3,
    property: '555 Chemin des Prairies',
    city: 'Laval',
    comparable: '777 Avenue Martin',
    baseValue: 520000,
    adjustment: 22000,
    finalValue: 542000,
    date: '2024-03-13',
    status: 'in_progress'
  }
]

export default function AdjustmentsPage() {
  const totalAdjustment = adjustmentCriteria.reduce((sum, item) => sum + item.adjustment, 0)
  const basePrice = 445000
  const finalValue = basePrice + totalAdjustment

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Ajustements
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Calculez les ajustements de valeur pour vos évaluations comparatives
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Save />}
                sx={{ borderRadius: 3 }}
              >
                Sauvegarder
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ borderRadius: 3 }}
              >
                Nouveau Calcul
              </Button>
            </Box>
          </Box>
        </Box>


        {/* Property Comparison Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Subject Property */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <Home />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Propriété Évaluée
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sujet de l'évaluation
                    </Typography>
                  </Box>
                </Box>

                <Paper sx={{ p: 2, bgcolor: alpha('#1e3a8a', 0.05), mb: 2 }}>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    123 Rue Principale
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Montréal, QC
                    </Typography>
                  </Box>
                </Paper>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SquareFoot fontSize="small" color="action" />
                      <Typography variant="body2">1,250 pi²</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">2005</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">3 chambres</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar fontSize="small" color="action" />
                      <Typography variant="body2">Garage 2 places</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Comparable Property */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Propriété Comparable
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vente récente
                    </Typography>
                  </Box>
                </Box>

                <Paper sx={{ p: 2, bgcolor: alpha('#059669', 0.05), mb: 2 }}>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    456 Avenue des Pins
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Montréal, QC
                    </Typography>
                  </Box>
                  <Chip
                    label={`Prix de vente: ${basePrice.toLocaleString('fr-CA')} $`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </Paper>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SquareFoot fontSize="small" color="action" />
                      <Typography variant="body2">1,180 pi²</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">2010</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">3 chambres</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Pas de garage</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Adjustment Grid */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, bgcolor: alpha('#1e3a8a', 0.05) }}>
              <Typography variant="h6" fontWeight={600}>
                Grille d'Ajustements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyse détaillée des différences entre les propriétés
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#1e3a8a', 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Critère</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Propriété Évaluée</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Comparable</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Différence</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ajustement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adjustmentCriteria.map((row) => (
                    <TableRow key={row.id} sx={{ '&:hover': { bgcolor: alpha('#1e3a8a', 0.02) } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.criteria}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.comparable}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.difference}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {row.adjustment > 0 ? (
                            <TrendingUp color="success" fontSize="small" />
                          ) : (
                            <TrendingDown color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={row.adjustment > 0 ? 'success.main' : 'error.main'}
                          >
                            {row.adjustment > 0 ? '+' : ''}{row.adjustment.toLocaleString('fr-CA')} $
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Total Row */}
                  <TableRow sx={{ bgcolor: alpha('#1e3a8a', 0.05) }}>
                    <TableCell colSpan={4}>
                      <Typography variant="body1" fontWeight={700}>
                        TOTAL AJUSTEMENTS
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {totalAdjustment > 0 ? (
                          <TrendingUp color="success" />
                        ) : (
                          <TrendingDown color="error" />
                        )}
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={totalAdjustment > 0 ? 'success.main' : 'error.main'}
                        >
                          {totalAdjustment > 0 ? '+' : ''}{totalAdjustment.toLocaleString('fr-CA')} $
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Final Value Calculation */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            mb: 4
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Valeur Ajustée Estimée
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                  Prix de vente comparable + ajustements totaux
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1">
                    {basePrice.toLocaleString('fr-CA')} $
                  </Typography>
                  <CompareArrows />
                  <Typography variant="body1" color={totalAdjustment > 0 ? '#4ade80' : '#f87171'}>
                    {totalAdjustment > 0 ? '+' : ''}{totalAdjustment.toLocaleString('fr-CA')} $
                  </Typography>
                  <Typography variant="body1">=</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h3" fontWeight={700}>
                  {finalValue.toLocaleString('fr-CA')} $
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Valeur marchande estimée
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Calculations */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Calculs Récents
              </Typography>
              <Button size="small" endIcon={<Balance />}>
                Voir tous
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentCalculations.map((calc) => (
                <Paper
                  key={calc.id}
                  sx={{
                    p: 3,
                    bgcolor: alpha('#1e3a8a', 0.02),
                    border: '1px solid',
                    borderColor: alpha('#1e3a8a', 0.1),
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: alpha('#1e3a8a', 0.05),
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <Balance />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {calc.property}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comparable: {calc.comparable} • {new Date(calc.date).toLocaleDateString('fr-CA')}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Base: {calc.baseValue.toLocaleString('fr-CA')} $
                        </Typography>
                        <Typography variant="body2" color={calc.adjustment > 0 ? 'success.main' : 'error.main'}>
                          Ajust: {calc.adjustment > 0 ? '+' : ''}{calc.adjustment.toLocaleString('fr-CA')} $
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {calc.finalValue.toLocaleString('fr-CA')} $
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir détails">
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Partager">
                          <IconButton size="small" color="info">
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add calculation"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          }}
        >
          <Calculate />
        </Fab>
      </Box>
    </MaterialDashboardLayout>
  )
}