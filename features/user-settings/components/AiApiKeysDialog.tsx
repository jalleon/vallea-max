'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Key,
  Info,
  Star,
  EmojiEvents,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { Switch, FormControlLabel } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/contexts/SettingsContext';
import { AI_MODELS, AI_MODELS_BY_PROVIDER, DEFAULT_MODELS, API_KEY_LINKS } from '../constants/ai-models.constants';
import { settingsService } from '../_api/settings.service';

interface AiApiKeysDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AiApiKeysDialog({ open, onClose }: AiApiKeysDialogProps) {
  const t = useTranslations('settings.aiApiKeys');
  const tCommon = useTranslations('common');
  const { preferences, updateAiApiKeys } = useSettings();

  // Secret code protection
  const [secretCodeUnlocked, setSecretCodeUnlocked] = useState(false);
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [secretCodeError, setSecretCodeError] = useState(false);
  const SECRET_CODE = process.env.NEXT_PUBLIC_API_KEY_SECRET || 'valea2025'; // Default secret

  const [deepseekKey, setDeepseekKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');

  const [deepseekModel, setDeepseekModel] = useState(DEFAULT_MODELS.deepseek);
  const [openaiModel, setOpenaiModel] = useState(DEFAULT_MODELS.openai);
  const [anthropicModel, setAnthropicModel] = useState(DEFAULT_MODELS.anthropic);

  const [showKeys, setShowKeys] = useState({
    deepseek: false,
    openai: false,
    anthropic: false,
  });

  const [infoDialog, setInfoDialog] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [providerPriority, setProviderPriority] = useState<('deepseek' | 'openai' | 'anthropic')[]>(['deepseek', 'openai', 'anthropic']);
  const [useOwnApiKeys, setUseOwnApiKeys] = useState(false);

  useEffect(() => {
    if (preferences?.aiApiKeys) {
      setDeepseekKey(preferences.aiApiKeys.deepseek || '');
      setOpenaiKey(preferences.aiApiKeys.openai || '');
      setAnthropicKey(preferences.aiApiKeys.anthropic || '');
    }
    if (preferences?.aiModels) {
      setDeepseekModel(preferences.aiModels.deepseek || DEFAULT_MODELS.deepseek);
      setOpenaiModel(preferences.aiModels.openai || DEFAULT_MODELS.openai);
      setAnthropicModel(preferences.aiModels.anthropic || DEFAULT_MODELS.anthropic);
    }
    if (preferences?.providerPriority) {
      setProviderPriority(preferences.providerPriority);
    }
  }, [preferences]);

  // Load can_use_own_api_keys state when dialog opens
  useEffect(() => {
    if (open && secretCodeUnlocked) {
      settingsService.canUseOwnApiKeys().then(setUseOwnApiKeys);
    }
  }, [open, secretCodeUnlocked]);

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);

    try {
      console.log('Attempting to save AI API keys...');

      // Save API keys and models
      const success = await updateAiApiKeys(
        {
          deepseek: deepseekKey || null,
          openai: openaiKey || null,
          anthropic: anthropicKey || null,
        },
        {
          deepseek: deepseekModel,
          openai: openaiModel,
          anthropic: anthropicModel,
        },
        providerPriority
      );

      // Save toggle state
      const toggleSuccess = await settingsService.toggleOwnApiKeys(useOwnApiKeys);

      setSaving(false);

      if (success && toggleSuccess) {
        console.log('AI API keys and toggle saved successfully');
        setAlert({ type: 'success', message: t('saved') });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        console.error('Failed to save AI API keys - service returned false');
        setAlert({ type: 'error', message: t('error') });
      }
    } catch (error) {
      console.error('Error saving AI API keys:', error);
      setSaving(false);
      setAlert({ type: 'error', message: `${t('error')}: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleSecretCodeSubmit = () => {
    if (secretCodeInput === SECRET_CODE) {
      setSecretCodeUnlocked(true);
      setSecretCodeError(false);
      setSecretCodeInput('');
    } else {
      setSecretCodeError(true);
    }
  };

  const toggleShowKey = (provider: 'deepseek' | 'openai' | 'anthropic') => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const setPrimaryProvider = (provider: 'deepseek' | 'openai' | 'anthropic') => {
    const otherProviders = providerPriority.filter(p => p !== provider);
    setProviderPriority([provider, ...otherProviders]);
  };

  const getPriorityLabel = (provider: 'deepseek' | 'openai' | 'anthropic'): string => {
    const index = providerPriority.indexOf(provider);
    if (index === 0) return t('priority1');
    if (index === 1) return t('priority2');
    if (index === 2) return t('priority3');
    return '';
  };

  const getPriorityColor = (provider: 'deepseek' | 'openai' | 'anthropic') => {
    const index = providerPriority.indexOf(provider);
    if (index === 0) return { backgroundColor: '#FFD700', color: '#000' }; // Gold
    if (index === 1) return { backgroundColor: '#C0C0C0', color: '#000' }; // Silver
    return { backgroundColor: '#CD7F32', color: '#FFF' }; // Bronze
  };

  const renderProviderSection = (
    provider: 'deepseek' | 'openai' | 'anthropic',
    label: string,
    apiKey: string,
    setApiKey: (value: string) => void,
    model: string,
    setModel: (value: string) => void
  ) => {
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          <Chip
            label={getPriorityLabel(provider)}
            size="small"
            sx={{
              height: 20,
              ...getPriorityColor(provider)
            }}
          />
          {providerPriority[0] !== provider && apiKey && (
            <Tooltip title={t('priorityHint')}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setPrimaryProvider(provider)}
                sx={{
                  ml: 1,
                  textTransform: 'none',
                  minWidth: 'auto',
                  fontSize: '11px',
                  py: 0.25,
                  px: 1,
                  height: 22
                }}
              >
                {t('setPrimary')}
              </Button>
            </Tooltip>
          )}
          <Button
            size="small"
            variant="text"
            href={API_KEY_LINKS[provider]}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ ml: 'auto', textTransform: 'none', minWidth: 'auto' }}
          >
            {t('getApiKey')}
          </Button>
          <IconButton
            size="small"
            onClick={() => setInfoDialog(model)}
          >
            <Info fontSize="small" color="primary" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label={t('placeholder')}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showKeys[provider] ? 'text' : 'password'}
              placeholder={t('placeholder')}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowKey(provider)}
                      edge="end"
                      size="small"
                    >
                      {showKeys[provider] ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{t('model')}</InputLabel>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                label={t('model')}
              >
                {AI_MODELS_BY_PROVIDER[provider].map((modelId) => {
                  const modelInfo = AI_MODELS[modelId];
                  return (
                    <MenuItem key={modelId} value={modelId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {modelInfo.name}
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                          {modelInfo.best && (
                            <Chip
                              label={t('best')}
                              size="small"
                              icon={<EmojiEvents sx={{ fontSize: '14px !important' }} />}
                              sx={{
                                height: 20,
                                fontSize: '10px',
                                fontWeight: 600,
                                backgroundColor: '#FFD700',
                                color: '#000',
                                '& .MuiChip-icon': {
                                  color: '#000',
                                }
                              }}
                            />
                          )}
                          {modelInfo.recommended && (
                            <Chip
                              label={t('recommended')}
                              size="small"
                              color="primary"
                              icon={<Star />}
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
      </Box>
    );
  };

  const renderModelInfoDialog = () => {
    if (!infoDialog) return null;
    const modelInfo = AI_MODELS[infoDialog];
    if (!modelInfo) return null;

    return (
      <Dialog
        open={Boolean(infoDialog)}
        onClose={() => setInfoDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            {modelInfo.name}
            {modelInfo.recommended && (
              <Chip
                label={t('recommended')}
                size="small"
                color="primary"
                icon={<Star />}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {t(`models.${modelInfo.id}.description`)}
            </Typography>

            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('capabilities')}
              </Typography>
              <List dense>
                {modelInfo.capabilityKeys.map((capKey, index) => (
                  <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                    <ListItemText
                      primary={`• ${t(`models.${modelInfo.id}.capabilities.${capKey}`)}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('pricing')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#667eea' }} fontWeight={700}>
                    {t('costPerPDF')}:
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#667eea' }} fontWeight={700}>
                    {modelInfo.costPerPDF}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('avgTokens')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {modelInfo.tokensPerPDF.total.toLocaleString()} tokens
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.25 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('inputPrice')}:
                  </Typography>
                  <Typography variant="body2">
                    {modelInfo.pricing.input} {t('perMillionTokens')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('outputPrice')}:
                  </Typography>
                  <Typography variant="body2">
                    {modelInfo.pricing.output} {t('perMillionTokens')}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.25 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('contextWindow')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {modelInfo.contextWindow}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('bulkPricing')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" color="primary.main" fontWeight={600}>
                    {t('per1000PDFs')}:
                  </Typography>
                  <Typography variant="body1" color="primary.main" fontWeight={600}>
                    {modelInfo.bulkPricing.per1000PDFs}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('tokensFor1000')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {modelInfo.bulkPricing.tokensFor1000}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialog(null)}>{tCommon('close')}</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Key color="primary" />
            {t('title')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {!secretCodeUnlocked ? (
            // Show secret code prompt
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Key sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Advanced API Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This feature is for advanced users only. Enter the secret code to configure your own API keys.
              </Typography>

              <TextField
                fullWidth
                type="password"
                label="Secret Code"
                value={secretCodeInput}
                onChange={(e) => {
                  setSecretCodeInput(e.target.value);
                  setSecretCodeError(false);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSecretCodeSubmit();
                  }
                }}
                error={secretCodeError}
                helperText={secretCodeError ? 'Incorrect secret code' : ''}
                sx={{ maxWidth: 400, mx: 'auto' }}
              />

              <Button
                variant="contained"
                onClick={handleSecretCodeSubmit}
                sx={{ mt: 2, borderRadius: '12px', textTransform: 'none' }}
              >
                Unlock
              </Button>
            </Box>
          ) : (
            // Show API key configuration
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('description')}
              </Typography>

              {alert && (
                <Alert severity={alert.type} sx={{ mb: 2 }}>
                  {alert.message}
                </Alert>
              )}

              {/* Toggle to enable/disable personal API keys */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  border: '2px solid',
                  borderColor: useOwnApiKeys ? 'primary.main' : 'divider',
                  borderRadius: '12px',
                  bgcolor: useOwnApiKeys ? 'primary.50' : 'background.paper',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={useOwnApiKeys}
                      onChange={(e) => setUseOwnApiKeys(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Use my own API keys
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {useOwnApiKeys
                          ? 'Your personal API keys will be used (no credits consumed)'
                          : 'Valea master API keys will be used (credits consumed)'}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              {renderProviderSection('deepseek', t('deepseek'), deepseekKey, setDeepseekKey, deepseekModel, setDeepseekModel)}
              {renderProviderSection('openai', t('openai'), openaiKey, setOpenaiKey, openaiModel, setOpenaiModel)}
              {renderProviderSection('anthropic', t('anthropic'), anthropicKey, setAnthropicKey, anthropicModel, setAnthropicModel)}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            {tCommon('cancel')}
          </Button>
          {secretCodeUnlocked && (
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving}
            >
              {saving ? tCommon('loading') : tCommon('save')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {renderModelInfoDialog()}
    </>
  );
}
