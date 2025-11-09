'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import { ArrowBack, Save, CheckCircle } from '@mui/icons-material';
import { MaterialDashboardLayout } from '../../../../components/layout/MaterialDashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { TemplateType } from '@/features/evaluations/types/evaluation.types';
import { NAS_SECTIONS, RPS_SECTIONS, CUSTOM_SECTIONS } from '@/features/evaluations/constants/evaluation.constants';
import AppraisalSectionForm from '@/features/evaluations/components/AppraisalSectionForm';
import { useTranslations } from 'next-intl';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AppraisalEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('evaluations.detail');
  const tSections = useTranslations('evaluations.sections');
  const tEval = useTranslations('evaluations');
  const tTemplates = useTranslations('evaluations.templates');

  const [appraisal, setAppraisal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [sectionsData, setSectionsData] = useState<any>({});

  useEffect(() => {
    loadAppraisal();
  }, [id]);

  const loadAppraisal = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('appraisals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setAppraisal(data);
      setSectionsData(data.sections_data || {});
    } catch (error) {
      console.error('Error loading appraisal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const supabase = createClient();

      // Calculate completion percentage
      const sections = getSections();
      const completedSections = sections.filter(
        (section) => sectionsData[section]?.completed
      ).length;
      const completionPercentage = Math.round((completedSections / sections.length) * 100);

      const { error } = await supabase
        .from('appraisals')
        .update({
          sections_data: sectionsData,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Reload to get updated data
      await loadAppraisal();
    } catch (error) {
      console.error('Error saving appraisal:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSections = () => {
    if (!appraisal) return [];

    switch (appraisal.template_type as TemplateType) {
      case 'NAS':
        return NAS_SECTIONS;
      case 'RPS':
        return RPS_SECTIONS;
      case 'CUSTOM':
        return CUSTOM_SECTIONS;
      default:
        return [];
    }
  };

  const handleSectionChange = (sectionId: string, data: any) => {
    setSectionsData((prev: any) => ({
      ...prev,
      [sectionId]: data
    }));
  };

  const getTemplateName = () => {
    switch (appraisal?.template_type) {
      case 'RPS':
        return tTemplates('rps.subtitle');
      case 'NAS':
        return tTemplates('nas.subtitle');
      case 'CUSTOM':
        return tTemplates('custom.subtitle');
      default:
        return '';
    }
  };

  const getSectionLabel = (sectionId: string) => {
    // Try to get translation first, fallback to formatted string
    const translationKey = sectionId;
    try {
      return tSections(translationKey);
    } catch {
      return sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return (
      <MaterialDashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MaterialDashboardLayout>
    );
  }

  if (!appraisal) {
    return (
      <MaterialDashboardLayout>
        <Alert severity="error">{t('notFound')}</Alert>
      </MaterialDashboardLayout>
    );
  }

  const sections = getSections();

  return (
    <MaterialDashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/evaluations')}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              {tEval('backToList')}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {appraisal.appraisal_number}
              </Typography>
              <Chip
                label={t(`status.${appraisal.status}`)}
                color={appraisal.status === 'draft' ? 'warning' : 'success'}
                size="small"
              />
              <Chip
                label={getTemplateName()}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Typography variant="body1" color="text.secondary">
              {appraisal.client_name} • {appraisal.address}
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('progress')}:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 200,
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${appraisal.completion_percentage || 0}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s'
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {appraisal.completion_percentage || 0}%
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            {saving ? t('saving') : t('save')}
          </Button>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                  fontSize: '14px'
                }
              }}
            >
              {sections.map((sectionId, index) => {
                const isCompleted = sectionsData[sectionId]?.completed;
                return (
                  <Tab
                    key={sectionId}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getSectionLabel(sectionId)}
                        {isCompleted && (
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        )}
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>
          </Box>

          {sections.map((sectionId, index) => (
            <TabPanel key={sectionId} value={currentTab} index={index}>
              <AppraisalSectionForm
                sectionId={sectionId}
                templateType={appraisal.template_type}
                data={sectionsData[sectionId] || {}}
                onChange={(data) => handleSectionChange(sectionId, data)}
              />
            </TabPanel>
          ))}
        </Card>
      </Box>
    </MaterialDashboardLayout>
  );
}
