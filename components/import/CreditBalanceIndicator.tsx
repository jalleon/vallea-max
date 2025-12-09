'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Chip, Tooltip } from '@mui/material';
import { Star, Info } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface CreditBalance {
  quota: number | null;
  used: number;
  remaining: number;
  resetDate: string | null;
}

export function CreditBalanceIndicator() {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();

    // Listen for credit updates (after imports complete)
    const handleCreditUpdate = () => {
      loadCredits();
    };

    window.addEventListener('credits-updated', handleCreditUpdate);

    return () => {
      window.removeEventListener('credits-updated', handleCreditUpdate);
    };
  }, []);

  const loadCredits = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('[CreditBalance] No user found');
        return;
      }

      console.log('[CreditBalance] Loading credits for user:', user.id);

      const { data, error } = await supabase
        .from('users')
        .select('scan_credits_quota, scan_credits_used, scan_credits_reset_at')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error('[CreditBalance] Failed to load credits:', error);
        return;
      }

      console.log('[CreditBalance] Credits loaded:', data);

      const quota = data.scan_credits_quota;
      const used = data.scan_credits_used || 0;
      const remaining = quota === null ? Infinity : Math.max(0, quota - used);

      setCredits({
        quota,
        used,
        remaining,
        resetDate: data.scan_credits_reset_at,
      });
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !credits) {
    return null;
  }

  const isUnlimited = credits.quota === null;
  const isLow = !isUnlimited && credits.remaining < 5;
  const progressValue = isUnlimited ? 100 : (credits.used / credits.quota!) * 100;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '12px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: isLow ? 'warning.main' : 'divider',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Scan Credits
          </Typography>
          <Tooltip title="Credits are used for PDF scanning. Small PDFs use 1 credit, medium use 2, and large use 4.">
            <Info sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
          </Tooltip>
        </Box>
        <Chip
          label={isUnlimited ? 'Unlimited' : `${credits.remaining} remaining`}
          size="small"
          color={isLow ? 'warning' : 'primary'}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {!isUnlimited && (
        <>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 6,
              borderRadius: '4px',
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: isLow ? 'warning.main' : 'primary.main',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {credits.used} / {credits.quota} used this month
          </Typography>
        </>
      )}

      {isLow && credits.resetDate && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          Running low on credits! Resets {new Date(credits.resetDate).toLocaleDateString()}
        </Typography>
      )}
    </Box>
  );
}
