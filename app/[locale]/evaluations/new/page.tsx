'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import { ArrowBack, Business, Assessment, Settings, Description } from '@mui/icons-material';
import { MaterialDashboardLayout } from '../../../../components/layout/MaterialDashboardLayout';
import AppraisalWizard from '@/features/evaluations/components/AppraisalWizard';
import { TemplateType } from '@/features/evaluations/types/evaluation.types';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export default function NewEvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams?.get('template') as TemplateType | null;
  const t = useTranslations('evaluations');
  const tTemplates = useTranslations('evaluations.templates');
  const tWizard = useTranslations('evaluations.wizard');
  const isCreatingRef = useRef(false);

  const templateOptions = [
    {
      id: 'RPS',
      title: tTemplates('rps.title'),
      subtitle: tTemplates('rps.subtitle'),
      description: tTemplates('rps.description'),
      icon: Business,
      color: 'primary'
    },
    {
      id: 'NAS',
      title: tTemplates('nas.title'),
      subtitle: tTemplates('nas.subtitle'),
      description: tTemplates('nas.description'),
      icon: Assessment,
      color: 'success'
    },
    {
      id: 'AIC_FORM',
      title: tTemplates('aic_form.title'),
      subtitle: tTemplates('aic_form.subtitle'),
      description: tTemplates('aic_form.description'),
      icon: Description,
      color: 'info'
    },
    {
      id: 'CUSTOM',
      title: tTemplates('custom.title'),
      subtitle: tTemplates('custom.subtitle'),
      description: tTemplates('custom.description'),
      icon: Settings,
      color: 'warning'
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    templateParam
  );
  const [creating, setCreating] = useState(false);

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
  };

  const handleComplete = async (data: any) => {
    // Prevent double-clicks using ref (immediate check)
    if (isCreatingRef.current) {
      return;
    }

    isCreatingRef.current = true;
    setCreating(true);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Authentication error:', userError);
        alert('You must be logged in to create an appraisal');
        isCreatingRef.current = false;
        setCreating(false);
        return;
      }

      // Get organization_id from user metadata
      const organizationId = user.user_metadata?.organization_id;

      if (!organizationId) {
        console.error('No organization_id found for user');
        alert('User must belong to an organization');
        isCreatingRef.current = false;
        setCreating(false);
        return;
      }

      // Create the appraisal
      const { data: appraisal, error } = await supabase
        .from('appraisals')
        .insert({
          template_type: data.templateType,
          client_name: data.clientName,
          property_id: data.propertyId || null,
          property_type: data.propertyType,
          property_genre: data.propertyGenre,
          value_type: data.valueType,
          evaluation_objective: data.evaluationObjective,
          effective_date: data.effectiveDate,
          address: data.address || null,
          city: data.city || null,
          postal_code: data.postalCode || null,
          sections_data: {},
          status: 'draft',
          completion_percentage: 0,
          organization_id: organizationId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        alert(`Error creating appraisal: ${error.message}`);
        isCreatingRef.current = false;
        setCreating(false);
        return;
      }

      // Navigate to the appraisal edit page
      router.push(`/evaluations/${appraisal.id}`);
    } catch (error) {
      console.error('Caught error creating appraisal:', error);
      alert('An unexpected error occurred. Please try again.');
      isCreatingRef.current = false;
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <MaterialDashboardLayout>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('backToList')}
          </Button>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            {tWizard('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedTemplate
              ? tWizard('subtitle')
              : tTemplates('title')}
          </Typography>
        </Box>

        {!selectedTemplate ? (
          // Template Selection
          <Grid container spacing={3}>
            {templateOptions.map((template) => {
              const IconComponent = template.icon;
              return (
                <Grid item xs={12} md={4} key={template.id}>
                  <Card
                    onClick={() => handleTemplateSelect(template.id as TemplateType)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: `${template.color}.main`,
                            width: 72,
                            height: 72,
                            mb: 2
                          }}
                        >
                          <IconComponent sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {template.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.subtitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          // Wizard
          <AppraisalWizard
            templateType={selectedTemplate}
            onComplete={handleComplete}
            onCancel={handleCancel}
            creating={creating}
          />
        )}
      </Box>
    </MaterialDashboardLayout>
  );
}