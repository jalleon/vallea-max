'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  LinearProgress,
  Divider,
  Collapse
} from '@mui/material';
import {
  Search,
  CheckCircle,
  RadioButtonUnchecked,
  Warning,
  ExpandMore,
  ExpandLess,
  Description,
  Build,
  Calculate,
  Settings
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { TemplateType } from '../types/evaluation.types';
import { AIC_FORM_SECTION_GROUPS } from '../constants/evaluation.constants';

interface Section {
  id: string;
  label: string;
  completed?: boolean;
}

interface SectionsSidebarProps {
  sections: string[];
  sectionsData: any;
  currentSectionIndex: number;
  onSectionClick: (index: number) => void;
  templateType: TemplateType;
  completionPercentage: number;
  onToolClick?: (toolIndex: number) => void;
  currentToolIndex?: number;
}

export default function SectionsSidebar({
  sections,
  sectionsData,
  currentSectionIndex,
  onSectionClick,
  templateType,
  completionPercentage,
  onToolClick,
  currentToolIndex = -1
}: SectionsSidebarProps) {
  const t = useTranslations('evaluations.sections');
  const tSidebar = useTranslations('evaluations.sidebar');
  const tGroups = useTranslations('evaluations.sidebarGroups');
  const tTools = useTranslations('evaluations.tools');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    main: true,
    property: true,
    valuation: true,
    conclusion: true,
    tools: true
  });

  // Helper to get section label - use translations for all sections
  const getSectionLabel = useCallback((sectionId: string): string => {
    // Use translations for all sections (including AIC form sections)
    const translated = t(sectionId as any);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== sectionId) {
      return translated;
    }
    // Fallback to ID
    return sectionId;
  }, [t]);

  // Group sections by category
  const groupedSections = useMemo(() => {
    const groups: Record<string, Section[]> = {
      main: [],
      property: [],
      valuation: [],
      conclusion: [],
      other: []
    };

    // For AIC_FORM template, use the predefined groups
    if (templateType === 'AIC_FORM') {
      const aicGroupMapping: Record<string, keyof typeof groups> = {
        'property_details': 'property',
        'valuation_methods': 'valuation',
        'conclusion_certification': 'conclusion',
        'additional_sections': 'other'
      };

      AIC_FORM_SECTION_GROUPS.forEach((group) => {
        const targetGroup = aicGroupMapping[group.id] || 'other';
        group.sections.forEach((sectionId) => {
          if (sections.includes(sectionId)) {
            groups[targetGroup].push({
              id: sectionId,
              label: getSectionLabel(sectionId),
              completed: sectionsData[sectionId]?.completed || false
            });
          }
        });
      });

      return groups;
    }

    sections.forEach((sectionId) => {
      const section: Section = {
        id: sectionId,
        label: getSectionLabel(sectionId),
        completed: sectionsData[sectionId]?.completed || false
      };

      // Categorize sections (can be customized per template)
      if ([
        'client',
        'evaluateur',
        'client_evaluateur',
        'presentation',
        // AIC Form - Main sections
        'transmittal_letter',
        'executive_summary',
        'assignment'
      ].includes(sectionId)) {
        groups.main.push(section);
      } else if ([
        'sujet',
        'propriete_evaluee',
        'fiche_reference',
        'general',
        'description',
        'ameliorations',
        'repartitions_pieces',
        // AIC Form - Property sections
        'subject_property',
        'site',
        'improvements'
      ].includes(sectionId)) {
        groups.property.push(section);
      } else if ([
        'methode_parite',
        'technique_parite',
        'cout_parite',
        'methode_cout',
        'techniques_cout',
        'methode_revenu',
        'loyer_marchand',
        'loyers',
        'calcul_revenu',
        'conciliation',
        'conciliation_estimation',
        // AIC Form - Valuation sections
        'highest_best_use',
        'direct_comparison_approach',
        'cost_approach',
        'income_approach',
        'market_rent',
        'reconciliation'
      ].includes(sectionId)) {
        groups.valuation.push(section);
      } else if ([
        'exec_summary',
        'conclusion_comparaison',
        'certification',
        'signature',
        'reserves_hypotheses',
        // AIC Form - Conclusion sections
        'scope_certification',
        'hypothetical_conditions',
        'extraordinary_items'
      ].includes(sectionId)) {
        groups.conclusion.push(section);
      } else {
        // AIC Form - Addenda sections go to 'other' group (Additional Sections)
        groups.other.push(section);
      }
    });

    return groups;
  }, [sections, sectionsData, t, templateType, getSectionLabel]);

  // Filter sections based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedSections;

    const query = searchQuery.toLowerCase();
    const filtered: typeof groupedSections = {
      main: [],
      property: [],
      valuation: [],
      conclusion: [],
      other: []
    };

    Object.entries(groupedSections).forEach(([groupKey, groupSections]) => {
      filtered[groupKey as keyof typeof filtered] = groupSections.filter((section) =>
        section.label.toLowerCase().includes(query) ||
        section.id.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [groupedSections, searchQuery]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const getSectionIcon = (section: Section) => {
    if (section.completed) {
      return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
    }
    const hasData = sectionsData[section.id] && Object.keys(sectionsData[section.id]).length > 1; // More than just 'completed' field
    if (hasData) {
      return <Warning sx={{ fontSize: 20, color: 'warning.main' }} />;
    }
    return <RadioButtonUnchecked sx={{ fontSize: 20, color: 'action.disabled' }} />;
  };

  const getGroupLabel = (groupKey: string) => {
    // Use translated labels from sidebarGroups
    return tGroups(groupKey as any);
  };

  const getGroupStats = (groupSections: Section[]) => {
    const completed = groupSections.filter((s) => s.completed).length;
    const total = groupSections.length;
    return { completed, total };
  };

  const renderToolsGroup = () => {
    if (!onToolClick) return null;

    const isExpanded = expandedGroups['tools'];
    const tools = [
      { id: 0, label: tTools('adjustmentsCalculator'), icon: <Calculate sx={{ fontSize: 20 }} /> },
      { id: 1, label: tTools('effectiveAgeCalculator'), icon: <Build sx={{ fontSize: 20 }} /> }
    ];

    return (
      <Box key="tools">
        <ListItemButton
          onClick={() => toggleGroup('tools')}
          sx={{
            borderRadius: '8px',
            mb: 0.5,
            background: isExpanded
              ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #10b981 100%)'
              : 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            color: isExpanded ? 'white' : 'text.primary',
            boxShadow: isExpanded ? 1 : 0,
            border: isExpanded ? 'none' : '1px solid',
            borderColor: isExpanded ? 'transparent' : 'divider',
            '&:hover': {
              background: isExpanded
                ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #059669 100%)'
                : 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(16, 185, 129, 0.15) 100%)',
              boxShadow: isExpanded ? 2 : 0
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <Settings sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={getGroupLabel('tools')}
            primaryTypographyProps={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'inherit'
            }}
          />
        </ListItemButton>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 1 }}>
            {tools.map((tool) => {
              const isActive = tool.id === currentToolIndex;

              return (
                <ListItemButton
                  key={tool.id}
                  onClick={() => onToolClick(tool.id)}
                  selected={isActive}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    pl: 3,
                    py: 1,
                    minHeight: 42,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'inherit'
                      }
                    },
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {tool.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={tool.label}
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      noWrap: true,
                      color: isActive ? 'inherit' : 'text.primary'
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  const renderSectionGroup = (groupKey: string, groupSections: Section[]) => {
    if (groupSections.length === 0) return null;

    const stats = getGroupStats(groupSections);
    const isExpanded = expandedGroups[groupKey];

    return (
      <Box key={groupKey} sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => toggleGroup(groupKey)}
          sx={{
            borderRadius: '8px',
            mb: 0.5,
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
          <ListItemText
            primary={getGroupLabel(groupKey)}
            secondary={`${stats.completed} / ${stats.total} completed`}
            primaryTypographyProps={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'text.primary'
            }}
            secondaryTypographyProps={{
              fontSize: '11px'
            }}
          />
        </ListItemButton>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 1 }}>
            {groupSections.map((section, idx) => {
              const sectionIndex = sections.indexOf(section.id);
              const isActive = sectionIndex === currentSectionIndex;

              return (
                <ListItemButton
                  key={section.id}
                  onClick={() => onSectionClick(sectionIndex)}
                  selected={isActive}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    pl: 3,
                    py: 1,
                    minHeight: 42,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'inherit'
                      }
                    },
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getSectionIcon(section)}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.label}
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      noWrap: true,
                      color: isActive ? 'inherit' : 'text.primary'
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Description sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
            {tSidebar('sections')}
          </Typography>
        </Box>

        {/* Completion Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {tSidebar('overallProgress')}
            </Typography>
            <Chip
              label={`${completionPercentage}%`}
              size="small"
              color={completionPercentage === 100 ? 'success' : 'default'}
              sx={{ height: 20, fontSize: '11px', fontWeight: 600 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: completionPercentage === 100 ? 'success.main' : 'primary.main'
              }
            }}
          />
        </Box>

        {/* Template Badge */}
        <Chip
          label={templateType}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontSize: '11px', fontWeight: 600 }}
        />
      </Box>

      {/* Tools Section - At the top for quick access */}
      {onToolClick && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          {renderToolsGroup()}
        </Box>
      )}

      {/* Search */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={tSidebar('searchSections')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: '13px',
              borderRadius: '8px',
              bgcolor: 'background.default'
            }
          }}
        />
      </Box>

      {/* Sections List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List disablePadding>
          {renderSectionGroup('main', filteredGroups.main)}
          {renderSectionGroup('property', filteredGroups.property)}
          {renderSectionGroup('valuation', filteredGroups.valuation)}
          {renderSectionGroup('conclusion', filteredGroups.conclusion)}
          {renderSectionGroup('other', filteredGroups.other)}
        </List>

        {/* No results */}
        {searchQuery && Object.values(filteredGroups).every((group) => group.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {tSidebar('noSectionsFound')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer - Legend */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          {tSidebar('legend')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              {tSidebar('completed')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" color="text.secondary">
              {tSidebar('inProgress')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadioButtonUnchecked sx={{ fontSize: 16, color: 'action.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {tSidebar('notStarted')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
