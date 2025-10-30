'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Language,
  PictureAsPdf,
  CheckCircle,
} from '@mui/icons-material';
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout';
import { DocumentType, ImportSession } from '@/features/import/types/import.types';
import { importService } from '@/features/import/_api/import.service';
import { DOCUMENT_TYPES, MAX_FILE_SIZE } from '@/features/import/constants/import.constants';

function ImportPageContent() {
  const t = useTranslations('import');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [session, setSession] = useState<ImportSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    t('steps.source'),
    t('steps.upload'),
    t('steps.review'),
    t('steps.confirmation'),
  ];

  // Handle PDF file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      setError(t('errors.fileTooBig'));
      return;
    }

    if (file.type !== 'application/pdf') {
      setError(t('errors.invalidType'));
      return;
    }

    setSelectedFile(file);
  };

  // Process the PDF
  const handleProcessPDF = async () => {
    if (!selectedFile || !documentType) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await importService.processPDF(selectedFile, documentType);
      setSession(result);
      setActiveStep(2); // Move to review step
    } catch (err) {
      setError(t('errors.extractionFailed'));
      console.error('Import error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Create property from session
  const handleCreateProperty = async () => {
    if (!session) return;

    setProcessing(true);
    setError(null);

    try {
      const propertyId = await importService.createPropertyFromImport(session);
      setActiveStep(3); // Move to success step

      // Redirect to library list after a short delay
      setTimeout(() => {
        router.push('/library');
      }, 2000);
    } catch (err) {
      setError(t('errors.extractionFailed'));
      console.error('Create property error:', err);
      setProcessing(false);
    }
  };

  // Step 1: Source Selection
  const renderSourceSelection = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        {t('source.title')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            onClick={() => {
              setActiveStep(1);
            }}
            sx={{
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
              height: '100%',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <PictureAsPdf sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {t('source.pdf.title')}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('source.pdf.description')}
              </Typography>

              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5 }}
              >
                {t('source.pdf.button')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              opacity: 0.6,
              height: '100%',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Language sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {t('source.browser.title')}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('source.browser.description')}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<Language />}
                fullWidth
                disabled
                sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5 }}
              >
                {t('source.browser.button')}
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('source.browser.requirement')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Step 2: Upload & Document Type
  const renderUpload = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        {t('upload.title')}
      </Typography>

      {/* Document Type Selection */}
      <Card sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {t('upload.documentType.title')}
          </Typography>
          <Grid container spacing={2}>
            {(Object.keys(DOCUMENT_TYPES) as DocumentType[]).map((type) => (
              <Grid item xs={12} md={4} key={type}>
                <Button
                  variant={documentType === type ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => setDocumentType(type)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    py: 1.5,
                  }}
                >
                  {t(`upload.documentType.${type}`)}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Paper
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: selectedFile ? 'success.main' : 'primary.main',
          borderRadius: '16px',
          p: 4,
          textAlign: 'center',
          mb: 3,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <CloudUpload sx={{ fontSize: 64, color: selectedFile ? 'success.main' : 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          {selectedFile ? selectedFile.name : t('upload.dropzone.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('upload.dropzone.subtitle')}
        </Typography>
        {!selectedFile && (
          <Button variant="contained" sx={{ borderRadius: '12px', textTransform: 'none' }}>
            {t('upload.dropzone.button')}
          </Button>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(0)}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          {tCommon('back')}
        </Button>
        <Button
          variant="contained"
          onClick={handleProcessPDF}
          disabled={!selectedFile || !documentType || processing}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          {processing ? <CircularProgress size={24} /> : tCommon('next')}
        </Button>
      </Box>
    </Box>
  );

  // Step 3: Review (simplified - just show stats and create button)
  const renderReview = () => {
    if (!session) return null;

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {t('review.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('review.subtitle')}
        </Typography>

        {session.averageConfidence && (
          <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: '12px', mb: 3 }}>
            <Typography variant="subtitle2">
              {t('review.confidence', { percent: session.averageConfidence })}
            </Typography>
            <Typography variant="caption">
              {t('review.fieldsExtracted', { count: session.fieldsExtracted || 0 })}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setActiveStep(0);
              setSession(null);
              setSelectedFile(null);
              setDocumentType(null);
            }}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
            disabled={processing}
          >
            {t('review.actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProperty}
            disabled={processing}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            {processing ? <CircularProgress size={24} /> : t('review.actions.create')}
          </Button>
        </Box>
      </Box>
    );
  };

  // Step 4: Success
  const renderSuccess = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}
      >
        <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
      </Box>

      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        {t('success.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {tCommon('redirecting')}
      </Typography>

      <LinearProgress sx={{ borderRadius: '4px' }} />
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderSourceSelection();
      case 1:
        return renderUpload();
      case 2:
        return renderReview();
      case 3:
        return renderSuccess();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px', minHeight: 400 }}>
        {getStepContent(activeStep)}
      </Card>
    </Box>
  );
}

export default function ImportPage() {
  return (
    <MaterialDashboardLayout>
      <ImportPageContent />
    </MaterialDashboardLayout>
  );
}
