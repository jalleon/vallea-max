import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material'
import { forwardRef } from 'react'

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean
  loadingText?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading = false, loadingText, disabled, startIcon, ...props }, ref) => {
    return (
      <MuiButton
        ref={ref}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={16} /> : startIcon}
        {...props}
      >
        {loading ? (loadingText || 'Chargement...') : children}
      </MuiButton>
    )
  }
)

Button.displayName = 'Button'