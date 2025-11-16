'use client';

import { useEffect } from 'react';
import {
  TextField,
  Typography,
  Box,
  Divider,
  InputAdornment
} from '@mui/material';
import { useTranslations } from 'next-intl';

interface ReferenceSheetSectionContentProps {
  formData: any;
  handleFieldChange: (field: string, value: any) => void;
  appraisalData: any;
  onChange: (data: any) => void;
  setFormData: (data: any) => void;
  allSectionsData?: any;
}

export default function ReferenceSheetSectionContent({
  formData,
  handleFieldChange,
  appraisalData,
  onChange,
  setFormData,
  allSectionsData
}: ReferenceSheetSectionContentProps) {
  const tRef = useTranslations('evaluations.sections.referenceSheet');

  // Auto-populate on first load
  useEffect(() => {
    if (appraisalData && Object.keys(formData).length === 0) {
      const initialData = {
        purpose: formData.purpose || tRef('purposePlaceholder'),
        address: appraisalData.address || '',
        city: appraisalData.city || '',
        fileNumber: formData.fileNumber || '',
        lotNumber: formData.lotNumber || '',
        cadastre: formData.cadastre || 'Cadastre du Québec',
        mandantFileNumber: formData.mandantFileNumber || '',
        mandantName: formData.mandantName || '',
        mandantCompany: formData.mandantCompany || '',
        mandantAddress: formData.mandantAddress || '',
        mandantCity: formData.mandantCity || '',
        mandantPhone: formData.mandantPhone || '',
        mandantEmail: formData.mandantEmail || '',
        ownerName: formData.ownerName || '',
        ownerPhone: formData.ownerPhone || '',
        borrowerName: formData.borrowerName || appraisalData.client_name || '',
        borrowerPhone: formData.borrowerPhone || '',
        currentMarketValue: formData.currentMarketValue || '',
        potentialMarketValue: formData.potentialMarketValue || '',
        valueInWords: formData.valueInWords || '',
        asOfDate: formData.asOfDate || appraisalData.effective_date || new Date().toISOString().split('T')[0]
      };
      setFormData(initialData);
      onChange(initialData);
    }
  }, [appraisalData]);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          RAPPORT D'ÉVALUATION IMMOBILIÈRE
        </Typography>
      </Box>

      {/* Compact Table-Style Form */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        {/* Purpose and Scope */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start', pt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('purposeAndScope')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.purpose || ''}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              placeholder={tRef('purposePlaceholder')}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Property Address (auto-populated, read-only display) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'info.lighter'
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('address')}</Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="body1" sx={{ fontSize: '14px', mb: 0.5 }}>
              {allSectionsData?.presentation?.fullAddress || appraisalData?.address || 'Adresse non spécifiée'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
              {allSectionsData?.presentation?.city || appraisalData?.city || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '11px' }}>
              {tRef('autoPopulatedInfo')}
            </Typography>
          </Box>
        </Box>

        {/* File Number */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('fileNumber')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.fileNumber || ''}
              onChange={(e) => handleFieldChange('fileNumber', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, maxWidth: 300 }}
            />
          </Box>
        </Box>

        {/* Section Divider: Cadastral Designation */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            {tRef('cadastralDesignation')}
          </Typography>
        </Box>

        {/* Lot Number */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('lotNumber')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.lotNumber || ''}
              onChange={(e) => handleFieldChange('lotNumber', e.target.value)}
              placeholder="3 492 120"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Cadastre */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('cadastre')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.cadastre || ''}
              onChange={(e) => handleFieldChange('cadastre', e.target.value)}
              placeholder="Cadastre du Québec"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Section Divider: Mandant */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            {tRef('mandant')}
          </Typography>
        </Box>

        {/* Mandant File Number */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantFileNumber')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.mandantFileNumber || ''}
              onChange={(e) => handleFieldChange('mandantFileNumber', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Mandant Name */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantName')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.mandantName || ''}
              onChange={(e) => handleFieldChange('mandantName', e.target.value)}
              placeholder="Nationwide Appraisal Services"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Mandant Company */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantCompany')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.mandantCompany || ''}
              onChange={(e) => handleFieldChange('mandantCompany', e.target.value)}
              placeholder="Mouvement Desjardins"
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Mandant Address, City, Phone, Email */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantAddress')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.mandantAddress || ''}
              onChange={(e) => handleFieldChange('mandantAddress', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantCity')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.mandantCity || ''}
              onChange={(e) => handleFieldChange('mandantCity', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantPhone')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.mandantPhone || ''}
              onChange={(e) => handleFieldChange('mandantPhone', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('mandantEmail')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="email"
              value={formData.mandantEmail || ''}
              onChange={(e) => handleFieldChange('mandantEmail', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Section Divider: Owner */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            {tRef('owner')}
          </Typography>
        </Box>

        {/* Owner Name */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('ownerName')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.ownerName || ''}
              onChange={(e) => handleFieldChange('ownerName', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Owner Phone */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('ownerPhone')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.ownerPhone || ''}
              onChange={(e) => handleFieldChange('ownerPhone', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Section Divider: Borrower */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            {tRef('borrower')}
          </Typography>
        </Box>

        {/* Borrower Name */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('borrowerName')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.borrowerName || ''}
              onChange={(e) => handleFieldChange('borrowerName', e.target.value)}
              helperText={appraisalData?.client_name ? tRef('autoPopulatedInfo') : ''}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Borrower Phone */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('borrowerPhone')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.borrowerPhone || ''}
              onChange={(e) => handleFieldChange('borrowerPhone', e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* Section Divider: Conclusion */}
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>
            {tRef('conclusion')}
          </Typography>
        </Box>

        {/* Current Market Value */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('currentValue')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={formData.currentMarketValue || ''}
              onChange={(e) => handleFieldChange('currentMarketValue', e.target.value)}
              placeholder="0"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, maxWidth: 400 }}
            />
          </Box>
        </Box>

        {/* Potential Market Value */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('potentialValue')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={formData.potentialMarketValue || ''}
              onChange={(e) => handleFieldChange('potentialMarketValue', e.target.value)}
              placeholder="0"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, maxWidth: 400 }}
            />
          </Box>
        </Box>

        {/* Value in Words */}
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('valueInWords')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={formData.valueInWords || ''}
              onChange={(e) => handleFieldChange('valueInWords', e.target.value)}
              placeholder={tRef('valueInWordsPlaceholder')}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' } }}
            />
          </Box>
        </Box>

        {/* As Of Date */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tRef('asOfDate')}</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              size="small"
              type="date"
              value={formData.asOfDate || ''}
              onChange={(e) => handleFieldChange('asOfDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText={appraisalData?.effective_date ? tRef('autoPopulatedInfo') : ''}
              sx={{ '& .MuiInputBase-input': { fontSize: '14px' }, maxWidth: 300 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Legal Note */}
      <Box sx={{ mt: 3, p: 2, borderRadius: '8px', bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '13px' }}>
          {tRef('legalNote')}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6, fontSize: '12px' }}>
          {tRef('legalNoteText')}
        </Typography>
      </Box>
    </Box>
  );
}
