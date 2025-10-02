'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={3}
        >
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom>
                Une erreur s'est produite
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Désolé, quelque chose s'est mal passé. Veuillez réessayer ou contacter le support si le problème persiste.
              </Typography>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="caption" component="pre">
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                  </Typography>
                </Box>
              )}
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                sx={{ mt: 3 }}
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </Box>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    // You can send this to an error reporting service
  }
}