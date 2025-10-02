'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Bleu professionnel
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0f766e', // Vert teal
      light: '#14b8a6',
      dark: '#0d9488',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c'
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309'
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857'
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1e293b'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1e293b'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1e293b'
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1e293b'
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1e293b'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1e293b'
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#64748b'
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#64748b'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#475569'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748b'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e2e8f0',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #e2e8f0'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px'
          }
        }
      }
    }
  }
})