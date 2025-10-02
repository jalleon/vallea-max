'use client'

import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha
} from '@mui/material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Home,
  AttachMoney
} from '@mui/icons-material'

// Données fictives pour les graphiques
const monthlyData = [
  { name: 'Jan', evaluations: 8, revenus: 24000, moyenne: 300000 },
  { name: 'Fév', evaluations: 12, revenus: 36000, moyenne: 315000 },
  { name: 'Mar', evaluations: 15, revenus: 45000, moyenne: 325000 },
  { name: 'Avr', evaluations: 10, revenus: 30000, moyenne: 310000 },
  { name: 'Mai', evaluations: 18, revenus: 54000, moyenne: 335000 },
  { name: 'Jun', evaluations: 22, revenus: 66000, moyenne: 340000 }
]

const propertyTypes = [
  { name: 'Résidentiel', value: 65, color: '#1e3a8a' },
  { name: 'Commercial', value: 20, color: '#3b82f6' },
  { name: 'Industriel', value: 10, color: '#60a5fa' },
  { name: 'Terrain', value: 5, color: '#93c5fd' }
]

const marketTrends = [
  { region: 'Montréal', evolution: '+5.2%', valeur: 485000, trend: 'up' },
  { region: 'Laval', evolution: '+3.8%', valeur: 420000, trend: 'up' },
  { region: 'Longueuil', evolution: '-1.2%', valeur: 395000, trend: 'down' },
  { region: 'Gatineau', evolution: '+7.1%', valeur: 365000, trend: 'up' }
]

export function FinancialCharts() {
  return (
    <Grid container spacing={3}>
      {/* Graphique des revenus mensuels */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ height: 400 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Performance Mensuelle
              </Typography>
              <Chip
                icon={<TrendingUp />}
                label="+22% vs année précédente"
                color="success"
                variant="outlined"
              />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  stroke="#1e3a8a"
                  fillOpacity={1}
                  fill="url(#colorRevenus)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Répartition des types de propriétés */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ height: 400 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Types de Propriétés
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={propertyTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {propertyTypes.map((type, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: type.color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {type.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {type.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Nombre d'évaluations par mois */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 350 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Évaluations Complétées
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="evaluations"
                  fill="#0f766e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Tendances du marché */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 350 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Tendances du Marché
            </Typography>
            <Box sx={{ mt: 2 }}>
              {marketTrends.map((trend, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: alpha(trend.trend === 'up' ? '#059669' : '#dc2626', 0.05),
                    border: '1px solid',
                    borderColor: alpha(trend.trend === 'up' ? '#059669' : '#dc2626', 0.1)
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Home fontSize="small" />
                      <Typography variant="body1" fontWeight={600}>
                        {trend.region}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {trend.trend === 'up' ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={trend.trend === 'up' ? 'success.main' : 'error.main'}
                      >
                        {trend.evolution}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Valeur moyenne: {trend.valeur.toLocaleString('fr-CA')} $
                  </Typography>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Évolution des valeurs moyennes */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Évolution des Valeurs Moyennes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="moyenne"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ fill: '#0f766e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#0f766e', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}