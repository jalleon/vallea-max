'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { SignUpCredentials } from '../types/auth.types'
import NextLink from 'next/link'

const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmation du mot de passe requise'),
  full_name: z
    .string()
    .min(1, 'Nom complet requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  organization_name: z
    .string()
    .min(1, 'Nom de l\'organisation requis')
    .min(2, 'Le nom de l\'organisation doit contenir au moins 2 caractères')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

type SignupFormData = z.infer<typeof signupSchema>

const steps = ['Informations personnelles', 'Organisation', 'Sécurité']

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const { signUp, loading, error } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    getValues
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { confirmPassword, ...credentials } = data
      await signUp(credentials as SignUpCredentials)
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignupFormData)[] = []

    switch (activeStep) {
      case 0:
        fieldsToValidate = ['full_name', 'email']
        break
      case 1:
        fieldsToValidate = ['organization_name']
        break
      case 2:
        fieldsToValidate = ['password', 'confirmPassword']
        break
    }

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              {...register('full_name')}
              label="Nom complet"
              fullWidth
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )

      case 1:
        return (
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              {...register('organization_name')}
              label="Nom de l'organisation"
              fullWidth
              error={!!errors.organization_name}
              helperText={errors.organization_name?.message || 'Le nom de votre entreprise ou organisation'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )

      case 2:
        return (
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              {...register('password')}
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              {...register('confirmPassword')}
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Rejoindre Vallea Max
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez votre compte professionnel
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Création...' : 'Créer le compte'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                >
                  Suivant
                </Button>
              )}
            </Box>
          </form>

          <Box textAlign="center" mt={3} pt={3} borderTop="1px solid" borderColor="divider">
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{' '}
              <Link
                component={NextLink}
                href="/login"
                underline="hover"
                fontWeight="medium"
              >
                Se connecter
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}