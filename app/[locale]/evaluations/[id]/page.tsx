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
import { NAS_SECTIONS, RPS_SECTIONS, CUSTOM_SECTIONS, AIC_FORM_SECTIONS } from '@/features/evaluations/constants/evaluation.constants';
import AppraisalSectionForm from '@/features/evaluations/components/AppraisalSectionForm';
import AdjustmentsForm from '@/features/evaluations/components/AdjustmentsForm';
import EffectiveAgeCalculator from '@/features/evaluations/components/EffectiveAgeCalculator';
import AppraisalLayout from '@/features/evaluations/components/AppraisalLayout';
import SectionsSidebar from '@/features/evaluations/components/SectionsSidebar';
import LivePreview from '@/features/evaluations/components/LivePreview';
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
  const id = params?.id as string;
  const t = useTranslations('evaluations.detail');
  const tSections = useTranslations('evaluations.sections');
  const tEval = useTranslations('evaluations');
  const tTemplates = useTranslations('evaluations.templates');
  const tPropertyTypes = useTranslations('evaluations.propertyTypes');

  const [appraisal, setAppraisal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [currentTab, setCurrentTab] = useState(0);
  const [currentToolTab, setCurrentToolTab] = useState(-1); // -1 = no tool tab selected
  const [adjustmentsReloadKey, setAdjustmentsReloadKey] = useState(0); // Force reload counter
  const [sectionsData, setSectionsData] = useState<any>({});
  const [adjustmentsData, setAdjustmentsData] = useState<any>(null);
  const [effectiveAgeData, setEffectiveAgeData] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveEffectiveAgeTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Increment adjustments reload key when the Adjustments Calculator tab is opened
  useEffect(() => {
    if (currentToolTab === 0) {
      setAdjustmentsReloadKey(prev => prev + 1);
    }
  }, [currentToolTab]);

  const getSections = () => {
    if (!appraisal) return [];

    switch (appraisal.template_type as TemplateType) {
      case 'NAS':
        return NAS_SECTIONS;
      case 'RPS':
        return RPS_SECTIONS;
      case 'CUSTOM':
        return CUSTOM_SECTIONS;
      case 'AIC_FORM':
        return AIC_FORM_SECTIONS;
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

      // Load effective age data (type assertion needed - field exists in DB but not in generated types yet)
      const loadedEffectiveAgeData = ((data as any).effective_age_data as any) || null;
      console.log('📥 Loading effective_age_data:', loadedEffectiveAgeData);
      setEffectiveAgeData(loadedEffectiveAgeData);

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
        case 'AIC_FORM':
          sections = AIC_FORM_SECTIONS;
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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (saveEffectiveAgeTimerRef.current) {
        clearTimeout(saveEffectiveAgeTimerRef.current);
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

  // Handle section click from sidebar (same logic as handleTabChange)
  const handleSectionClick = (sectionIndex: number) => {
    setCurrentTab(sectionIndex);
    setCurrentToolTab(-1); // Reset tool tab when changing section
    // Update URL with tab parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', sectionIndex.toString());
      window.history.replaceState({}, '', url.toString());
      // Save to localStorage for persistence
      localStorage.setItem(`evaluation-tab-${id}`, sectionIndex.toString());
    }
  };

  const handleToolTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentToolTab(newValue);
  };

  // Handle tool click with toggle behavior
  const handleToolClick = (toolIndex: number) => {
    if (currentToolTab === toolIndex) {
      // If clicking the same tool, close it
      setCurrentToolTab(-1);
    } else {
      // Otherwise, open the tool
      setCurrentToolTab(toolIndex);
    }
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

  const handleEffectiveAgeChange = (data: any) => {
    setEffectiveAgeData(data);

    // Clear existing timer
    if (saveEffectiveAgeTimerRef.current) {
      clearTimeout(saveEffectiveAgeTimerRef.current);
    }

    // Set state to unsaved
    setSaveState('unsaved');

    // Set new timer for auto-save
    if (!isInitialLoad) {
      console.log('⏰ Effective Age auto-save timer set for 2 seconds');
      saveEffectiveAgeTimerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          setSaveState('saving');
          const supabase = createClient();

          console.log('💾 Saving effective_age_data to Supabase:', JSON.stringify(data, null, 2));

          const { error } = await supabase
            .from('appraisals')
            .update({
              effective_age_data: data as any,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (error) {
            console.error('❌ Effective Age save error:', error);
            throw error;
          }

          console.log('✅ Effective Age save successful');
          setSaveState('saved');
        } catch (error) {
          console.error('Error saving effective age data:', error);
          setSaveState('unsaved');
        } finally {
          setSaving(false);
        }
      }, 2000);
    }
  };

  const handleSyncToDirectComparison = () => {
    if (!adjustmentsData || !adjustmentsData.comparables) return;

    // Find the Direct Comparison section in sectionsDataRef (use ref for latest data)
    // Check both methode_parite (residential) and cout_parite (semicommercial)
    let directComparisonSection = sectionsDataRef.current.methode_parite;
    let sectionKey = 'methode_parite';

    if (!directComparisonSection || !directComparisonSection.comparables) {
      // Try cout_parite for semicommercial templates
      directComparisonSection = sectionsDataRef.current.cout_parite;
      sectionKey = 'cout_parite';
    }

    if (!directComparisonSection || !directComparisonSection.comparables) return;

    // Update comparables with calculated totals and percentages ONLY
    // DO NOT overwrite the raw difference adjustment fields (adjustmentLivingArea, adjustmentLotSize, etc.)
    // Those fields show area/numeric differences, not monetary amounts
    const updatedComparables = directComparisonSection.comparables.map((comp: any, index: number) => {
      const adjustmentData = adjustmentsData.comparables[index];
      if (!adjustmentData) return comp;

      // Only update the calculated summary fields
      const newComp = { ...comp };

      // Update total adjustment (sum of all monetary adjustments)
      newComp.totalAdjustment = adjustmentData.totalAdjustment || 0;

      // Update gross and net adjustment percentages
      newComp.grossAdjustmentPercent = adjustmentData.totalAdjustment || 0;
      newComp.netAdjustmentPercent = adjustmentData.totalAdjustment || 0;

      // Update adjusted value (sale price + total adjustment)
      newComp.adjustedValue = adjustmentData.adjustedValue || 0;

      return newComp;
    });

    // Update sections data with new comparables (use the correct section key)
    handleSectionChange(sectionKey, {
      ...directComparisonSection,
      comparables: updatedComparables
    });

    alert('Summary values synced to Direct Comparison table!');
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

  const getPropertyTypeLabel = (propertyType: string) => {
    if (!propertyType) return '';
    return tPropertyTypes(propertyType) || propertyType;
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
      {/* Header - Above Layout */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/evaluations')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          {tEval('backToList')}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
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

            <Typography variant="body2" color="text.secondary">
              {getPropertyTypeLabel(appraisal.property_type)} • {appraisal.address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {appraisal.property_id && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={handleReloadSubjectProperty}
                sx={{ textTransform: 'none', height: 24, fontSize: '0.8125rem', py: 0 }}
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
      </Box>

      {/* NEW LAYOUT - 3 Column */}
      <AppraisalLayout
        appraisalId={id}
        sidebar={
          <SectionsSidebar
            sections={sections}
            sectionsData={sectionsData}
            currentSectionIndex={currentTab}
            onSectionClick={handleSectionClick}
            templateType={appraisal.template_type}
            completionPercentage={completionPercentage}
            onToolClick={handleToolClick}
            currentToolIndex={currentToolTab}
          />
        }
        content={
          <Box>
            {/* Render Current Section or Tool */}
            {currentToolTab === -1 ? (
              // Render current section
              <Box>
                <AppraisalSectionForm
                  sectionId={sections[currentTab]}
                  templateType={appraisal.template_type}
                  data={sectionsData[sections[currentTab]] || {}}
                  onChange={(data) => handleSectionChange(sections[currentTab], data)}
                  subjectPropertyId={appraisal.property_id}
                  subjectPropertyType={appraisal.property_type}
                  reloadTrigger={reloadTrigger}
                  appraisalData={appraisal}
                  allSectionsData={sectionsDataRef.current}
                />
              </Box>
            ) : currentToolTab === 0 ? (
              // Render tool 0: Adjustments Calculator
              <Box>
                <AdjustmentsForm
                  key={`adjustments-${adjustmentsReloadKey}`}
                  data={adjustmentsData || {
                    subjectPropertyId: appraisal.property_id,
                    propertyType: appraisal.property_type,
                    defaultRates: {},
                    comparables: [],
                    autoSyncToDirectComparison: true
                  }}
                  onChange={handleAdjustmentsChange}
                  directComparisonData={
                    sectionsDataRef.current.methode_parite ||
                    sectionsDataRef.current.cout_parite ||
                    {}
                  }
                  propertyType={appraisal.property_type}
                  effectiveDate={appraisal.effective_date}
                  onSyncToDirectComparison={handleSyncToDirectComparison}
                  onClose={() => setCurrentToolTab(-1)}
                  measurementSystem={
                    sectionsDataRef.current.methode_parite?.measurementSystem ||
                    sectionsDataRef.current.cout_parite?.measurementSystem ||
                    'imperial'
                  }
                />
              </Box>
            ) : currentToolTab === 1 ? (
              // Render tool 1: Effective Age Calculator
              <Box>
                <EffectiveAgeCalculator
                  data={effectiveAgeData || {}}
                  onChange={handleEffectiveAgeChange}
                  constructionYear={
                    sectionsDataRef.current.description?.yearBuilt ||
                    sectionsDataRef.current.sujet?.yearBuilt ||
                    undefined
                  }
                  effectiveDate={appraisal.effective_date}
                  onClose={() => setCurrentToolTab(-1)}
                />
              </Box>
            ) : null}
          </Box>
        }
        preview={
          <LivePreview
            appraisalData={appraisal}
            sectionsData={sectionsData}
            templateType={appraisal.template_type}
            currentSectionId={sections[currentTab]}
          />
        }
      />
    </MaterialDashboardLayout>
  );
}
