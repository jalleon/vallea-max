'use client';

import React, { useState, useRef } from 'react';
import {
  TextField,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import { History, Delete, Save } from '@mui/icons-material';
import { TextFieldProps } from '@mui/material/TextField';

interface TextFieldWithHistoryProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  savedVariations?: { name: string; data: any }[];
  fieldKey: string;
  onDeleteVariation?: (variationName: string) => void;
  onSaveVariation?: (variationName: string, allFieldsData: any) => void;
  getAllFieldsData?: () => any;
  groupLabel?: string;
}

export default function TextFieldWithHistory({
  value,
  onChange,
  savedVariations = [],
  fieldKey,
  onDeleteVariation,
  onSaveVariation,
  getAllFieldsData,
  groupLabel = 'Current Values',
  ...textFieldProps
}: TextFieldWithHistoryProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectVariation = (variationData: any) => {
    const fieldValue = variationData[fieldKey];
    if (fieldValue !== undefined && fieldValue !== null) {
      onChange(fieldValue);
    }
    handleClose();
  };

  const handleDeleteClick = (event: React.MouseEvent, variationName: string) => {
    event.stopPropagation();
    if (onDeleteVariation) {
      onDeleteVariation(variationName);
    }
  };

  const handleSaveClick = () => {
    if (onSaveVariation && getAllFieldsData) {
      const allData = getAllFieldsData();
      // Use the current field value as the variation name
      const variationName = value.trim();
      if (variationName) {
        onSaveVariation(variationName, allData);
        handleClose();
      }
    }
  };

  const open = Boolean(anchorEl);
  const hasData = getAllFieldsData && Object.values(getAllFieldsData()).some(val => val && val !== '');

  return (
    <Box>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputRef={inputRef}
        onDoubleClick={handleDoubleClick}
        InputProps={{
          ...textFieldProps.InputProps,
          endAdornment: (savedVariations.length > 0 || hasData) ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: 0.5,
                '&:hover': { opacity: 1 }
              }}
            >
              <History sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              {savedVariations.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                  {savedVariations.length}
                </Typography>
              )}
            </Box>
          ) : textFieldProps.InputProps?.endAdornment
        }}
        helperText={
          savedVariations.length > 0 || hasData
            ? `Double-click to ${savedVariations.length > 0 ? `load saved (${savedVariations.length}) or ` : ''}save current values`
            : textFieldProps.helperText
        }
        {...textFieldProps}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: anchorEl?.offsetWidth || 300,
              maxWidth: 500,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }
          }
        }}
      >
        <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '12px' }}>
            {savedVariations.length > 0 ? 'Load or Save' : 'Save'} {groupLabel}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '10px', opacity: 0.9 }}>
            {savedVariations.length > 0 ? 'Click to load saved, or save current' : 'Save current values as a new variation'}
          </Typography>
        </Box>

        {hasData && onSaveVariation && (
          <Box sx={{ p: 2, bgcolor: 'success.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<Save />}
              onClick={handleSaveClick}
              sx={{
                textTransform: 'none',
                fontSize: '12px',
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' }
              }}
            >
              Save Current Values
            </Button>
          </Box>
        )}

        {savedVariations.length > 0 && (
          <Box>
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5, bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase' }}>
                Saved Variations
              </Typography>
            </Box>
            <List sx={{ py: 0, maxHeight: 300, overflow: 'auto' }}>
              {savedVariations.map((variation, index) => {
                const fieldValue = variation.data[fieldKey];

                if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                  return null;
                }

                return (
                  <Box key={index}>
                    {index > 0 && <Divider />}
                    <ListItem
                      disablePadding
                      secondaryAction={
                        onDeleteVariation ? (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => handleDeleteClick(e, variation.name)}
                            sx={{
                              opacity: 0.5,
                              '&:hover': { opacity: 1, color: 'error.main' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        ) : null
                      }
                    >
                      <ListItemButton
                        onClick={() => handleSelectVariation(variation.data)}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'primary.lighter'
                          }
                        }}
                      >
                        <ListItemText
                          primary={fieldValue}
                          primaryTypographyProps={{
                            variant: 'subtitle2',
                            sx: { fontWeight: 600, fontSize: '12px', color: 'primary.main' }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Box>
                );
              })}

              {savedVariations.filter(v => v.data[fieldKey]).length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '11px' }}>
                    No saved values for this field
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        )}

        {savedVariations.length === 0 && !hasData && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '11px' }}>
              Fill in the form fields, then double-click to save
            </Typography>
          </Box>
        )}
      </Popover>
    </Box>
  );
}
