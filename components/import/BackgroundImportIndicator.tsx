'use client';

import { Box, LinearProgress, Typography, Alert } from '@mui/material';
import { CloudUpload, CheckCircle, MergeType } from '@mui/icons-material';
import { useBackgroundImport } from '@/contexts/BackgroundImportContext';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function BackgroundImportIndicator() {
  const { state, cancelImport, clearState, clearProgressOnly } = useBackgroundImport();
  const locale = useLocale();
  const router = useRouter();

  const progress = state.totalFiles > 0
    ? (state.processedFiles / state.totalFiles) * 100
    : 0;

  const isComplete = state.processedFiles === state.totalFiles && state.totalFiles > 0;

  // Auto-close after 20 seconds when import is complete
  // Use clearProgressOnly to preserve pending session for step 3
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        clearProgressOnly();
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, clearProgressOnly]);

  // Don't show if not processing (AFTER all hooks)
  if (!state.isProcessing && state.processedFiles === 0) {
    return null;
  }

  const handleClick = () => {
    console.log('Click handler called:', {
      targetPropertyId: state.targetPropertyId,
      isComplete,
      isProcessing: state.isProcessing
    });

    if (state.targetPropertyId && isComplete) {
      // Navigate to library page (property detail page doesn't exist yet)
      // TODO: When property detail page is created, navigate to /{locale}/library/{propertyId}
      console.log('Navigating to library...');
      router.push(`/${locale}/library`);
      clearState();
    } else {
      console.log('Click ignored - conditions not met');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Progress indicator */}
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
              ? (locale === 'fr' ? 'Import terminé' : 'Import Complete')
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
          variant={state.isProcessing && state.totalFiles === 1 ? "indeterminate" : "determinate"}
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
    </Box>

      {/* Duplicate detection notification - positioned to the right */}
      {state.duplicateDetected && state.duplicateAddress && (
        <Alert
          severity="info"
          icon={<MergeType />}
          onClose={() => {
            // Clear duplicate notification
            clearState();
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.85rem',
            maxWidth: { xs: '250px', sm: '350px', md: '450px' },
          }}
        >
          {locale === 'fr'
            ? `Propriété existante détectée (${state.duplicateAddress}). Données fusionnées.`
            : `Existing property detected (${state.duplicateAddress}). Data merged.`}
        </Alert>
      )}
    </Box>
  );
}
