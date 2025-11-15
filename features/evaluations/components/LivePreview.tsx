'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Refresh,
  ZoomIn,
  ZoomOut,
  FitScreen,
  Download
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { TemplateType } from '../types/evaluation.types';
import { AppraisalDocumentService } from '../services/appraisal-document.service';

interface LivePreviewProps {
  appraisalData: any;
  sectionsData: any;
  templateType: TemplateType;
  currentSectionId?: string;
}

export default function LivePreview({
  appraisalData,
  sectionsData,
  templateType,
  currentSectionId
}: LivePreviewProps) {
  const t = useTranslations('evaluations.preview');
  const tSections = useTranslations('evaluations.sections');
  const [zoom, setZoom] = useState<'fit' | '100' | '125' | '150'>('fit');
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle export to Word
  const handleExportToWord = async () => {
    try {
      await AppraisalDocumentService.exportToWord({
        templateType,
        sections: sectionsData,
        appraisalData
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export document. Please try again.');
    }
  };

  // Generate HTML preview from sections data using professional document service
  const previewHTML = useMemo(() => {
    if (!appraisalData || !sectionsData) {
      return '<div style="padding: 20px; text-align: center; color: #999;">No data to preview</div>';
    }

    // Use the professional HTML preview generator
    return AppraisalDocumentService.generateHTMLPreview({
      templateType,
      sections: sectionsData,
      appraisalData
    });
  }, [appraisalData, sectionsData, templateType, currentSectionId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getZoomStyle = () => {
    switch (zoom) {
      case '100':
        return { transform: 'scale(1)', transformOrigin: 'top center' };
      case '125':
        return { transform: 'scale(1.25)', transformOrigin: 'top center' };
      case '150':
        return { transform: 'scale(1.5)', transformOrigin: 'top center' };
      case 'fit':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
            Live Preview
          </Typography>
          <Tooltip title="Refresh preview">
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Zoom Controls */}
        <ToggleButtonGroup
          value={zoom}
          exclusive
          onChange={(e, newZoom) => newZoom && setZoom(newZoom)}
          size="small"
          fullWidth
        >
          <ToggleButton value="fit" sx={{ fontSize: '11px', py: 0.5 }}>
            <FitScreen sx={{ fontSize: 16, mr: 0.5 }} />
            Fit
          </ToggleButton>
          <ToggleButton value="100" sx={{ fontSize: '11px', py: 0.5 }}>
            100%
          </ToggleButton>
          <ToggleButton value="125" sx={{ fontSize: '11px', py: 0.5 }}>
            125%
          </ToggleButton>
          <ToggleButton value="150" sx={{ fontSize: '11px', py: 0.5 }}>
            150%
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Export to Word Button */}
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<Download />}
          onClick={handleExportToWord}
          sx={{ mt: 2, textTransform: 'none', fontSize: '12px' }}
        >
          Export to Word
        </Button>
      </Box>

      {/* Preview Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: '#f5f5f5',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            minHeight: '100%',
            p: zoom === 'fit' ? 2 : 4,
            ...getZoomStyle()
          }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: '4px',
              minHeight: '100%'
            }}
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </Box>
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          p: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
          Auto-updates when you make changes
        </Typography>
      </Box>
    </Box>
  );
}

