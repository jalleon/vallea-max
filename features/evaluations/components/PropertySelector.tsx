'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  alpha,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Home,
  LocationOn,
  CheckCircle,
  SquareFoot,
  Landscape,
  CalendarToday,
  Sell,
  Gavel,
  PlayCircle,
  FilterList
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

interface PropertySelectorProps {
  selectedPropertyId: string | null;
  onSelect: (propertyId: string, propertyData: any) => void;
}

// Status color configuration
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Sujet':
      return {
        color: '#7c3aed', // Purple
        bgColor: 'rgba(124, 58, 237, 0.1)',
        icon: <Gavel sx={{ fontSize: 14 }} />,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
      };
    case 'Vendu':
      return {
        color: '#059669', // Green
        bgColor: 'rgba(5, 150, 105, 0.1)',
        icon: <Sell sx={{ fontSize: 14 }} />,
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
      };
    case 'Actif':
      return {
        color: '#2563eb', // Blue
        bgColor: 'rgba(37, 99, 235, 0.1)',
        icon: <PlayCircle sx={{ fontSize: 14 }} />,
        gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
      };
    default:
      return {
        color: '#6b7280', // Gray
        bgColor: 'rgba(107, 114, 128, 0.1)',
        icon: <Home sx={{ fontSize: 14 }} />,
        gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
      };
  }
};

// Source badge color
const getSourceColor = (source: string) => {
  const sourceLower = source?.toLowerCase() || '';
  if (sourceLower.includes('mls') || sourceLower.includes('centris')) {
    return { color: '#ea580c', bgColor: 'rgba(234, 88, 12, 0.1)' }; // Orange
  }
  if (sourceLower.includes('manuel') || sourceLower.includes('manual')) {
    return { color: '#0891b2', bgColor: 'rgba(8, 145, 178, 0.1)' }; // Cyan
  }
  if (sourceLower.includes('import')) {
    return { color: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' }; // Purple
  }
  return { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' }; // Gray
};

// Status priority for sorting (lower = higher priority)
const STATUS_PRIORITY: Record<string, number> = {
  'Sujet': 1,
  'Vendu': 2,
  'Actif': 3
};

const sortByStatus = (a: any, b: any) => {
  const priorityA = STATUS_PRIORITY[a.status] || 99;
  const priorityB = STATUS_PRIORITY[b.status] || 99;
  return priorityA - priorityB;
};

export default function PropertySelector({ selectedPropertyId, onSelect }: PropertySelectorProps) {
  const t = useTranslations('evaluations.propertySelector');
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    let result = [...properties];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((prop) => prop.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (prop) =>
          prop.adresse?.toLowerCase().includes(query) ||
          prop.ville?.toLowerCase().includes(query) ||
          prop.code_postal?.toLowerCase().includes(query) ||
          prop.status?.toLowerCase().includes(query) ||
          prop.source?.toLowerCase().includes(query)
      );
    }

    // Sort by status priority
    result.sort(sortByStatus);

    setFilteredProperties(result);
  }, [searchQuery, statusFilter, properties]);

  const loadProperties = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('properties')
        .select('id, adresse, ville, code_postal, type_propriete, superficie_habitable_pi2, superficie_terrain_pi2, annee_construction, status, source')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return null;
    return new Intl.NumberFormat('fr-CA').format(num);
  };

  const getStatusLabel = (status: string) => {
    const statusKey = status?.toLowerCase();
    if (statusKey === 'sujet') return t('status.sujet');
    if (statusKey === 'vendu') return t('status.vendu');
    if (statusKey === 'actif') return t('status.actif');
    return status;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (properties.length === 0) {
    return (
      <Card sx={{
        bgcolor: 'transparent',
        border: '2px dashed',
        borderColor: 'primary.main',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Home sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h6" color="text.primary" gutterBottom>
            {t('noProperties')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('noPropertiesDescription')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            <strong>{t('alternative')}:</strong> {t('useManualEntry')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Search and Filter with gradient background */}
      <Box sx={{
        p: 2,
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }
            }}
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'primary.main' }} />
                </InputAdornment>
              )
            }}
          />
          <FormControl sx={{ minWidth: 140 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              displayEmpty
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: statusFilter !== 'all' ? 'primary.main' : undefined
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }}
              startAdornment={
                <FilterList sx={{ color: statusFilter !== 'all' ? 'primary.main' : 'text.secondary', mr: 0.5, fontSize: 20 }} />
              }
            >
              <MenuItem value="all">{t('filter.all')}</MenuItem>
              <MenuItem value="sujet">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7c3aed' }} />
                  {t('status.sujet')}
                </Box>
              </MenuItem>
              <MenuItem value="vendu">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#059669' }} />
                  {t('status.vendu')}
                </Box>
              </MenuItem>
              <MenuItem value="actif">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563eb' }} />
                  {t('status.actif')}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Properties Grid */}
      <Box sx={{ maxHeight: '450px', overflow: 'auto', pr: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredProperties.map((property) => {
            const isSelected = selectedPropertyId === property.id;
            const statusConfig = getStatusConfig(property.status);
            const sourceColors = getSourceColor(property.source);

            return (
              <Card
                key={property.id}
                onClick={() => onSelect(property.id, property)}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  bgcolor: isSelected ? alpha('#2563eb', 0.04) : 'background.paper',
                  boxShadow: isSelected ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: isSelected ? 'primary.main' : 'primary.light',
                    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.12)',
                    transform: 'translateY(-1px)'
                  },
                  '&::before': isSelected ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    background: 'linear-gradient(180deg, #2563eb 0%, #7c3aed 100%)'
                  } : {}
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Left: Status indicator with icon */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 60
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: statusConfig.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.3)}`,
                        mb: 0.5
                      }}>
                        {isSelected ? (
                          <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
                        ) : (
                          <Home sx={{ fontSize: 24, color: 'white' }} />
                        )}
                      </Box>
                      {property.status && (
                        <Chip
                          label={getStatusLabel(property.status)}
                          size="small"
                          sx={{
                            fontSize: '10px',
                            height: 20,
                            fontWeight: 600,
                            bgcolor: statusConfig.bgColor,
                            color: statusConfig.color,
                            border: `1px solid ${alpha(statusConfig.color, 0.3)}`
                          }}
                        />
                      )}
                    </Box>

                    {/* Middle: Property details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Address */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: isSelected ? 'primary.main' : 'text.primary',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {property.adresse || t('noAddressSpecified')}
                      </Typography>

                      {/* City */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {property.ville}
                          {property.code_postal && `, ${property.code_postal}`}
                        </Typography>
                      </Box>

                      {/* Stats row */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {/* Living area */}
                        {property.superficie_habitable_pi2 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SquareFoot sx={{ fontSize: 16, color: '#2563eb' }} />
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {formatNumber(property.superficie_habitable_pi2)} {t('units.sqft')}
                            </Typography>
                          </Box>
                        )}

                        {/* Land area */}
                        {property.superficie_terrain_pi2 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Landscape sx={{ fontSize: 16, color: '#059669' }} />
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {formatNumber(property.superficie_terrain_pi2)} {t('units.sqft')}
                            </Typography>
                          </Box>
                        )}

                        {/* Year built */}
                        {property.annee_construction && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, color: '#7c3aed' }} />
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {property.annee_construction}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Right: Type & Source badges */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 0.5,
                      minWidth: 100
                    }}>
                      {property.type_propriete && (
                        <Chip
                          label={property.type_propriete}
                          size="small"
                          sx={{
                            fontSize: '11px',
                            height: 24,
                            fontWeight: 500,
                            bgcolor: isSelected ? 'primary.main' : 'grey.100',
                            color: isSelected ? 'white' : 'text.primary'
                          }}
                        />
                      )}
                      {property.source && (
                        <Chip
                          label={property.source}
                          size="small"
                          sx={{
                            fontSize: '10px',
                            height: 20,
                            fontWeight: 500,
                            bgcolor: sourceColors.bgColor,
                            color: sourceColors.color,
                            border: `1px solid ${alpha(sourceColors.color, 0.3)}`
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {filteredProperties.length === 0 && searchQuery && (
        <Box sx={{
          textAlign: 'center',
          py: 4,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(124, 58, 237, 0.03) 100%)',
          borderRadius: 2,
          mt: 2
        }}>
          <Search sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {t('noResults', { query: searchQuery })}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
