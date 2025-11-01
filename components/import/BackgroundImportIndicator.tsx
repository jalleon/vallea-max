'use client';

import { Box, LinearProgress, Typography, IconButton, Chip } from '@mui/material';
import { Close, CloudUpload, CheckCircle } from '@mui/icons-material';
import { useBackgroundImport } from '@/contexts/BackgroundImportContext';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function BackgroundImportIndicator() {
  const { state, cancelImport, clearState } = useBackgroundImport();
  const locale = useLocale();
  const router = useRouter();

  // Don't show if not processing
  if (!state.isProcessing && state.processedFiles === 0) {
    return null;
  }

  const progress = state.totalFiles > 0
    ? (state.processedFiles / state.totalFiles) * 100
    : 0;

  const isComplete = state.processedFiles === state.totalFiles && state.totalFiles > 0;

  const handleClick = () => {
    if (state.targetPropertyId && isComplete) {
      // Navigate to library page (property detail page doesn't exist yet)
      // TODO: When property detail page is created, navigate to /{locale}/library/{propertyId}
      router.push(`/${locale}/library`);
      clearState();
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 0.5,
        borderRadius: '24px',
        background: isComplete
          ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        maxWidth: { xs: '200px', sm: '300px', md: '400px' },
        cursor: isComplete && state.targetPropertyId ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': isComplete && state.targetPropertyId ? {
          transform: 'scale(1.02)',
        } : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        {isComplete ? (
          <CheckCircle sx={{ fontSize: 20, flexShrink: 0 }} />
        ) : (
          <CloudUpload sx={{ fontSize: 20, flexShrink: 0 }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isComplete
              ? (locale === 'fr' ? 'Import terminé! Cliquez pour voir' : 'Import Complete! Click to view')
              : (locale === 'fr' ? 'Import en cours...' : 'Importing...')}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.9,
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block'
            }}
          >
            {state.processedFiles} / {state.totalFiles} {locale === 'fr' ? 'fichiers' : 'files'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: 60, flexShrink: 0 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            borderRadius: '4px',
            height: 4,
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white',
            },
          }}
        />
      </Box>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation(); // Prevent click from bubbling to parent Box
          if (state.isProcessing) {
            if (confirm(locale === 'fr' ? 'Annuler l\'import en cours?' : 'Cancel ongoing import?')) {
              cancelImport();
            }
          } else {
            clearState();
          }
        }}
        sx={{ color: 'white', p: 0.5, flexShrink: 0 }}
      >
        <Close sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
