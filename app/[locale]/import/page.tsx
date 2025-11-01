'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
  Chip,
  IconButton,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CloudUpload,
  Language,
  PictureAsPdf,
  CheckCircle,
  Settings as SettingsIcon,
  AutoAwesome,
  TextFields,
} from '@mui/icons-material';
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout';
import { DocumentType, ImportSession } from '@/features/import/types/import.types';
import { importService } from '@/features/import/_api/import.service';
import { DOCUMENT_TYPES, MAX_FILE_SIZE } from '@/features/import/constants/import.constants';
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service';
import { Property } from '@/features/library/types/property.types';
import { useSettings } from '@/contexts/SettingsContext';
import AiApiKeysDialog from '@/features/user-settings/components/AiApiKeysDialog';

function ImportPageContent() {
  const t = useTranslations('import');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { preferences } = useSettings();

  const [activeStep, setActiveStep] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  // Always use auto mode - provider priority is managed in Settings
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useTextInput, setUseTextInput] = useState(false); // Toggle between PDF and text input
  const [pastedText, setPastedText] = useState(''); // Store pasted text
  const [processing, setProcessing] = useState(false);
  const [session, setSession] = useState<ImportSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateProperty, setDuplicateProperty] = useState<Property | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [mergeAction, setMergeAction] = useState<'merge' | 'duplicate' | null>(null);
  const [showAiApiKeysDialog, setShowAiApiKeysDialog] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    t('steps.source'),
    t('steps.upload'),
    t('steps.review'),
    t('steps.confirmation'),
  ];

  // Get active provider based on priority
  const getActiveProvider = () => {
    const providerPriority = preferences?.providerPriority || ['deepseek', 'openai', 'anthropic'];
    return providerPriority.find(p => preferences?.aiApiKeys?.[p]) || 'deepseek';
  };

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      deepseek: 'DeepSeek',
      openai: 'OpenAI',
      anthropic: 'Anthropic'
    };
    return names[provider] || provider;
  };

  const getProviderModel = (provider: string) => {
    const models: Record<string, string> = {
      deepseek: preferences?.aiModels?.deepseek || 'deepseek-chat',
      openai: preferences?.aiModels?.openai || 'gpt-4o-mini',
      anthropic: preferences?.aiModels?.anthropic || 'claude-3-5-haiku-20241022'
    };
    return models[provider] || '';
  };

  const getPriorityText = () => {
    return locale === 'fr' ? '1ère' : '1st';
  };

  // Load all properties for merge selection
  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true);
      try {
        const props = await propertiesSupabaseService.getAll();
        setAllProperties(props);
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    loadProperties();
  }, []);

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

  // Process the PDF or text input
  const handleProcess = async () => {
    // Validate inputs
    if (!documentType) return;
    if (!useTextInput && !selectedFile) return;
    if (useTextInput && !pastedText.trim()) {
      setError(t('errors.noTextProvided'));
      return;
    }

    // Determine which provider to use based on user priority
    const providerPriority = preferences?.providerPriority || ['deepseek', 'openai', 'anthropic'];

    // Find first provider with an API key
    const availableProvider = providerPriority.find(p => preferences?.aiApiKeys?.[p]);
    const provider = availableProvider || 'deepseek'; // Fallback to deepseek if none configured

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
      // Process either text input or PDF file
      const result = useTextInput
        ? await importService.processText(pastedText, documentType, apiKey, provider, model)
        : await importService.processPDF(selectedFile!, documentType, apiKey, provider, model);

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

      {/* AI Provider Info - Compact */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
          py: 1,
          px: 2,
          borderRadius: '8px',
          bgcolor: 'action.hover'
        }}
      >
        <AutoAwesome sx={{ fontSize: '18px', color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {getProviderDisplayName(getActiveProvider())}
        </Typography>
        <Chip
          label={getProviderModel(getActiveProvider()).split('-').pop()?.toUpperCase() || 'CHAT'}
          size="small"
          color="primary"
          sx={{ height: 18, fontSize: '10px', fontWeight: 600 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {t('upload.aiProvider.priority', { priority: getPriorityText() })}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setShowAiApiKeysDialog(true)}
          sx={{ color: 'text.secondary', ml: 'auto' }}
        >
          <SettingsIcon sx={{ fontSize: '18px' }} />
        </IconButton>
      </Box>

      {/* Input Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={useTextInput ? 'text' : 'pdf'}
          exclusive
          onChange={(e, value) => {
            if (value !== null) {
              setUseTextInput(value === 'text');
              setError(null);
              setSelectedFile(null);
              setPastedText('');
            }
          }}
          sx={{ borderRadius: '12px' }}
        >
          <ToggleButton value="pdf" sx={{ px: 3, py: 1, textTransform: 'none', borderRadius: '12px 0 0 12px' }}>
            <PictureAsPdf sx={{ mr: 1, fontSize: 20 }} />
            PDF Upload
          </ToggleButton>
          <ToggleButton value="text" sx={{ px: 3, py: 1, textTransform: 'none', borderRadius: '0 12px 12px 0' }}>
            <TextFields sx={{ mr: 1, fontSize: 20 }} />
            Paste Text
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Conditional rendering: PDF Upload or Text Input */}
      {!useTextInput ? (
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
      ) : (
        <Card sx={{ borderRadius: '16px', mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {locale === 'fr' ? 'Coller le texte du document' : 'Paste document text'}
            </Typography>
            <Alert severity="info" sx={{ borderRadius: '8px', mb: 2 }}>
              <Typography variant="body2">
                {locale === 'fr'
                  ? 'Conseil : Ouvrez le PDF, sélectionnez tout le texte (Ctrl+A), copiez-le (Ctrl+C) et collez-le ici (Ctrl+V).'
                  : 'Tip: Open the PDF, select all text (Ctrl+A), copy it (Ctrl+C), and paste it here (Ctrl+V).'}
              </Typography>
            </Alert>
            <TextField
              multiline
              rows={12}
              fullWidth
              placeholder={locale === 'fr'
                ? 'Collez ici le texte copié du PDF...'
                : 'Paste copied text from PDF here...'}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {pastedText.length} {locale === 'fr' ? 'caractères' : 'characters'}
            </Typography>
          </CardContent>
        </Card>
      )}

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
          onClick={handleProcess}
          disabled={!documentType || processing || (!useTextInput && !selectedFile) || (useTextInput && !pastedText.trim())}
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

  // Handle manual property selection for merge
  const handleManualPropertySelect = (index: number, propertyId: string | null) => {
    if (!session || !session.properties) return;

    const updatedProperties = [...session.properties];
    const selectedProperty = propertyId ? allProperties.find(p => p.id === propertyId) : null;

    updatedProperties[index] = {
      ...updatedProperties[index],
      duplicateProperty: selectedProperty,
      action: selectedProperty ? 'merge' : 'create',
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

                {/* Property selector for manual merge */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>{locale === 'fr' ? 'Fusionner avec propriété existante' : 'Merge with existing property'}</InputLabel>
                  <Select
                    value={property.duplicateProperty?.id || ''}
                    onChange={(e) => handleManualPropertySelect(index, e.target.value || null)}
                    label={locale === 'fr' ? 'Fusionner avec propriété existante' : 'Merge with existing property'}
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="">
                      <em>{locale === 'fr' ? 'Aucune - Créer nouvelle' : 'None - Create new'}</em>
                    </MenuItem>
                    {allProperties.map((prop) => (
                      <MenuItem key={prop.id} value={prop.id}>
                        {prop.adresse} {prop.ville && `- ${prop.ville}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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

      {/* AI API Keys Dialog */}
      <AiApiKeysDialog
        open={showAiApiKeysDialog}
        onClose={() => setShowAiApiKeysDialog(false)}
      />
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
