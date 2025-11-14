'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import { TemplateType, WizardStep1Data, WizardStep2Data } from '../types/evaluation.types';
import WizardStep1 from './WizardStep1';
import WizardStep2 from './WizardStep2';
import WizardStep3 from './WizardStep3';
import { useTranslations } from 'next-intl';

interface AppraisalWizardProps {
  templateType: TemplateType;
  onComplete: (data: any) => void;
  onCancel: () => void;
  creating?: boolean;
}

export default function AppraisalWizard({ templateType, onComplete, onCancel, creating = false }: AppraisalWizardProps) {
  const t = useTranslations('evaluations.wizard');
  const [activeStep, setActiveStep] = useState(0);

  const STEPS = [
    t('steps.propertyType'),
    t('steps.basicInfo'),
    t('steps.confirmation')
  ];
  const [step1Data, setStep1Data] = useState<WizardStep1Data>({
    propertyType: null,
    propertyGenre: null
  });
  const [step2Data, setStep2Data] = useState<WizardStep2Data>({
    clientName: '',
    propertyId: null,
    address: '',
    city: '',
    postalCode: '',
    valueType: null,
    evaluationObjective: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    const completeData = {
      templateType,
      ...step1Data,
      ...step2Data
    };
    onComplete(completeData);
  };

  const canProceedStep1 = () => {
    return step1Data.propertyType !== null && step1Data.propertyGenre !== null;
  };

  const canProceedStep2 = () => {
    return (
      step2Data.clientName.trim() !== '' &&
      step2Data.valueType !== null &&
      step2Data.evaluationObjective.trim() !== '' &&
      step2Data.effectiveDate !== '' &&
      (step2Data.propertyId !== null || (step2Data.address && step2Data.address.trim() !== '' && step2Data.city.trim() !== ''))
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <WizardStep1 data={step1Data} onChange={setStep1Data} />;
      case 1:
        return <WizardStep2 data={step2Data} onChange={setStep2Data} />;
      case 2:
        return (
          <WizardStep3
            templateType={templateType}
            step1Data={step1Data}
            step2Data={step2Data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={activeStep === 0 ? onCancel : handleBack}
              startIcon={<ArrowBack />}
              sx={{ textTransform: 'none' }}
            >
              {activeStep === 0 ? t('cancel') : t('back')}
            </Button>

            <Button
              variant="contained"
              onClick={activeStep === STEPS.length - 1 ? handleComplete : handleNext}
              endIcon={
                creating && activeStep === STEPS.length - 1 ? (
                  <CircularProgress size={16} color="inherit" />
                ) : activeStep === STEPS.length - 1 ? (
                  <CheckCircle />
                ) : (
                  <ArrowForward />
                )
              }
              disabled={
                creating ||
                (activeStep === 0 && !canProceedStep1()) ||
                (activeStep === 1 && !canProceedStep2())
              }
              sx={{ textTransform: 'none', px: 4 }}
            >
              {creating && activeStep === STEPS.length - 1 ? t('creating') : activeStep === STEPS.length - 1 ? t('create') : t('next')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}