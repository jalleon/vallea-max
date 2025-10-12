'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Assessment,
  Speed,
  Security,
  TrendingUp,
  Groups,
  Cloud,
  CheckCircle,
  ArrowForward,
  Menu as MenuIcon,
  PictureAsPdf,
  SmartToy,
  Dashboard,
  Search,
  CompareArrows,
  Description,
  Language as LanguageIcon,
} from '@mui/icons-material'

export default function LandingPage() {
  const t = useTranslations('landing')
  const tPricing = useTranslations('pricing')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null)

  const features = [
    {
      icon: <SmartToy sx={{ fontSize: 48 }} />,
      title: t('features.aiPdf.title'),
      description: t('features.aiPdf.description'),
      highlight: true,
    },
    {
      icon: <Dashboard sx={{ fontSize: 48 }} />,
      title: t('features.propertyLibrary.title'),
      description: t('features.propertyLibrary.description'),
    },
    {
      icon: <Assessment sx={{ fontSize: 48 }} />,
      title: t('features.inspections.title'),
      description: t('features.inspections.description'),
    },
    {
      icon: <CompareArrows sx={{ fontSize: 48 }} />,
      title: t('features.comparables.title'),
      description: t('features.comparables.description'),
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
    },
    {
      icon: <Cloud sx={{ fontSize: 48 }} />,
      title: t('features.cloud.title'),
      description: t('features.cloud.description'),
    },
  ]

  const benefits = [
    t('benefits.unlimited'),
    t('benefits.reporting'),
    t('benefits.support'),
    t('benefits.mobile'),
    t('benefits.export'),
    t('benefits.updates'),
  ]

  const handleScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget)
  }

  const handleLanguageClose = () => {
    setLangMenuAnchor(null)
  }

  const handleLanguageChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
    handleLanguageClose()
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1, gap: 1.5 }}>
              <Image
                src="/logo.png"
                alt="Valea Max"
                width={40}
                height={40}
                style={{ borderRadius: '8px', marginTop: '-4px' }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'var(--font-montserrat)',
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2,
                  }}
                >
                  Valea Max
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    color: '#4A5568',
                    fontSize: '0.7rem',
                    letterSpacing: '0.03em',
                    display: 'block',
                    mt: -0.5,
                  }}
                >
                  {locale === 'fr' ? 'Évaluation immobilière' : 'Real Estate Valuation'}
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('features')}
                  sx={{ color: 'text.primary' }}
                >
                  {t('nav.features')}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('screenshots')}
                  sx={{ color: 'text.primary' }}
                >
                  {t('nav.screenshots')}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('pricing')}
                  sx={{ color: 'text.primary' }}
                >
                  {t('nav.pricing')}
                </Button>
              </Stack>
            )}

            {/* Auth Buttons */}
            {!isMobile ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  {t('nav.signup')}
                </Button>
              </Stack>
            ) : (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleScroll('features')}>
                <ListItemText primary={t('nav.features')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleScroll('screenshots')}>
                <ListItemText primary={t('nav.screenshots')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleScroll('pricing')}>
                <ListItemText primary={t('nav.pricing')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/login')}>
                <ListItemText primary={t('nav.login')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/login')}>
                <ListItemText
                  primary={t('nav.signup')}
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, #1A1F36 0%, #232A44 50%, #2D3561 100%)`,
          color: 'white',
          pt: { xs: 16, md: 20 },
          pb: { xs: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(90deg, rgba(232, 226, 213, 0.03) 0px, transparent 1px, transparent 40px, rgba(232, 226, 213, 0.03) 41px),
              repeating-linear-gradient(0deg, rgba(232, 226, 213, 0.03) 0px, transparent 1px, transparent 40px, rgba(232, 226, 213, 0.03) 41px),
              radial-gradient(ellipse at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 60%)
            `,
            filter: 'url(#noise)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(to top, rgba(232, 226, 213, 0.05) 0%, transparent 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* SVG Noise Filter */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend mode="multiply" in2="SourceGraphic" />
            </filter>
          </defs>
        </svg>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7} textAlign={{ xs: 'center', md: 'left' }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 400,
                  mb: 3,
                  lineHeight: 1.15,
                  fontFamily: 'var(--font-fraunces)',
                  letterSpacing: '-0.02em',
                }}
              >
                {t('hero.title')}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  opacity: 0.85,
                  fontWeight: 300,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {t('hero.subtitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    bgcolor: '#10B981',
                    color: 'white',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                    '&:hover': {
                      bgcolor: '#0ea570',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  endIcon={<ArrowForward />}
                >
                  {t('hero.cta.primary')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/pricing')}
                  sx={{
                    borderColor: 'rgba(232, 226, 213, 0.5)',
                    borderWidth: 1.5,
                    color: '#E8E2D5',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      borderColor: '#E8E2D5',
                      borderWidth: 1.5,
                      bgcolor: 'rgba(232, 226, 213, 0.1)',
                    },
                  }}
                >
                  {t('hero.cta.secondary')}
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              {/* Placeholder for future hero visualization */}
              <Box
                sx={{
                  height: 400,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(232, 226, 213, 0.1)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Assessment sx={{ fontSize: 120, color: 'rgba(232, 226, 213, 0.3)' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        sx={{
          background: 'linear-gradient(to bottom, #E8E2D5 0%, #F5F3EE 50%, #E8E2D5 100%)',
          py: { xs: 8, md: 14 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 15% 30%, rgba(16, 185, 129, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 85% 70%, rgba(245, 158, 11, 0.04) 0%, transparent 40%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                fontFamily: 'var(--font-fraunces)',
                color: '#1A1F36',
                letterSpacing: '-0.01em',
              }}
            >
              {t('features.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 650,
                mx: 'auto',
                color: '#4A5568',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
              }}
            >
              {t('features.subtitle')}
            </Typography>
          </Box>

        <Grid container spacing={4}>
          {features.map((feature: any, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: feature.highlight
                    ? '1.5px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(26, 31, 54, 0.08)',
                  position: 'relative',
                  background: feature.highlight
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  boxShadow: feature.highlight
                    ? '0 8px 32px rgba(16, 185, 129, 0.12)'
                    : '0 4px 16px rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)',
                    border: `1.5px solid ${feature.highlight ? 'rgba(16, 185, 129, 0.5)' : 'rgba(26, 31, 54, 0.15)'}`,
                  },
                }}
              >
                {feature.highlight && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      px: 2.5,
                      py: 0.75,
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      zIndex: 1,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    {t('features.newBadge')}
                  </Box>
                )}
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: feature.highlight ? '#10B981' : '#4F46E5',
                      mb: 3,
                      display: 'inline-flex',
                      p: 2.5,
                      borderRadius: '16px',
                      background: feature.highlight
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{
                      color: '#1A1F36',
                      mb: 1.5,
                      fontSize: '1.15rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#4A5568',
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>

      {/* Screenshots Section */}
      <Box
        id="screenshots"
        sx={{
          background: 'linear-gradient(135deg, #1A1F36 0%, #232A44 50%, #2D3561 100%)',
          py: { xs: 8, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(90deg, rgba(232, 226, 213, 0.02) 0px, transparent 1px, transparent 50px, rgba(232, 226, 213, 0.02) 51px),
              repeating-linear-gradient(0deg, rgba(232, 226, 213, 0.02) 0px, transparent 1px, transparent 50px, rgba(232, 226, 213, 0.02) 51px),
              radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(124, 58, 237, 0.06) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                color: '#E8E2D5',
                fontFamily: 'var(--font-fraunces)',
                letterSpacing: '-0.01em',
              }}
            >
              {t('screenshots.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                color: 'rgba(232, 226, 213, 0.75)',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
              }}
            >
              {t('screenshots.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  background: 'rgba(232, 226, 213, 0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232, 226, 213, 0.15)',
                  borderRadius: '16px',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(232, 226, 213, 0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 300,
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                  }}
                >
                  <Dashboard sx={{ fontSize: 100, color: 'rgba(232, 226, 213, 0.4)' }} />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#E8E2D5' }}>
                    {t('screenshots.library.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232, 226, 213, 0.7)', lineHeight: 1.7 }}>
                    {t('screenshots.library.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  background: 'rgba(232, 226, 213, 0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232, 226, 213, 0.15)',
                  borderRadius: '16px',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(232, 226, 213, 0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 300,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                  }}
                >
                  <Assessment sx={{ fontSize: 100, color: 'rgba(232, 226, 213, 0.4)' }} />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#E8E2D5' }}>
                    {t('screenshots.inspection.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232, 226, 213, 0.7)', lineHeight: 1.7 }}>
                    {t('screenshots.inspection.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  background: 'rgba(232, 226, 213, 0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232, 226, 213, 0.15)',
                  borderRadius: '16px',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(232, 226, 213, 0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 300,
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                  }}
                >
                  <PictureAsPdf sx={{ fontSize: 100, color: 'rgba(232, 226, 213, 0.4)' }} />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#E8E2D5' }}>
                    {t('screenshots.pdfReader.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232, 226, 213, 0.7)', lineHeight: 1.7 }}>
                    {t('screenshots.pdfReader.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  background: 'rgba(232, 226, 213, 0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232, 226, 213, 0.15)',
                  borderRadius: '16px',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(232, 226, 213, 0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 300,
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(109, 40, 217, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                  }}
                >
                  <Description sx={{ fontSize: 100, color: 'rgba(232, 226, 213, 0.4)' }} />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#E8E2D5' }}>
                    {t('screenshots.reports.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232, 226, 213, 0.7)', lineHeight: 1.7 }}>
                    {t('screenshots.reports.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        id="pricing"
        sx={{
          background: 'linear-gradient(to bottom, #E8E2D5 0%, #F5F3EE 50%, #E8E2D5 100%)',
          py: { xs: 8, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.04) 0%, transparent 45%),
              radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.04) 0%, transparent 45%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                color: '#1A1F36',
                fontFamily: 'var(--font-fraunces)',
                letterSpacing: '-0.01em',
              }}
            >
              {tPricing('title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                color: '#4A5568',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
              }}
            >
              {tPricing('subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Monthly Plan */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  borderRadius: '16px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)',
                    border: '1px solid rgba(26, 31, 54, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    gutterBottom
                    align="center"
                    sx={{ color: '#1A1F36', mb: 3 }}
                  >
                    {tPricing('monthly')}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography variant="h2" fontWeight={600} component="span" sx={{ color: '#1A1F36' }}>
                      100$
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4A5568' }} component="span">
                      {' '}/ {tPricing('month')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                      CAD
                    </Typography>
                  </Box>
                  <Stack spacing={2.5} sx={{ my: 4 }}>
                    {benefits.map((benefit, index) => (
                      <Stack direction="row" spacing={2} key={index}>
                        <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                        <Typography variant="body2" sx={{ color: '#4A5568', lineHeight: 1.7 }}>
                          {benefit}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => router.push('/login')}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      borderColor: '#1A1F36',
                      color: '#1A1F36',
                      '&:hover': {
                        borderColor: '#10B981',
                        bgcolor: 'rgba(16, 185, 129, 0.05)',
                      },
                    }}
                  >
                    {tPricing('getStarted')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Annual Plan */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 48px rgba(16, 185, 129, 0.2)',
                    border: '1.5px solid rgba(16, 185, 129, 0.5)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    px: 3,
                    py: 0.75,
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    zIndex: 1,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {tPricing('popular')}
                </Box>
                <CardContent sx={{ p: 5 }}>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    gutterBottom
                    align="center"
                    sx={{ color: '#1A1F36', mb: 3 }}
                  >
                    {tPricing('annual')}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography variant="h2" fontWeight={600} component="span" sx={{ color: '#10B981' }}>
                      80$
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4A5568' }} component="span">
                      {' '}/ {tPricing('month')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, mt: 1 }}>
                      960$ {tPricing('billedAnnually')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      CAD
                    </Typography>
                  </Box>
                  <Stack spacing={2.5} sx={{ my: 4 }}>
                    {benefits.map((benefit, index) => (
                      <Stack direction="row" spacing={2} key={index}>
                        <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                        <Typography variant="body2" sx={{ color: '#4A5568', lineHeight: 1.7 }}>
                          {benefit}
                        </Typography>
                      </Stack>
                    ))}
                    <Stack direction="row" spacing={2}>
                      <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#10B981', lineHeight: 1.7 }}>
                        {tPricing('save240')}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => router.push('/login')}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
                      },
                    }}
                  >
                    {tPricing('getStarted')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 6 }}
          >
            {tPricing('footer')}
          </Typography>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A1F36 0%, #232A44 50%, #2D3561 100%)',
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 400,
              mb: 3,
              color: '#E8E2D5',
              fontFamily: 'var(--font-fraunces)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('cta.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              maxWidth: 600,
              mx: 'auto',
              color: 'rgba(232, 226, 213, 0.8)',
              fontWeight: 300,
              fontSize: '1.15rem',
              lineHeight: 1.7,
            }}
          >
            {t('cta.subtitle')}
          </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 500,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
            endIcon={<ArrowForward />}
          >
            {t('cta.primary')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => handleScroll('pricing')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 500,
              borderRadius: '8px',
              borderColor: 'rgba(232, 226, 213, 0.5)',
              borderWidth: 1.5,
              color: '#E8E2D5',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                borderColor: '#E8E2D5',
                borderWidth: 1.5,
                bgcolor: 'rgba(232, 226, 213, 0.1)',
              },
            }}
          >
            {t('cta.secondary')}
          </Button>
        </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#0F1419',
          color: '#E8E2D5',
          pt: 8,
          pb: 4,
          borderTop: '1px solid rgba(232, 226, 213, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="Valea Max"
                    width={44}
                    height={44}
                    style={{ borderRadius: '8px', position: 'relative', zIndex: 1 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-montserrat)',
                      fontWeight: 700,
                      color: '#E8E2D5',
                      fontSize: '1.1rem',
                      lineHeight: 1.2,
                    }}
                  >
                    Valea Max
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(232, 226, 213, 0.6)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.03em',
                      display: 'block',
                    }}
                  >
                    {locale === 'fr' ? 'Évaluation immobilière' : 'Real Estate Valuation'}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(232, 226, 213, 0.6)',
                  lineHeight: 1.7,
                  fontSize: '0.9rem',
                }}
              >
                {locale === 'fr'
                  ? 'Plateforme professionnelle d\'évaluation immobilière avec intelligence artificielle.'
                  : 'Professional real estate appraisal platform with artificial intelligence.'}
              </Typography>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: '#E8E2D5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                }}
              >
                {locale === 'fr' ? 'Navigation' : 'Navigation'}
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  onClick={() => handleScroll('features')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(232, 226, 213, 0.6)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    p: 0,
                    minWidth: 0,
                    '&:hover': {
                      color: '#10B981',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {t('nav.features')}
                </Button>
                <Button
                  onClick={() => handleScroll('screenshots')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(232, 226, 213, 0.6)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    p: 0,
                    minWidth: 0,
                    '&:hover': {
                      color: '#10B981',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {t('nav.screenshots')}
                </Button>
                <Button
                  onClick={() => handleScroll('pricing')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(232, 226, 213, 0.6)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    p: 0,
                    minWidth: 0,
                    '&:hover': {
                      color: '#10B981',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {t('nav.pricing')}
                </Button>
              </Stack>
            </Grid>

            {/* Account Links */}
            <Grid item xs={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: '#E8E2D5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                }}
              >
                {locale === 'fr' ? 'Compte' : 'Account'}
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  onClick={() => router.push('/login')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(232, 226, 213, 0.6)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    p: 0,
                    minWidth: 0,
                    '&:hover': {
                      color: '#10B981',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(232, 226, 213, 0.6)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    p: 0,
                    minWidth: 0,
                    '&:hover': {
                      color: '#10B981',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {t('nav.signup')}
                </Button>
              </Stack>
            </Grid>

            {/* Language Toggle */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: '#E8E2D5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                }}
              >
                {locale === 'fr' ? 'Langue' : 'Language'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() => handleLanguageChange('fr')}
                  variant={locale === 'fr' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<LanguageIcon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    ...(locale === 'fr' ? {
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                      },
                    } : {
                      borderColor: 'rgba(232, 226, 213, 0.3)',
                      color: 'rgba(232, 226, 213, 0.6)',
                      '&:hover': {
                        borderColor: '#10B981',
                        color: '#10B981',
                        bgcolor: 'rgba(16, 185, 129, 0.05)',
                      },
                    }),
                  }}
                >
                  Français
                </Button>
                <Button
                  onClick={() => handleLanguageChange('en')}
                  variant={locale === 'en' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<LanguageIcon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    ...(locale === 'en' ? {
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                      },
                    } : {
                      borderColor: 'rgba(232, 226, 213, 0.3)',
                      color: 'rgba(232, 226, 213, 0.6)',
                      '&:hover': {
                        borderColor: '#10B981',
                        color: '#10B981',
                        bgcolor: 'rgba(16, 185, 129, 0.05)',
                      },
                    }),
                  }}
                >
                  English
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Bottom Bar */}
          <Box
            sx={{
              pt: 4,
              borderTop: '1px solid rgba(232, 226, 213, 0.1)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(232, 226, 213, 0.5)',
                fontSize: '0.85rem',
                letterSpacing: '0.02em',
              }}
            >
              © {new Date().getFullYear()} Valea Max. {t('footer.rights')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Language Menu */}
      <Menu
        anchorEl={langMenuAnchor}
        open={Boolean(langMenuAnchor)}
        onClose={handleLanguageClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <MenuItem onClick={() => handleLanguageChange('fr')}>
          Français
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('en')}>
          English
        </MenuItem>
      </Menu>
    </Box>
  )
}
