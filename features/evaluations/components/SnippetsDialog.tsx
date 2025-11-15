'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Tabs,
  Tab,
  IconButton,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { Close, Search, ContentPaste } from '@mui/icons-material';
import { useTranslations, useLocale } from 'next-intl';
import {
  getSnippetsByCategory,
  getSnippetCategories,
  NarrativeSnippet
} from '../constants/narrative-snippets';

interface SnippetsDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

export default function SnippetsDialog({
  open,
  onClose,
  onInsert
}: SnippetsDialogProps) {
  const t = useTranslations('evaluations.snippets');
  const locale = useLocale() as 'fr' | 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('neighborhood');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<NarrativeSnippet | null>(null);

  const categories = getSnippetCategories(locale);
  const snippets = getSnippetsByCategory(selectedCategory, locale);

  // Filter snippets by search query
  const filteredSnippets = searchQuery.trim()
    ? snippets.filter(snippet =>
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : snippets;

  const handleInsert = () => {
    if (selectedSnippet) {
      onInsert(selectedSnippet.content);
      onClose();
      setSelectedSnippet(null);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setSelectedSnippet(null);
    setSearchQuery('');
    onClose();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { fr: string; en: string }> = {
      neighborhood: { fr: 'Voisinage / Quartier', en: 'Neighborhood' },
      market_conditions: { fr: 'Conditions du marché', en: 'Market Conditions' },
      highest_best_use: { fr: 'Utilisation optimale', en: 'Highest & Best Use' },
      disclaimer: { fr: 'Clauses de réserve', en: 'Disclaimers' }
    };
    return labels[category]?.[locale] || category;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: '700px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContentPaste sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Text Snippets
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Left Panel - Categories */}
          <Box
            sx={{
              width: 200,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Categories
              </Typography>
            </Box>
            <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
              {categories.map((category) => (
                <ListItemButton
                  key={category}
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderLeft: 3,
                    borderColor: selectedCategory === category ? 'primary.main' : 'transparent',
                    bgcolor: selectedCategory === category ? 'primary.50' : 'transparent',
                    '&:hover': {
                      bgcolor: selectedCategory === category ? 'primary.100' : 'action.hover'
                    }
                  }}
                >
                  <ListItemText
                    primary={getCategoryLabel(category)}
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: selectedCategory === category ? 600 : 400
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* Middle Panel - Snippet List */}
          <Box
            sx={{
              width: 250,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { fontSize: '13px', borderRadius: '8px' }
                }}
              />
            </Box>

            <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
              {filteredSnippets.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No snippets found
                  </Typography>
                </Box>
              ) : (
                filteredSnippets.map((snippet) => (
                  <ListItemButton
                    key={snippet.id}
                    selected={selectedSnippet?.id === snippet.id}
                    onClick={() => setSelectedSnippet(snippet)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      borderLeft: 3,
                      borderColor: selectedSnippet?.id === snippet.id ? 'primary.main' : 'transparent',
                      bgcolor: selectedSnippet?.id === snippet.id ? 'primary.50' : 'transparent',
                      '&:hover': {
                        bgcolor: selectedSnippet?.id === snippet.id ? 'primary.100' : 'action.hover'
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={selectedSnippet?.id === snippet.id ? 600 : 400}
                      sx={{ fontSize: '13px', mb: 0.5 }}
                    >
                      {snippet.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: '11px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {snippet.content.substring(0, 80)}...
                    </Typography>
                  </ListItemButton>
                ))
              )}
            </List>
          </Box>

          {/* Right Panel - Preview */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
            {selectedSnippet ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {selectedSnippet.title}
                  </Typography>
                  <Chip
                    label={getCategoryLabel(selectedSnippet.category)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '11px' }}
                  />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '8px',
                    bgcolor: 'background.default',
                    overflow: 'auto'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedSnippet.content}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                    Tip: Edit the snippet after inserting to customize placeholders like [YEARS], [CITY], etc.
                  </Typography>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Select a snippet to preview
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleInsert}
          disabled={!selectedSnippet}
          startIcon={<ContentPaste />}
        >
          Insert Snippet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
