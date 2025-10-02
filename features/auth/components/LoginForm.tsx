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
  IconButton
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { SignInCredentials } from '../types/auth.types'
import NextLink from 'next/link'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, loading, error } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data as SignInCredentials)
    } catch (err) {
      // Error is handled by the auth context
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
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Vallea Max
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plateforme d'évaluation immobilière
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box display="flex" flexDirection="column" gap={3}>
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting || loading}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Box>
          </form>

          <Box textAlign="center" mt={3}>
            <Link
              component={NextLink}
              href="/reset-password"
              variant="body2"
              underline="hover"
            >
              Mot de passe oublié ?
            </Link>
          </Box>

          <Box textAlign="center" mt={3} pt={3} borderTop="1px solid" borderColor="divider">
            <Typography variant="body2" color="text.secondary">
              Vous n'avez pas de compte ?{' '}
              <Link
                component={NextLink}
                href="/signup"
                underline="hover"
                fontWeight="medium"
              >
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}