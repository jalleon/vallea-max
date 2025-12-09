'use client';

import { TextField, Typography, Box } from '@mui/material';

interface ClientSectionProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData?: any;
}

export default function ClientSection({
  formData,
  handleFieldChange,
  appraisalData
}: ClientSectionProps) {

  return (
    <Box sx={{ p: 3 }}>
      {/* CLIENT */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          mb: 3
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            CLIENT
          </Typography>
        </Box>

        {/* Client Name */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Client</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Client Name"
              value={formData.clientName || appraisalData?.client_name || ''}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Attention */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Attention</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Attention"
              value={formData.clientAttention || ''}
              onChange={(e) => handleFieldChange('clientAttention', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Address */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Address</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Address"
              value={formData.clientAddress || ''}
              onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* E-mail */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>E-mail</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              type="email"
              placeholder="email@example.com"
              value={formData.clientEmail || ''}
              onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Phone */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Phone</Typography>
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              value={formData.clientPhone || ''}
              onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
