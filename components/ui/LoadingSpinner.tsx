import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingSpinnerProps {
  size?: number
  message?: string
  fullScreen?: boolean
  color?: 'primary' | 'secondary' | 'inherit'
}

export function LoadingSpinner({
  size = 40,
  message = 'Chargement...',
  fullScreen = false,
  color = 'primary'
}: LoadingSpinnerProps) {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  )

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {content}
      </Box>
    )
  }

  return content
}