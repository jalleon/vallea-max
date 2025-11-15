'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome,
  ContentCopy,
  Refresh,
  Close,
  Edit
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface AIPromptTemplate {
  id: string;
  title: string;
  prompt: string;
  variables?: string[];
}

const AI_PROMPT_TEMPLATES: AIPromptTemplate[] = [
  {
    id: 'neighborhood',
    title: 'Generate Neighborhood Description',
    prompt: `Write a professional neighborhood description for a property at {{address}}.

Include:
- Type of neighborhood (residential, commercial, mixed-use)
- Character and development stage (established, developing, mature)
- Typical property types and building styles
- Proximity to amenities (schools, parks, shopping, transit)
- Municipal services available
- General desirability and market perception

Keep it factual, objective, and professional (150-200 words).`,
    variables: ['address', 'city', 'property_type']
  },
  {
    id: 'market_analysis',
    title: 'Generate Market Analysis',
    prompt: `Based on recent comparable sales data, write a market analysis paragraph covering:
- Recent market activity and trends
- Average days on market
- Price trends (increasing/stable/decreasing)
- Supply and demand dynamics
- Current market conditions (buyer's/seller's/balanced market)

Be professional and data-driven (100-150 words).`,
    variables: ['property_type', 'location']
  },
  {
    id: 'highest_best_use',
    title: 'Highest and Best Use Analysis',
    prompt: `Analyze the highest and best use for a property with these characteristics:
Property Type: {{property_type}}
Zoning: {{zoning}}
Current Use: {{current_use}}

Consider:
- Legally permissible uses
- Physically possible uses
- Financially feasible uses
- Maximally productive use

Conclude with a statement of the highest and best use (150-200 words).`,
    variables: ['property_type', 'zoning', 'current_use']
  },
  {
    id: 'expand',
    title: 'Expand This Text',
    prompt: `Expand the following text into a more detailed, professional paragraph:

{{user_input}}

Maintain the original meaning but add depth, clarity, and professional language.`,
    variables: ['user_input']
  },
  {
    id: 'improve',
    title: 'Improve This Section',
    prompt: `Improve the following appraisal section text for clarity, professionalism, and accuracy:

{{user_input}}

Make it more concise, remove redundancy, and use industry-standard terminology.`,
    variables: ['user_input']
  },
  {
    id: 'summarize',
    title: 'Summarize This',
    prompt: `Summarize the following text into a concise professional paragraph:

{{user_input}}

Focus on the key points and maintain a professional tone.`,
    variables: ['user_input']
  }
];

interface AIWritingAssistantProps {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  contextData?: {
    address?: string;
    city?: string;
    propertyType?: string;
    zoning?: string;
    currentUse?: string;
    [key: string]: any;
  };
  currentText?: string;
}

export default function AIWritingAssistant({
  open,
  onClose,
  onInsert,
  contextData = {},
  currentText = ''
}: AIWritingAssistantProps) {
  const t = useTranslations('evaluations.aiAssistant');
  const [selectedTemplate, setSelectedTemplate] = useState<AIPromptTemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateSelect = (template: AIPromptTemplate) => {
    setSelectedTemplate(template);
    setGeneratedText('');
    setError(null);

    // Pre-fill prompt with context data
    let filledPrompt = template.prompt;
    Object.entries(contextData).forEach(([key, value]) => {
      filledPrompt = filledPrompt.replace(`{{${key}}}`, value || '');
    });

    // Replace {{user_input}} with current text if available
    if (currentText && template.variables?.includes('user_input')) {
      filledPrompt = filledPrompt.replace('{{user_input}}', currentText);
    }

    setCustomPrompt(filledPrompt);
  };

  const handleGenerate = async () => {
    if (!customPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedText('');

    try {
      const response = await fetch('/api/openai/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: customPrompt,
          maxTokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();
      setGeneratedText(data.text || '');
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError(err.message || 'Failed to generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedText) {
      onInsert(generatedText);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomPrompt('');
    setGeneratedText('');
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px', maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            AI Writing Assistant
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          {/* Left Panel - Templates */}
          {!selectedTemplate && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Choose a Template
              </Typography>
              <List disablePadding>
                {AI_PROMPT_TEMPLATES.map((template) => (
                  <ListItemButton
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    sx={{
                      borderRadius: '8px',
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                      }
                    }}
                  >
                    <ListItemText
                      primary={template.title}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {/* Right Panel - Prompt & Result */}
          {selectedTemplate && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Selected Template */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Chip
                    label={selectedTemplate.title}
                    size="small"
                    color="primary"
                    onDelete={() => setSelectedTemplate(null)}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Edit the prompt or write your own..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }
                  }}
                />

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />}
                    onClick={handleGenerate}
                    disabled={loading || !customPrompt.trim()}
                    fullWidth
                  >
                    {loading ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </Box>
              </Box>

              {/* Error */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Generated Text */}
              {generatedText && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Generated Text
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Copy to clipboard">
                        <IconButton size="small" onClick={handleCopyToClipboard}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Regenerate">
                        <IconButton size="small" onClick={handleGenerate}>
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'success.main',
                      borderRadius: '8px',
                      bgcolor: 'success.50',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Georgia, serif',
                        lineHeight: 1.6
                      }}
                    >
                      {generatedText}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleInsert}
          disabled={!generatedText}
          startIcon={<Edit />}
        >
          Insert into Editor
        </Button>
      </DialogActions>
    </Dialog>
  );
}
