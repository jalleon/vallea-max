'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { ArrowBack, Save, CheckCircle, Refresh } from '@mui/icons-material';
import { MaterialDashboardLayout } from '../../../../components/layout/MaterialDashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { TemplateType } from '@/features/evaluations/types/evaluation.types';
import { NAS_SECTIONS, RPS_SECTIONS, CUSTOM_SECTIONS } from '@/features/evaluations/constants/evaluation.constants';
import AppraisalSectionForm from '@/features/evaluations/components/AppraisalSectionForm';
import AdjustmentsForm from '@/features/evaluations/components/AdjustmentsForm';
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
  const [saveState, setSaveState] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [currentTab, setCurrentTab] = useState(0);
  const [currentToolTab, setCurrentToolTab] = useState(-1); // -1 = no tool tab selected
  const [sectionsData, setSectionsData] = useState<any>({});
  const [adjustmentsData, setAdjustmentsData] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionsDataRef = useRef<any>({});

  // Restore tab from URL or localStorage on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');

      if (tabParam) {
        // Prioritize URL parameter
        const tabIndex = parseInt(tabParam, 10);
        if (!isNaN(tabIndex) && tabIndex >= 0) {
          setCurrentTab(tabIndex);
          localStorage.setItem(`evaluation-tab-${id}`, tabIndex.toString());
        }
      } else {
        // Fallback to localStorage if no URL parameter
        const savedTab = localStorage.getItem(`evaluation-tab-${id}`);
        if (savedTab) {
          const tabIndex = parseInt(savedTab, 10);
          if (!isNaN(tabIndex) && tabIndex >= 0) {
            setCurrentTab(tabIndex);
            // Update URL to reflect the restored tab
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabIndex.toString());
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
    }
  }, [id]);

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

  // Calculate completion percentage from sectionsData
  const completionPercentage = useMemo(() => {
    if (!appraisal) return 0;
    const sections = getSections();
    if (sections.length === 0) return 0;
    const completedSections = sections.filter(
      (section) => sectionsData[section]?.completed
    ).length;
    return Math.round((completedSections / sections.length) * 100);
  }, [sectionsData, appraisal]);

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

      console.log('📥 Loading data from Supabase:', JSON.stringify(data.form_data, null, 2));
      console.log('📥 Appraisal object:', data);
      console.log('📥 property_id:', data.property_id);

      setAppraisal(data);
      // Cast form_data from Json to our type
      const loadedData = (data.form_data as any) || {};
      sectionsDataRef.current = loadedData;
      setSectionsData(loadedData);

      // Load adjustments data (type assertion needed - field exists in DB but not in generated types yet)
      const loadedAdjustmentsData = ((data as any).adjustments_data as any) || null;
      console.log('📥 Loading adjustments_data:', loadedAdjustmentsData);
      setAdjustmentsData(loadedAdjustmentsData);

      setIsInitialLoad(false);

      // Calculate and update completion percentage if needed
      // Get sections based on template type from the loaded data (not state, which hasn't updated yet)
      let sections: string[] = [];
      switch (data.template_type as TemplateType) {
        case 'NAS':
          sections = NAS_SECTIONS;
          break;
        case 'RPS':
          sections = RPS_SECTIONS;
          break;
        case 'CUSTOM':
          sections = CUSTOM_SECTIONS;
          break;
        default:
          sections = [];
      }

      if (sections.length > 0) {
        const completedSections = sections.filter(
          (section) => loadedData[section]?.completed
        ).length;
        const calculatedCompletion = Math.round((completedSections / sections.length) * 100);

        // Update database if completion percentage differs
        if (calculatedCompletion !== data.completion_percentage) {
          console.log(`📊 Updating completion percentage: ${data.completion_percentage} → ${calculatedCompletion}%`);
          await supabase
            .from('appraisals')
            .update({ completion_percentage: calculatedCompletion })
            .eq('id', id);
        }
      }
    } catch (error) {
      console.error('Error loading appraisal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveState('saving');
      const supabase = createClient();

      // Use ref to get the latest data (avoids closure issues)
      const dataToSave = sectionsDataRef.current;

      // Calculate completion percentage
      const sections = getSections();
      const completedSections = sections.filter(
        (section) => dataToSave[section]?.completed
      ).length;
      const calculatedCompletion = sections.length > 0
        ? Math.round((completedSections / sections.length) * 100)
        : 0;

      console.log('💾 Saving data to Supabase:', JSON.stringify(dataToSave, null, 2));
      console.log('📊 Completion percentage:', calculatedCompletion);

      const { error } = await supabase
        .from('appraisals')
        .update({
          form_data: dataToSave as any,
          completion_percentage: calculatedCompletion,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Save error:', error);
        throw error;
      }

      console.log('✅ Save successful');
      setSaveState('saved');
    } catch (error) {
      console.error('Error saving appraisal:', error);
      setSaveState('unsaved');
    } finally {
      setSaving(false);
    }
  };

  const handleSectionChange = (sectionId: string, data: any) => {
    console.log(`📝 Section "${sectionId}" changed:`, data);

    // Update both state and ref
    const newData = {
      ...sectionsDataRef.current,
      [sectionId]: data
    };

    sectionsDataRef.current = newData;
    setSectionsData(newData);

    console.log('📦 Updated sectionsDataRef:', sectionsDataRef.current);

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set state to unsaved
    setSaveState('unsaved');

    // Set new timer for auto-save
    if (!isInitialLoad) {
      console.log('⏰ Auto-save timer set for 2 seconds');
      saveTimerRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    } else {
      console.log('⏸️  Skipping auto-save (initial load)');
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setCurrentToolTab(-1); // Reset tool tab when changing main tab
    // Update URL with tab parameter
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newValue.toString());
    window.history.replaceState({}, '', url.toString());
    // Save to localStorage for persistence across navigation
    localStorage.setItem(`evaluation-tab-${id}`, newValue.toString());
  };

  const handleToolTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentToolTab(newValue);
  };

  const handleAdjustmentsChange = (data: any) => {
    setAdjustmentsData(data);

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set state to unsaved
    setSaveState('unsaved');

    // Set new timer for auto-save
    if (!isInitialLoad) {
      console.log('⏰ Adjustments auto-save timer set for 2 seconds');
      saveTimerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          setSaveState('saving');
          const supabase = createClient();

          console.log('💾 Saving adjustments_data to Supabase:', JSON.stringify(data, null, 2));

          const { error } = await supabase
            .from('appraisals')
            .update({
              adjustments_data: data as any,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (error) {
            console.error('❌ Adjustments save error:', error);
            throw error;
          }

          console.log('✅ Adjustments save successful');
          setSaveState('saved');
        } catch (error) {
          console.error('Error saving adjustments:', error);
          setSaveState('unsaved');
        } finally {
          setSaving(false);
        }
      }, 2000);
    }
  };

  const handleSyncToDirectComparison = () => {
    if (!adjustmentsData || !adjustmentsData.comparables) return;

    // Find the Direct Comparison section in sectionsData
    const directComparisonSection = sectionsData.direct_comparison;
    if (!directComparisonSection) return;

    // Update comparables with adjustment amounts
    const updatedComparables = directComparisonSection.comparables.map((comp: any, index: number) => {
      const adjustmentData = adjustmentsData.comparables[index];
      if (!adjustmentData) return comp;

      // Map adjustments to Direct Comparison fields
      const newComp = { ...comp };
      const adjustments = adjustmentData.adjustments;

      if (adjustments.timing) newComp.adjustmentDataSource = adjustments.timing.calculatedAmount;
      if (adjustments.livingArea) newComp.adjustmentLivingArea = adjustments.livingArea.calculatedAmount;
      if (adjustments.lotSize) newComp.adjustmentLotSize = adjustments.lotSize.calculatedAmount;
      if (adjustments.quality) newComp.adjustmentQuality = adjustments.quality.calculatedAmount;
      if (adjustments.effectiveAge) newComp.adjustmentAge = adjustments.effectiveAge.calculatedAmount;
      if (adjustments.basement) newComp.adjustmentBasement = adjustments.basement.calculatedAmount;
      if (adjustments.bathrooms) newComp.adjustmentRooms = adjustments.bathrooms.calculatedAmount;
      if (adjustments.garage) newComp.adjustmentParking = adjustments.garage.calculatedAmount;
      if (adjustments.extras) newComp.adjustmentExtras = adjustments.extras.calculatedAmount;
      if (adjustments.unitLocation) newComp.adjustmentUnitLocation = adjustments.unitLocation.calculatedAmount;

      return newComp;
    });

    // Update sections data with new comparables
    handleSectionChange('direct_comparison', {
      ...directComparisonSection,
      comparables: updatedComparables
    });

    alert('Adjustments synced to Direct Comparison table!');
  };

  const handleReloadSubjectProperty = () => {
    console.log('🔄 Reloading subject property data...');
    // Increment reload trigger to force all sections to reload subject property data
    setReloadTrigger(prev => prev + 1);
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
                      width: `${completionPercentage}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s'
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {completionPercentage}%
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {appraisal.property_id && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={handleReloadSubjectProperty}
                sx={{ textTransform: 'none' }}
              >
                {t('reloadSubjectProperty')}
              </Button>
            )}
            {saveState === 'saved' && (
              <Chip
                icon={<CheckCircle />}
                label="All changes saved"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {saveState === 'unsaved' && (
              <Chip
                label="Unsaved changes"
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
            {saveState === 'saving' && (
              <Chip
                icon={<CircularProgress size={16} />}
                label="Saving..."
                color="info"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Card sx={{ minHeight: 'calc(100vh - 300px)' }}>
          {/* Main Section Tabs - First Row */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
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

          {/* Tools/Calculators Tabs - Second Row */}
          <Box sx={{ borderBottom: 2, borderColor: 'warning.light', bgcolor: 'grey.50' }}>
            <Tabs
              value={currentToolTab}
              onChange={handleToolTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 42,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 42,
                  fontSize: '13px',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'warning.dark',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'warning.main',
                  height: 3
                }
              }}
            >
              <Tab
                value={0}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⚙️ {t('adjustmentsCalculator')}
                  </Box>
                }
              />
              {/* Add more tool tabs here in the future */}
            </Tabs>
          </Box>

          {/* Render Main Section Tabs or Tool Tabs */}
          {currentToolTab === -1 ? (
            // Show normal section tabs
            sections.map((sectionId, index) => {
              console.log('🔍 Page.tsx - Rendering section:', sectionId);
              console.log('🔍 Page.tsx - appraisal.property_id:', appraisal.property_id);
              return (
                <TabPanel key={sectionId} value={currentTab} index={index}>
                  <AppraisalSectionForm
                    sectionId={sectionId}
                    templateType={appraisal.template_type}
                    data={sectionsData[sectionId] || {}}
                    onChange={(data) => handleSectionChange(sectionId, data)}
                    subjectPropertyId={appraisal.property_id}
                    subjectPropertyType={appraisal.property_type}
                    reloadTrigger={reloadTrigger}
                  />
                </TabPanel>
              );
            })
          ) : (
            // Show tool tabs
            <>
              {currentToolTab === 0 && (
                <Box sx={{ p: 0 }}>
                  <AdjustmentsForm
                    data={adjustmentsData || {
                      subjectPropertyId: appraisal.property_id,
                      propertyType: appraisal.property_type,
                      defaultRates: {},
                      comparables: [],
                      autoSyncToDirectComparison: true
                    }}
                    onChange={handleAdjustmentsChange}
                    directComparisonData={sectionsDataRef.current.methode_parite || {}}
                    propertyType={appraisal.property_type}
                    effectiveDate={appraisal.effective_date}
                    onSyncToDirectComparison={handleSyncToDirectComparison}
                    onClose={() => setCurrentToolTab(-1)}
                    measurementSystem={sectionsDataRef.current.methode_parite?.measurementSystem || 'imperial'}
                  />
                </Box>
              )}
            </>
          )}
        </Card>
      </Box>
    </MaterialDashboardLayout>
  );
}
