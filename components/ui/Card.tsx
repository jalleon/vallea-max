import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material'
import { ReactNode } from 'react'

interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Card({ title, action, children, footer, ...props }: CardProps) {
  return (
    <MuiCard {...props}>
      {(title || action) && (
        <CardHeader
          title={title}
          action={action}
          sx={{
            pb: title ? 1 : 0,
          }}
        />
      )}
      <CardContent
        sx={{
          pt: title ? 0 : 2,
          '&:last-child': {
            pb: footer ? 1 : 2,
          },
        }}
      >
        {children}
      </CardContent>
      {footer && (
        <CardActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0,
            justifyContent: 'flex-end',
          }}
        >
          {footer}
        </CardActions>
      )}
    </MuiCard>
  )
}