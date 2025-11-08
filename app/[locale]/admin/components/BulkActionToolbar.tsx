'use client'

import { Box, Button, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import { Close, Send, Edit, Download, Check, PersonAdd } from '@mui/icons-material'

interface BulkActionToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: {
    label: string
    icon: React.ReactNode
    onClick: () => void
    color?: 'primary' | 'success' | 'warning' | 'error'
  }[]
  locale: string
}

export default function BulkActionToolbar({ selectedCount, onClearSelection, actions, locale }: BulkActionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: '#EEF2FF',
        borderRadius: '12px',
        p: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #C7D2FE',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          label={`${selectedCount} ${locale === 'fr' ? 'sélectionné(s)' : 'selected'}`}
          color="primary"
          sx={{ fontWeight: 600 }}
        />
        <Tooltip title={locale === 'fr' ? 'Effacer la sélection' : 'Clear selection'}>
          <IconButton size="small" onClick={onClearSelection}>
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            startIcon={action.icon}
            onClick={action.onClick}
            color={action.color || 'primary'}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  )
}
