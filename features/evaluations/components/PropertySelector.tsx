'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { Search, Home, LocationOn, CheckCircle } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

interface PropertySelectorProps {
  selectedPropertyId: string | null;
  onSelect: (propertyId: string, propertyData: any) => void;
}

export default function PropertySelector({ selectedPropertyId, onSelect }: PropertySelectorProps) {
  const t = useTranslations('evaluations.propertySelector');
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = properties.filter(
        (prop) =>
          prop.adresse?.toLowerCase().includes(query) ||
          prop.ville?.toLowerCase().includes(query) ||
          prop.code_postal?.toLowerCase().includes(query)
      );
      setFilteredProperties(filtered);
    }
  }, [searchQuery, properties]);

  const loadProperties = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('properties')
        .select('id, adresse, ville, code_postal, type_propriete, superficie_habitable_pi2, annee_construction')
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (properties.length === 0) {
    return (
      <Card sx={{ bgcolor: 'info.lighter', border: '2px dashed', borderColor: 'info.main' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Home sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
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
      {/* Search */}
      <TextField
        fullWidth
        placeholder={t('searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        }}
      />

      {/* Properties Grid */}
      <Box sx={{ maxHeight: '400px', overflow: 'auto', pr: 1 }}>
        <Grid container spacing={2}>
          {filteredProperties.map((property) => {
            const isSelected = selectedPropertyId === property.id;

            return (
              <Grid item xs={12} key={property.id}>
                <Card
                  onClick={() => onSelect(property.id, property)}
                  sx={{
                    cursor: 'pointer',
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'primary.light' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: isSelected ? 'primary.main' : 'grey.200',
                          width: 48,
                          height: 48
                        }}
                      >
                        {isSelected ? <CheckCircle /> : <Home />}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 500 }}>
                          {property.adresse}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LocationOn fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {property.ville}
                            {property.code_postal && `, ${property.code_postal}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {property.type_propriete && (
                            <Chip
                              label={property.type_propriete}
                              size="small"
                              variant={isSelected ? 'filled' : 'outlined'}
                              color={isSelected ? 'primary' : 'default'}
                            />
                          )}
                          {property.superficie_habitable_pi2 && (
                            <Chip
                              label={`${property.superficie_habitable_pi2} pi²`}
                              size="small"
                              variant={isSelected ? 'filled' : 'outlined'}
                              color={isSelected ? 'primary' : 'default'}
                            />
                          )}
                          {property.annee_construction && (
                            <Chip
                              label={`Année: ${property.annee_construction}`}
                              size="small"
                              variant={isSelected ? 'filled' : 'outlined'}
                              color={isSelected ? 'primary' : 'default'}
                            />
                          )}
                        </Box>
                      </Box>

                      <Radio checked={isSelected} sx={{ mt: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {filteredProperties.length === 0 && searchQuery && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {t('noResults', { query: searchQuery })}
          </Typography>
        </Box>
      )}
    </Box>
  );
}