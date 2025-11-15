'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
// Table extensions temporarily disabled due to version compatibility
// import Table from '@tiptap/extension-table';
// import TableRow from '@tiptap/extension-table-row';
// import TableCell from '@tiptap/extension-table-cell';
// import TableHeader from '@tiptap/extension-table-header';
import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Button,
  Menu,
  MenuItem,
  Chip,
  Paper
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Undo,
  Redo,
  AutoAwesome,
  ContentPaste,
  TableChart
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface NarrativeEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  onAIAssist?: () => void;
  onInsertSnippet?: () => void;
}

export default function NarrativeEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
  maxLength,
  onAIAssist,
  onInsertSnippet
}: NarrativeEditorProps) {
  const t = useTranslations('evaluations.editor');
  const [isFocused, setIsFocused] = useState(false);
  const [formatMenuAnchor, setFormatMenuAnchor] = useState<null | HTMLElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // Required for Next.js SSR
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      CharacterCount.configure({
        limit: maxLength
      })
      // Table extensions temporarily disabled
      // Table.configure({
      //   resizable: true
      // }),
      // TableRow,
      // TableCell,
      // TableHeader
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height: ${minHeight}px; padding: 16px;`
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleFormatMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFormatMenuAnchor(event.currentTarget);
  };

  const handleFormatMenuClose = () => {
    setFormatMenuAnchor(null);
  };

  // Temporarily disabled due to Tiptap v3 compatibility
  // const insertTable = () => {
  //   editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  //   handleFormatMenuClose();
  // };

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <Paper
      elevation={0}
      sx={{
        border: 2,
        borderColor: isFocused ? 'primary.main' : 'divider',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        bgcolor: 'background.paper'
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
          flexWrap: 'wrap'
        }}
      >
        {/* Text Formatting */}
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive('bold') ? 'primary' : 'default'}
            sx={{ borderRadius: '6px' }}
          >
            <FormatBold fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic (Ctrl+I)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive('italic') ? 'primary' : 'default'}
            sx={{ borderRadius: '6px' }}
          >
            <FormatItalic fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline (Ctrl+U)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            color={editor.isActive('underline') ? 'primary' : 'default'}
            sx={{ borderRadius: '6px' }}
          >
            <FormatUnderlined fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Headings */}
        <Tooltip title="Heading 1">
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'text'}
            sx={{ minWidth: 40, px: 1, fontSize: '11px', borderRadius: '6px' }}
          >
            H1
          </Button>
        </Tooltip>

        <Tooltip title="Heading 2">
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'text'}
            sx={{ minWidth: 40, px: 1, fontSize: '11px', borderRadius: '6px' }}
          >
            H2
          </Button>
        </Tooltip>

        <Tooltip title="Heading 3">
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            variant={editor.isActive('heading', { level: 3 }) ? 'contained' : 'text'}
            sx={{ minWidth: 40, px: 1, fontSize: '11px', borderRadius: '6px' }}
          >
            H3
          </Button>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Lists */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive('bulletList') ? 'primary' : 'default'}
            sx={{ borderRadius: '6px' }}
          >
            <FormatListBulleted fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive('orderedList') ? 'primary' : 'default'}
            sx={{ borderRadius: '6px' }}
          >
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Table - Temporarily disabled due to Tiptap v3 compatibility */}
        {/* <Tooltip title="Insert Table">
          <IconButton
            size="small"
            onClick={insertTable}
            sx={{ borderRadius: '6px' }}
          >
            <TableChart fontSize="small" />
          </IconButton>
        </Tooltip> */}

        {/* <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} /> */}

        {/* Undo/Redo */}
        <Tooltip title="Undo (Ctrl+Z)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            sx={{ borderRadius: '6px' }}
          >
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Redo (Ctrl+Shift+Z)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            sx={{ borderRadius: '6px' }}
          >
            <Redo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        {/* AI Assistant & Snippets */}
        {onInsertSnippet && (
          <Tooltip title="Insert Snippet">
            <Button
              size="small"
              startIcon={<ContentPaste fontSize="small" />}
              onClick={onInsertSnippet}
              sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '6px' }}
            >
              Snippets
            </Button>
          </Tooltip>
        )}

        {onAIAssist && (
          <Tooltip title="AI Writing Assistant">
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoAwesome fontSize="small" />}
              onClick={onAIAssist}
              sx={{
                textTransform: 'none',
                fontSize: '12px',
                borderRadius: '6px',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.50'
                }
              }}
            >
              AI Assist
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Editor Content */}
      <Box
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        sx={{
          '& .ProseMirror': {
            minHeight: `${minHeight}px`,
            maxHeight: '600px',
            overflowY: 'auto',
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'text.primary',
            '& p': {
              margin: '0 0 12px 0'
            },
            '& h1': {
              fontSize: '24px',
              fontWeight: 700,
              margin: '16px 0 12px 0',
              color: 'primary.main'
            },
            '& h2': {
              fontSize: '20px',
              fontWeight: 600,
              margin: '14px 0 10px 0',
              color: 'primary.main'
            },
            '& h3': {
              fontSize: '16px',
              fontWeight: 600,
              margin: '12px 0 8px 0',
              color: 'text.primary'
            },
            '& ul, & ol': {
              paddingLeft: '24px',
              margin: '0 0 12px 0'
            },
            '& li': {
              margin: '4px 0'
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '12px 0',
              border: '1px solid #ddd'
            },
            '& th, & td': {
              border: '1px solid #ddd',
              padding: '8px 12px',
              textAlign: 'left'
            },
            '& th': {
              bgcolor: '#f5f5f5',
              fontWeight: 600
            },
            '& p.is-editor-empty:first-child::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              color: 'text.disabled',
              pointerEvents: 'none',
              height: 0
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Footer - Character/Word Count */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
            {wordCount} words
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
            {characterCount} characters
            {maxLength && ` / ${maxLength}`}
          </Typography>
        </Box>

        {maxLength && characterCount > maxLength * 0.9 && (
          <Chip
            label={`${maxLength - characterCount} chars left`}
            size="small"
            color={characterCount >= maxLength ? 'error' : 'warning'}
            sx={{ height: 20, fontSize: '10px' }}
          />
        )}
      </Box>
    </Paper>
  );
}
