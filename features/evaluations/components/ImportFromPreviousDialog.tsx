'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, Upload, Close } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface PreviousAppraisal {
  id: string;
  address: string;
  city: string;
  created_at: string;
  template_type: string;
  form_data: any;
}

interface ImportFromPreviousDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (selectedData: any) => void;
  currentSectionId: string;
}

/**
 * Dialog for importing data from previous appraisal reports
 * Allows users to:
 * - Search and select a previous report
 * - Choose which fields to import
 * - Preview before importing
 */
export default function ImportFromPreviousDialog({
  open,
  onClose,
  onImport,
  currentSectionId
}: ImportFromPreviousDialogProps) {
  const [loading, setLoading] = useState(false);
  const [previousReports, setPreviousReports] = useState<PreviousAppraisal[]>([]);
  const [selectedReport, setSelectedReport] = useState<PreviousAppraisal | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      loadPreviousReports();
    }
  }, [open]);

  const loadPreviousReports = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('appraisals')
        .select('id, address, city, created_at, template_type, form_data')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading previous reports:', error);
        return;
      }

      setPreviousReports(data as PreviousAppraisal[]);
    } catch (error) {
      console.error('Error loading previous reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (report: PreviousAppraisal) => {
    setSelectedReport(report);

    // Auto-select all available fields from the current section
    if (report.form_data && report.form_data[currentSectionId]) {
      const sectionData = report.form_data[currentSectionId];
      const fields = Object.keys(sectionData);
      setSelectedFields(fields);
    }
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleImport = () => {
    if (!selectedReport || selectedFields.length === 0) return;

    const sectionData = selectedReport.form_data[currentSectionId] || {};
    const importedData: any = {};

    selectedFields.forEach((field) => {
      if (sectionData[field] !== undefined) {
        importedData[field] = sectionData[field];
      }
    });

    onImport(importedData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReport(null);
    setSelectedFields([]);
    setSearchQuery('');
    onClose();
  };

  const filteredReports = previousReports.filter((report) =>
    report.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableFields = selectedReport?.form_data?.[currentSectionId]
    ? Object.keys(selectedReport.form_data[currentSectionId])
    : [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Import from Previous Report
          </Typography>
          <Button
            size="small"
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, height: '400px' }}>
            {/* Left Panel: Report List */}
            <Box sx={{ flex: 1, borderRight: '1px solid', borderColor: 'divider', pr: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by address or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {filteredReports.length} previous reports found
              </Typography>

              <List sx={{ overflow: 'auto', maxHeight: '320px' }}>
                {filteredReports.map((report) => (
                  <ListItem key={report.id} disablePadding>
                    <ListItemButton
                      selected={selectedReport?.id === report.id}
                      onClick={() => handleReportSelect(report)}
                      sx={{
                        borderRadius: '8px',
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light'
                          }
                        }
                      }}
                    >
                      <ListItemText
                        primary={report.address}
                        secondary={
                          <Box>
                            <Typography variant="caption" component="div">
                              {report.city}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(report.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Right Panel: Field Selection */}
            <Box sx={{ flex: 1 }}>
              {selectedReport ? (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Select fields to import:
                  </Typography>

                  {availableFields.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                      No data available for this section in the selected report.
                    </Alert>
                  ) : (
                    <Box sx={{ overflow: 'auto', maxHeight: '340px' }}>
                      <List>
                        {availableFields.map((field) => (
                          <ListItem key={field} disablePadding>
                            <ListItemButton
                              onClick={() => handleFieldToggle(field)}
                              sx={{ borderRadius: '8px', mb: 0.5 }}
                            >
                              <Checkbox
                                checked={selectedFields.includes(field)}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      maxWidth: '250px'
                                    }}
                                  >
                                    {String(selectedReport.form_data[currentSectionId][field]).substring(0, 50)}...
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                  }}
                >
                  <Upload sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography variant="body2" align="center">
                    Select a previous report to view available fields
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {selectedReport && (
          <Chip
            label={`${selectedFields.length} field(s) selected`}
            size="small"
            color="primary"
            sx={{ mr: 'auto' }}
          />
        )}
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedReport || selectedFields.length === 0}
          sx={{ textTransform: 'none' }}
        >
          Import Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
}
