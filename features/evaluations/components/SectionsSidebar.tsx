'use client';

import { useState, useMemo } from 'react';
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
  Description
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { TemplateType } from '../types/evaluation.types';

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
}

export default function SectionsSidebar({
  sections,
  sectionsData,
  currentSectionIndex,
  onSectionClick,
  templateType,
  completionPercentage
}: SectionsSidebarProps) {
  const t = useTranslations('evaluations.sections');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    main: true,
    property: true,
    valuation: true,
    conclusion: true
  });

  // Group sections by category
  const groupedSections = useMemo(() => {
    const groups: Record<string, Section[]> = {
      main: [],
      property: [],
      valuation: [],
      conclusion: [],
      other: []
    };

    sections.forEach((sectionId) => {
      const section: Section = {
        id: sectionId,
        label: t(sectionId as any, sectionId),
        completed: sectionsData[sectionId]?.completed || false
      };

      // Categorize sections (can be customized per template)
      if (['client', 'evaluateur', 'client_evaluateur', 'presentation'].includes(sectionId)) {
        groups.main.push(section);
      } else if (['sujet', 'propriete_evaluee', 'fiche_reference', 'description', 'ameliorations', 'repartitions_pieces'].includes(sectionId)) {
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
        'conciliation_estimation'
      ].includes(sectionId)) {
        groups.valuation.push(section);
      } else if ([
        'exec_summary',
        'conclusion_comparaison',
        'certification',
        'signature',
        'reserves_hypotheses'
      ].includes(sectionId)) {
        groups.conclusion.push(section);
      } else {
        groups.other.push(section);
      }
    });

    return groups;
  }, [sections, sectionsData, t]);

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
    switch (groupKey) {
      case 'main':
        return 'Client & Appraiser Info';
      case 'property':
        return 'Property Details';
      case 'valuation':
        return 'Valuation Methods';
      case 'conclusion':
        return 'Conclusion & Certification';
      case 'other':
        return 'Additional Sections';
      default:
        return groupKey;
    }
  };

  const getGroupStats = (groupSections: Section[]) => {
    const completed = groupSections.filter((s) => s.completed).length;
    const total = groupSections.length;
    return { completed, total };
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
                      noWrap: true
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
            Sections
          </Typography>
        </Box>

        {/* Completion Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Overall Progress
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

      {/* Search */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search sections..."
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
              No sections found
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer - Legend */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          Legend
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              Completed
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" color="text.secondary">
              In Progress
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadioButtonUnchecked sx={{ fontSize: 16, color: 'action.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              Not Started
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
