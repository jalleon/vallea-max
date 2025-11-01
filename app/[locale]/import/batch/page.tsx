'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  CheckCircle,
  PictureAsPdf,
  AutoAwesome,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { MaterialDashboardLayout } from '@/components/layout/MaterialDashboardLayout';
import { DocumentType, ImportSession } from '@/features/import/types/import.types';
import { importService } from '@/features/import/_api/import.service';
import { DOCUMENT_TYPES } from '@/features/import/constants/import.constants';
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service';
import { Property } from '@/features/library/types/property.types';
import { useSettings } from '@/contexts/SettingsContext';
import { useBackgroundImport } from '@/contexts/BackgroundImportContext';
import AiApiKeysDialog from '@/features/user-settings/components/AiApiKeysDialog';

interface BatchFile {
  file: File;
  documentType: DocumentType;
}

function BatchImportPageContent() {
  const t = useTranslations('import.batch');
  const tCommon = useTranslations('common');
  const tImport = useTranslations('import');
  const locale = useLocale();
  const router = useRouter();
  const { preferences } = useSettings();
  const { state: importState, startBatchImport } = useBackgroundImport();

  const [selectedFiles, setSelectedFiles] = useState<BatchFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState<'new' | 'existing'>('new');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [showAiApiKeysDialog, setShowAiApiKeysDialog] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [propertySearchText, setPropertySearchText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default document type order for auto-assignment
  const DEFAULT_TYPE_ORDER: DocumentType[] = ['role_foncier', 'role_taxe', 'zonage', 'certificat_localisation'];

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

  // Handle multiple file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError(null);

    // Auto-assign document types based on default order
    // Start index from current number of selected files to continue the pattern
    const startIndex = selectedFiles.length;
    const newBatchFiles: BatchFile[] = files.map((file, index) => ({
      file,
      documentType: DEFAULT_TYPE_ORDER[(startIndex + index) % DEFAULT_TYPE_ORDER.length],
    }));

    // Append new files to existing selection
    setSelectedFiles(prev => [...prev, ...newBatchFiles]);

    // Load properties for merge selection (only if not already loaded)
    if (allProperties.length === 0) {
      await loadProperties();
    }

    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  // Remove a file from the batch
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Change document type for a file
  const handleDocumentTypeChange = (index: number, newType: DocumentType) => {
    setSelectedFiles(prev =>
      prev.map((item, i) => (i === index ? { ...item, documentType: newType } : item))
    );
  };

  // Process all files sequentially in background
  const handleProcessBatch = async () => {
    if (selectedFiles.length === 0) return;
    if (mergeMode === 'existing' && !selectedProperty) {
      setError(locale === 'fr' ? 'Veuillez sélectionner une propriété existante' : 'Please select an existing property');
      return;
    }

    // Check for API key
    const providerPriority = preferences?.providerPriority || ['deepseek', 'openai', 'anthropic'];
    const availableProvider = providerPriority.find(p => preferences?.aiApiKeys?.[p]);
    const provider = availableProvider || 'deepseek';
    const apiKey = preferences?.aiApiKeys?.[provider];

    if (!apiKey) {
      setError(`Please configure your ${provider.toUpperCase()} API key in Settings (top right menu) before importing.`);
      return;
    }

    const model = preferences?.aiModels?.[provider];

    setError(null);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    try {
      // Start background import
      await startBatchImport(
        selectedFiles,
        mergeMode,
        selectedProperty?.id || null,
        apiKey,
        provider,
        model,
        locale
      );

      // Navigate to library immediately - import continues in background
      router.push(`/${locale}/library`);
    } catch (err) {
      // Show error if import couldn't start (e.g., another import is running)
      setError(err instanceof Error ? err.message : 'Failed to start import');
    }
  };

  // Render file upload area
  const renderFileUpload = () => (
    <Paper
      onClick={() => fileInputRef.current?.click()}
      sx={{
        border: '2px dashed',
        borderColor: selectedFiles.length > 0 ? 'success.main' : 'primary.main',
        borderRadius: '16px',
        p: 4,
        textAlign: 'center',
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
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <CloudUpload sx={{ fontSize: 64, color: selectedFiles.length > 0 ? 'success.main' : 'primary.main', mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        {selectedFiles.length > 0
          ? locale === 'fr'
            ? `${selectedFiles.length} fichier(s) sélectionné(s)`
            : `${selectedFiles.length} file(s) selected`
          : t('dropzone.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('dropzone.subtitle')}
      </Typography>
      <Button variant="contained" sx={{ borderRadius: '12px', textTransform: 'none' }}>
        {t('dropzone.button')}
      </Button>
    </Paper>
  );

  // Render file list with document type selectors
  const renderFileList = () => (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {t('fileList.title', { count: selectedFiles.length })}
      </Typography>
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {selectedFiles.map((item, index) => (
          <Card
            key={index}
            sx={{
              mb: 2,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: importState.completedFiles.includes(item.file.name) ? 'success.main' : 'divider',
              bgcolor: importState.currentFileIndex === index ? 'action.hover' : 'background.paper',
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PictureAsPdf sx={{ color: 'error.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>{locale === 'fr' ? 'Type' : 'Type'}</InputLabel>
                  <Select
                    value={item.documentType}
                    onChange={(e) => handleDocumentTypeChange(index, e.target.value as DocumentType)}
                    label={locale === 'fr' ? 'Type' : 'Type'}
                    disabled={importState.isProcessing}
                    sx={{ borderRadius: '8px' }}
                  >
                    {(Object.keys(DOCUMENT_TYPES) as DocumentType[]).map((type) => (
                      <MenuItem key={type} value={type}>
                        {tImport(`upload.documentType.${type}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {importState.completedFiles.includes(item.file.name) ? (
                  <CheckCircle sx={{ color: 'success.main' }} />
                ) : importState.currentFileIndex === index ? (
                  <CircularProgress size={24} />
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    disabled={importState.isProcessing}
                    sx={{ color: 'error.main' }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Render property selection
  const renderPropertySelection = () => (
    <Card sx={{ borderRadius: '16px', mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          {t('propertySelection.title')}
        </Typography>
        <RadioGroup
          value={mergeMode}
          onChange={(e) => setMergeMode(e.target.value as 'new' | 'existing')}
        >
          <FormControlLabel
            value="new"
            control={<Radio />}
            label={t('propertySelection.createNew')}
            disabled={importState.isProcessing}
          />
          <FormControlLabel
            value="existing"
            control={<Radio />}
            label={t('propertySelection.mergeExisting')}
            disabled={importState.isProcessing}
          />
        </RadioGroup>

        {mergeMode === 'existing' && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setPropertyDialogOpen(true)}
            disabled={importState.isProcessing}
            sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', justifyContent: 'flex-start', py: 1.5 }}
          >
            {selectedProperty
              ? `${locale === 'fr' ? 'Fusionner avec: ' : 'Merge with: '}${selectedProperty.adresse}`
              : t('propertySelection.searchPlaceholder')}
          </Button>
        )}

        <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
          <Typography variant="caption">
            {t('propertySelection.info')}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // Render processing view
  const renderProcessingView = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('processing.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('processing.current', {
          current: (importState.currentFileIndex || 0) + 1,
          total: selectedFiles.length,
        })}
      </Typography>
      {importState.currentFileIndex !== null && (
        <Typography variant="body2" sx={{ mb: 3 }}>
          {selectedFiles[importState.currentFileIndex]?.file.name}
        </Typography>
      )}
      <LinearProgress
        variant={importState.isProcessing && importState.currentFileIndex !== null ? "indeterminate" : "determinate"}
        value={(importState.completedFiles.length / selectedFiles.length) * 100}
        sx={{
          borderRadius: '4px',
          height: 8,
          mb: 3,
          bgcolor: 'rgba(25,118,210,0.15)',
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {importState.completedFiles.length} / {selectedFiles.length} {t('processing.completed')}
      </Typography>
    </Box>
  );

  // Render success view
  const renderSuccessView = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
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
      <Typography variant="body2" color="text.secondary">
        {tCommon('redirecting')}
      </Typography>
    </Box>
  );

  const isCompleted = importState.completedFiles.length === selectedFiles.length && selectedFiles.length > 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/import?step=1')}
          disabled={importState.isProcessing}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          {tCommon('back')}
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>
      </Box>

      {/* AI Provider Info */}
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
          {tImport('upload.aiProvider.priority', { priority: getPriorityText() })}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setShowAiApiKeysDialog(true)}
          sx={{ color: 'text.secondary', ml: 'auto' }}
        >
          <SettingsIcon sx={{ fontSize: '18px' }} />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {isCompleted && !importState.isProcessing ? (
            renderSuccessView()
          ) : importState.isProcessing ? (
            renderProcessingView()
          ) : (
            <>
              {renderFileUpload()}
              {selectedFiles.length > 0 && (
                <>
                  <Box sx={{ mt: 3 }}>{renderFileList()}</Box>
                  {renderPropertySelection()}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedFiles([])}
                      sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                      {tCommon('cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleProcessBatch}
                      disabled={selectedFiles.length === 0 || (mergeMode === 'existing' && !selectedProperty)}
                      sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                      {t('actions.startBatch')}
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Property Selector Dialog */}
      <Dialog
        open={propertyDialogOpen}
        onClose={() => {
          setPropertyDialogOpen(false);
          setPropertySearchText('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {locale === 'fr' ? 'Sélectionner une propriété' : 'Select Property'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={locale === 'fr' ? 'Rechercher par adresse...' : 'Search by address...'}
              value={propertySearchText}
              onChange={(e) => setPropertySearchText(e.target.value)}
              sx={{ borderRadius: '8px' }}
            />
          </Box>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {loadingProperties ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Option to not merge */}
                <Card
                  sx={{
                    mb: 1,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: !selectedProperty ? 'primary.main' : 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => {
                    setSelectedProperty(null);
                    setPropertyDialogOpen(false);
                    setPropertySearchText('');
                  }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {locale === 'fr' ? 'Aucune - Créer nouvelle propriété' : 'None - Create new property'}
                    </Typography>
                  </CardContent>
                </Card>

                {/* List of existing properties */}
                {allProperties
                  .filter(prop =>
                    !propertySearchText ||
                    prop.adresse?.toLowerCase().includes(propertySearchText.toLowerCase()) ||
                    prop.ville?.toLowerCase().includes(propertySearchText.toLowerCase())
                  )
                  .sort((a, b) => (a.adresse || '').localeCompare(b.adresse || ''))
                  .map((prop) => (
                    <Card
                      key={prop.id}
                      sx={{
                        mb: 1,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selectedProperty?.id === prop.id ? 'primary.main' : 'divider',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => {
                        setSelectedProperty(prop);
                        setPropertyDialogOpen(false);
                        setPropertySearchText('');
                      }}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {prop.adresse}
                        </Typography>
                        {prop.ville && (
                          <Typography variant="caption" color="text.secondary">
                            {prop.ville}{prop.municipalite && ` - ${prop.municipalite}`}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPropertyDialogOpen(false);
              setPropertySearchText('');
            }}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      <AiApiKeysDialog
        open={showAiApiKeysDialog}
        onClose={() => setShowAiApiKeysDialog(false)}
      />
    </Box>
  );
}

export default function BatchImportPage() {
  return (
    <MaterialDashboardLayout>
      <BatchImportPageContent />
    </MaterialDashboardLayout>
  );
}
