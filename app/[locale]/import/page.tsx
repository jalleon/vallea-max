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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Language,
  PictureAsPdf,
  CheckCircle,
  Settings as SettingsIcon,
  AutoAwesome,
} from '@mui/icons-material';
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout';
import { DocumentType, ImportSession } from '@/features/import/types/import.types';
import { importService } from '@/features/import/_api/import.service';
import { DOCUMENT_TYPES, MAX_FILE_SIZE } from '@/features/import/constants/import.constants';
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service';
import { Property } from '@/features/library/types/property.types';
import { useSettings } from '@/contexts/SettingsContext';

function ImportPageContent() {
  const t = useTranslations('import');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { preferences } = useSettings();

  const [activeStep, setActiveStep] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'deepseek' | 'openai' | 'anthropic' | 'auto'>('auto');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [session, setSession] = useState<ImportSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateProperty, setDuplicateProperty] = useState<Property | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [mergeAction, setMergeAction] = useState<'merge' | 'duplicate' | null>(null);

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

    // Determine which provider to use
    let provider: 'deepseek' | 'openai' | 'anthropic';

    if (selectedProvider === 'auto') {
      // Auto mode: use provider priority order from user preferences
      const providerPriority = preferences?.providerPriority || ['deepseek', 'openai', 'anthropic'];

      // Find first provider with an API key
      const availableProvider = providerPriority.find(p => preferences?.aiApiKeys?.[p]);
      provider = availableProvider || 'deepseek'; // Fallback to deepseek if none configured
    } else {
      provider = selectedProvider;
    }

    // Check if the selected provider has an API key
    const apiKey = preferences?.aiApiKeys?.[provider];

    if (!apiKey) {
      setError(`Please configure your ${provider.toUpperCase()} API key in Settings (top right menu) before importing.`);
      return;
    }

    // Get the selected model for the provider
    const model = preferences?.aiModels?.[provider];

    setProcessing(true);
    setError(null);

    try {
      const result = await importService.processPDF(selectedFile, documentType, apiKey, provider, model);

      // Check for duplicates in all extracted properties
      if (result.properties && result.properties.length > 0) {
        const propertiesWithDuplicateCheck = await Promise.all(
          result.properties.map(async (propertyExtraction) => {
            if (propertyExtraction.extractedData.address) {
              const existingProperty = await propertiesSupabaseService.findByAddress(
                propertyExtraction.extractedData.address
              );
              return {
                ...propertyExtraction,
                duplicateProperty: existingProperty || undefined,
                action: existingProperty ? undefined : ('create' as const),
              };
            }
            return {
              ...propertyExtraction,
              action: 'create' as const,
            };
          })
        );

        result.properties = propertiesWithDuplicateCheck;
      }

      setSession(result);

      // If any duplicates found, show them in review step (user will decide for each)
      // Otherwise just proceed to review
      setActiveStep(2);
    } catch (err) {
      setError(t('errors.extractionFailed'));
      console.error('Import error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Create properties from session (supports batch import)
  const handleCreateProperty = async () => {
    if (!session) return;

    setProcessing(true);
    setError(null);

    try {
      // Use batch method for multiple properties
      if (session.properties && session.properties.length > 0) {
        await importService.createPropertiesFromImport(session);
      } else if (session.extractedData) {
        // Legacy single property support
        if (duplicateProperty && mergeAction === 'merge') {
          await importService.mergePropertyData(duplicateProperty.id, session);
        } else {
          await importService.createPropertyFromImport(session);
        }
      }

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

  // Handle duplicate dialog actions
  const handleDuplicateDialogMerge = () => {
    setShowDuplicateDialog(false);
    setMergeAction('merge');
    setActiveStep(2); // Move to review step
  };

  const handleDuplicateDialogDuplicate = () => {
    setShowDuplicateDialog(false);
    setMergeAction('duplicate');
    setActiveStep(2); // Move to review step
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

      {/* AI Provider Selection */}
      <Card sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
              AI Provider
            </Typography>
            <AutoAwesome fontSize="small" color="primary" />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant={selectedProvider === 'auto' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => setSelectedProvider('auto')}
                sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5 }}
              >
                Auto (Fastest)
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant={selectedProvider === 'deepseek' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => setSelectedProvider('deepseek')}
                disabled={!preferences?.aiApiKeys?.deepseek}
                sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5 }}
              >
                DeepSeek
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant={selectedProvider === 'openai' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => setSelectedProvider('openai')}
                disabled={!preferences?.aiApiKeys?.openai}
                sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5 }}
              >
                OpenAI
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant={selectedProvider === 'anthropic' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => setSelectedProvider('anthropic')}
                disabled={!preferences?.aiApiKeys?.anthropic}
                sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5 }}
              >
                Anthropic
              </Button>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {selectedProvider === 'auto'
              ? 'Will use the fastest available AI based on your configured keys (DeepSeek → OpenAI → Anthropic)'
              : `Using ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} AI for extraction`
            }
          </Typography>
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

  // Handle action change for a property in multi-property view
  const handlePropertyAction = (index: number, action: 'create' | 'merge' | 'skip') => {
    if (!session || !session.properties) return;

    const updatedProperties = [...session.properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      action,
    };

    setSession({
      ...session,
      properties: updatedProperties,
    });
  };

  // Step 3: Review (shows all properties with individual actions)
  const renderReview = () => {
    if (!session) return null;

    const properties = session.properties || [];
    const totalProperties = properties.length;
    const hasMultiple = totalProperties > 1;

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {hasMultiple
            ? t('review.titleMultiple', { count: totalProperties })
            : t('review.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {hasMultiple ? t('review.subtitleMultiple') : t('review.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* List of properties */}
        <Box sx={{ mb: 3, maxHeight: 400, overflowY: 'auto' }}>
          {properties.map((property, index) => (
            <Card key={index} sx={{ mb: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {property.extractedData.address || t('review.unknownAddress')}
                    </Typography>
                    {property.extractedData.city && (
                      <Typography variant="body2" color="text.secondary">
                        {property.extractedData.city}
                        {property.extractedData.municipality && ` (${property.extractedData.municipality})`}
                      </Typography>
                    )}
                    {property.extractedData.sellPrice && (
                      <Typography variant="body2" color="text.secondary">
                        ${property.extractedData.sellPrice.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {property.averageConfidence}% {t('review.confidence')}
                    </Typography>
                  </Box>
                </Box>

                {/* Duplicate warning and action buttons */}
                {property.duplicateProperty && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
                    <Typography variant="caption">
                      {t('review.duplicateFound', { address: property.duplicateProperty.adresse })}
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {property.duplicateProperty ? (
                    <>
                      <Button
                        size="small"
                        variant={property.action === 'merge' ? 'contained' : 'outlined'}
                        onClick={() => handlePropertyAction(index, 'merge')}
                        sx={{ borderRadius: '8px', textTransform: 'none', flex: 1 }}
                      >
                        {t('review.actions.merge')}
                      </Button>
                      <Button
                        size="small"
                        variant={property.action === 'create' ? 'contained' : 'outlined'}
                        onClick={() => handlePropertyAction(index, 'create')}
                        sx={{ borderRadius: '8px', textTransform: 'none', flex: 1 }}
                      >
                        {t('review.actions.createDuplicate')}
                      </Button>
                      <Button
                        size="small"
                        variant={property.action === 'skip' ? 'contained' : 'outlined'}
                        color="error"
                        onClick={() => handlePropertyAction(index, 'skip')}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                      >
                        {t('review.actions.skip')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      disabled
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      {t('review.actions.willCreate')}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

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
            {processing ? (
              <CircularProgress size={24} />
            ) : hasMultiple ? (
              t('review.actions.importAll', { count: properties.filter(p => p.action !== 'skip').length })
            ) : (
              t('review.actions.create')
            )}
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

      {/* Duplicate Address Dialog */}
      <Dialog
        open={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {t('duplicate.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('duplicate.message', { address: duplicateProperty?.adresse })}
          </DialogContentText>
          {duplicateProperty && (
            <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{t('duplicate.existingProperty')}:</strong>
              </Typography>
              <Typography variant="body2">
                {duplicateProperty.adresse}
              </Typography>
              {duplicateProperty.ville && (
                <Typography variant="body2" color="text.secondary">
                  {duplicateProperty.ville}
                  {duplicateProperty.municipalite && ` (${duplicateProperty.municipalite})`}
                </Typography>
              )}
              {duplicateProperty.prix_vente && (
                <Typography variant="body2" color="text.secondary">
                  {t('duplicate.salePrice')}: ${duplicateProperty.prix_vente.toLocaleString()}
                </Typography>
              )}
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowDuplicateDialog(false)}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleDuplicateDialogDuplicate}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            {t('duplicate.actions.createDuplicate')}
          </Button>
          <Button
            onClick={handleDuplicateDialogMerge}
            variant="contained"
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            {t('duplicate.actions.merge')}
          </Button>
        </DialogActions>
      </Dialog>
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
