'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Paper
} from '@mui/material'
import {
  Business,
  People,
  Home,
  TrendingUp
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'

interface OrganizationStat {
  id: string
  name: string
  created_at: string
  user_count: number
  property_count: number
}

interface OrganizationStatsData {
  organizations: OrganizationStat[]
  totals: {
    total_organizations: number
    total_users: number
    total_properties: number
    users_without_org: number
  }
}

export default function OrganizationStats() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OrganizationStatsData | null>(null)

  const fetchOrganizationStats = async () => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/organizations/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch organization stats')
      }

      const stats = await response.json()
      setData(stats)
    } catch (err: any) {
      console.error('Error fetching organization stats:', err)
      setError(err.message || 'Failed to load organization statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      fetchOrganizationStats()
    }
  }, [session?.access_token])

  if (loading) {
    return (
      <Card sx={{ borderRadius: '16px', minHeight: 400 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card sx={{ borderRadius: '16px' }}>
      <CardContent>
        {/* Header with gradient */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          p: 2,
          mb: 3,
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business /> Organizations Overview
          </Typography>
        </Box>

        {/* Summary Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: '12px' }}>
            <Business color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
              {data.totals.total_organizations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Organizations
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: '12px' }}>
            <People color="success" />
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
              {data.totals.total_users}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Assigned Users
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: '12px' }}>
            <Home color="info" />
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
              {data.totals.total_properties}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Library Records
            </Typography>
          </Box>

          {data.totals.users_without_org > 0 && (
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: '12px' }}>
              <People color="warning" />
              <Typography variant="h4" sx={{ fontWeight: 600, mt: 1, color: 'warning.dark' }}>
                {data.totals.users_without_org}
              </Typography>
              <Typography variant="caption" color="warning.dark">
                Unassigned Users
              </Typography>
            </Box>
          )}
        </Box>

        {/* Organizations Table */}
        <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Organization Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Users</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Library Records</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.organizations.map((org) => (
                <TableRow key={org.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2">{org.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={org.user_count}
                      size="small"
                      color={org.user_count > 0 ? 'success' : 'default'}
                      variant={org.user_count > 0 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={org.property_count}
                      size="small"
                      color={org.property_count > 0 ? 'info' : 'default'}
                      variant={org.property_count > 0 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" color="text.secondary">
                      {new Date(org.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {data.organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No organizations found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}