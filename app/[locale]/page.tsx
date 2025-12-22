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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
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
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material'
import WaitlistForm from '@/components/landing/WaitlistForm'
import DemoRequestForm from '@/components/landing/DemoRequestForm'

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')

  // Screenshot carousel states
  const [libraryIndex, setLibraryIndex] = useState(0)
  const [importsIndex, setImportsIndex] = useState(0)
  const [reportsIndex, setReportsIndex] = useState(0)

  // Screenshot image arrays
  const libraryImages = ['/screenshots/PropertyEdit.jpg', '/screenshots/propertyView.jpg', '/screenshots/library.jpg']
  const importsImages = ['/screenshots/imports.jpg', '/screenshots/imports2.jpg']
  const reportsImages = ['/screenshots/evaluation.jpg', '/screenshots/evaluation2.jpg']

  // Toggle to show/hide pricing section (set to true when ready to launch pricing)
  const SHOW_PRICING = false

  const features = [
    {
      icon: <Box component="img" src="/icons/3.png" alt="" sx={{ width: 64, height: 64, objectFit: 'contain' }} />,
      title: t('features.reports.title'),
      description: t('features.reports.description'),
      highlight: true,
    },
    {
      icon: <Box component="img" src="/icons/16.png" alt="" sx={{ width: 64, height: 64, objectFit: 'contain' }} />,
      title: t('features.dataImport.title'),
      description: t('features.dataImport.description'),
    },
    {
      icon: <Box component="img" src="/icons/24.png" alt="" sx={{ width: 64, height: 64, objectFit: 'contain' }} />,
      title: t('features.propertyLibrary.title'),
      description: t('features.propertyLibrary.description'),
    },
    {
      icon: <Box component="img" src="/icons/37.png" alt="" sx={{ width: 64, height: 64, objectFit: 'contain' }} />,
      title: t('features.inspections.title'),
      description: t('features.inspections.description'),
    },
    {
      icon: <Box component="img" src="/icons/46.png" alt="" sx={{ width: 64, height: 64, objectFit: 'contain' }} />,
      title: t('features.comparables.title'),
      description: t('features.comparables.description'),
    },
    {
      icon: <Box component="img" src="/icons/30.png" alt="" sx={{ width: 64, height: 64, objectFit: 'contain' }} />,
      title: t('features.dashboard.title'),
      description: t('features.dashboard.description'),
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
    const newPathname = pathname?.replace(`/${locale}`, `/${newLocale}`) || `/${newLocale}`
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
          borderBottom: `1px solid rgba(26, 31, 54, 0.1)`,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            {/* Logo and Brand */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                flexGrow: 1,
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
                transition: 'opacity 0.2s',
              }}
              onClick={() => router.push(`/${locale}`)}
            >
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
                    whiteSpace: 'nowrap',
                  }}
                >
                  {locale === 'fr' ? 'Évaluation immobilière' : 'Real Estate Valuation'}
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack direction="row" spacing={0.5} sx={{ ml: 3, mr: 2 }}>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('features')}
                  sx={{ color: 'text.primary', lineHeight: 1.2 }}
                >
                  {t('nav.features')}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('screenshots')}
                  sx={{ color: 'text.primary', lineHeight: 1.2 }}
                >
                  {t('nav.screenshots')}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('demo')}
                  sx={{ color: 'text.primary', lineHeight: 1.2 }}
                >
                  {t('nav.pricing')}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('demo')}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {t('nav.demo')}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleScroll('waitlist')}
                  sx={{ color: 'text.primary', lineHeight: 1.2 }}
                >
                  {t('nav.waitlist')}
                </Button>
              </Stack>
            )}

            {/* Auth Buttons */}
            {!isMobile ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/login')}
                  sx={{ textTransform: 'none', lineHeight: 1.2 }}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/login')}
                  sx={{ textTransform: 'none', lineHeight: 1.2 }}
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
              <ListItemButton onClick={() => handleScroll('demo')}>
                <ListItemText primary={t('nav.pricing')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleScroll('demo')}>
                <ListItemText
                  primary={t('nav.demo')}
                  sx={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleScroll('waitlist')}>
                <ListItemText primary={t('nav.waitlist')} />
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
          color: '#E8E2D5',
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
            backgroundImage: 'url(/backgrounds/bg8.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.5)',
            zIndex: 0,
          },
        }}
      >

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
                  color: '#E8E2D5',
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
                  color: '#E8E2D5',
                }}
              >
                {t('hero.subtitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleScroll('demo')}
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
                  onClick={() => handleScroll('waitlist')}
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
              {/* Hero screenshot */}
              <Box
                sx={{
                  height: 400,
                  borderRadius: '16px',
                  border: '1px solid rgba(232, 226, 213, 0.2)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src="/screenshots/dashboard.jpg"
                  alt="Valea Max Dashboard"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top left',
                  }}
                />
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

      {/* How It Works Section */}
      <Box
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
              radial-gradient(circle at 0 0, rgba(232, 226, 213, 0.15) 2.5px, transparent 2.5px),
              radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)
            `,
            backgroundSize: '41px 41px, auto, auto',
            backgroundPosition: '0 -15px, 0 0, 0 0',
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
              {t('howItWorks.title')}
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
              {t('howItWorks.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((step) => (
              <Grid item xs={12} md={6} key={step}>
                <Card
                  sx={{
                    height: '100%',
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
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        mb: 3,
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {step}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      sx={{ color: '#E8E2D5', mb: 1.5 }}
                    >
                      {t(`howItWorks.step${step}.title`)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(232, 226, 213, 0.7)',
                        lineHeight: 1.7,
                        fontSize: '0.95rem',
                      }}
                    >
                      {t(`howItWorks.step${step}.description`)}
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
              repeating-linear-gradient(90deg, rgba(232, 226, 213, 0.08) 0px, transparent 1px, transparent 40px, rgba(232, 226, 213, 0.08) 41px),
              repeating-linear-gradient(0deg, rgba(232, 226, 213, 0.08) 0px, transparent 1px, transparent 40px, rgba(232, 226, 213, 0.08) 41px),
              radial-gradient(ellipse at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 60%)
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
                    position: 'relative',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={libraryImages[libraryIndex]}
                    alt="Property Library"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
                  />
                  {/* Blur overlay for top-right corner */}
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 77, height: 30, backdropFilter: 'blur(8px)', background: 'linear-gradient(to left, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />
                  {/* Navigation arrows */}
                  <IconButton
                    onClick={() => setLibraryIndex((prev) => (prev - 1 + libraryImages.length) % libraryImages.length)}
                    sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    size="small"
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => setLibraryIndex((prev) => (prev + 1) % libraryImages.length)}
                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    size="small"
                  >
                    <ChevronRight />
                  </IconButton>
                  {/* Dots indicator */}
                  <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5 }}>
                    {libraryImages.map((_, i) => (
                      <Box
                        key={i}
                        onClick={() => setLibraryIndex(i)}
                        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === libraryIndex ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                    ))}
                  </Box>
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
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    component="img"
                    src="/screenshots/inspection.jpg"
                    alt="Inspection Module"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
                  />
                  {/* Blur overlay for top-right corner */}
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 77, height: 30, backdropFilter: 'blur(8px)', background: 'linear-gradient(to left, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />
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
                    position: 'relative',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={importsImages[importsIndex]}
                    alt="PDF Reader"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
                  />
                  {/* Blur overlay for top-right corner */}
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 77, height: 30, backdropFilter: 'blur(8px)', background: 'linear-gradient(to left, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />
                  {/* Navigation arrows */}
                  <IconButton
                    onClick={() => setImportsIndex((prev) => (prev - 1 + importsImages.length) % importsImages.length)}
                    sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    size="small"
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => setImportsIndex((prev) => (prev + 1) % importsImages.length)}
                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    size="small"
                  >
                    <ChevronRight />
                  </IconButton>
                  {/* Dots indicator */}
                  <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5 }}>
                    {importsImages.map((_, i) => (
                      <Box
                        key={i}
                        onClick={() => setImportsIndex(i)}
                        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === importsIndex ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                    ))}
                  </Box>
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
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
                  }}
                >
                  <Box
                    component="img"
                    src={reportsImages[reportsIndex]}
                    alt="Reports"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
                  />
                  {/* Blur overlay for top-right corner */}
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 77, height: 30, backdropFilter: 'blur(8px)', background: 'linear-gradient(to left, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />
                  {/* Navigation arrows */}
                  <IconButton
                    onClick={() => setReportsIndex((prev) => (prev - 1 + reportsImages.length) % reportsImages.length)}
                    sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    size="small"
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => setReportsIndex((prev) => (prev + 1) % reportsImages.length)}
                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    size="small"
                  >
                    <ChevronRight />
                  </IconButton>
                  {/* Dots indicator */}
                  <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5 }}>
                    {reportsImages.map((_, i) => (
                      <Box
                        key={i}
                        onClick={() => setReportsIndex(i)}
                        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === reportsIndex ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                    ))}
                  </Box>
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

      {/* AI-Powered Section */}
      <Box
        sx={{
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
            backgroundImage: 'url(/backgrounds/bg12.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.5)',
            zIndex: 0,
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
                color: '#E8E2D5',
                letterSpacing: '-0.01em',
              }}
            >
              {t('aiPowered.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 750,
                mx: 'auto',
                color: 'rgba(232, 226, 213, 0.85)',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
              }}
            >
              {t('aiPowered.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[1, 2, 3].map((feature) => (
              <Grid item xs={12} md={4} key={feature}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(232, 226, 213, 0.2)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        color: '#10B981',
                        mb: 3,
                        display: 'inline-flex',
                        p: 2.5,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)',
                      }}
                    >
                      {feature === 1 && <PictureAsPdf sx={{ fontSize: 48 }} />}
                      {feature === 2 && <Cloud sx={{ fontSize: 48 }} />}
                      {feature === 3 && <SmartToy sx={{ fontSize: 48 }} />}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      sx={{ color: '#1A1F36', mb: 1.5, fontSize: '1.15rem' }}
                    >
                      {t(`aiPowered.feature${feature}.title`)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4A5568',
                        lineHeight: 1.7,
                        fontSize: '0.95rem',
                      }}
                    >
                      {t(`aiPowered.feature${feature}.description`)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="h6"
            align="center"
            sx={{
              mt: 8,
              color: 'rgba(232, 226, 213, 0.9)',
              fontWeight: 400,
              fontSize: '1.1rem',
              fontStyle: 'italic',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            {t('aiPowered.tagline')}
          </Typography>
        </Container>
      </Box>

      {/* Demo Request Section */}
      <Box
        id="demo"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                rgba(255, 255, 255, 0.03) 40px,
                rgba(255, 255, 255, 0.03) 80px
              )
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                color: 'white',
                fontFamily: 'var(--font-fraunces)',
                letterSpacing: '-0.01em',
              }}
            >
              {t('demo.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              {t('demo.subtitle')}
            </Typography>
          </Box>

          <DemoRequestForm />
        </Container>
      </Box>

      {/* Pricing Section - Hidden during development, set SHOW_PRICING to true when ready */}
      {SHOW_PRICING && (
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
              radial-gradient(circle, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
              radial-gradient(circle, rgba(245, 158, 11, 0.06) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.04) 0%, transparent 45%),
              radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.04) 0%, transparent 45%)
            `,
            backgroundSize: '40px 40px, 60px 60px, 100% 100%, 100% 100%',
            backgroundPosition: '0 0, 20px 20px, 0 0, 0 0',
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

          {/* Billing Period Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
            <ToggleButtonGroup
              value={billingPeriod}
              exclusive
              onChange={(_, value) => value && setBillingPeriod(value)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                p: 0.5,
                border: '1px solid rgba(26, 31, 54, 0.08)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '10px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#4A5568',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea570 0%, #047857 100%)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                  },
                },
              }}
            >
              <ToggleButton value="monthly">
                {tPricing('monthly')}
              </ToggleButton>
              <ToggleButton value="annual">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tPricing('annual')}
                  <Box
                    sx={{
                      bgcolor: billingPeriod === 'annual' ? 'rgba(255, 255, 255, 0.2)' : '#10B981',
                      color: billingPeriod === 'annual' ? 'white' : 'white',
                      px: 1.5,
                      py: 0.25,
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {locale === 'fr' ? 'Économie 20%' : 'Save 20%'}
                  </Box>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Single Pricing Card */}
          <Grid container justifyContent="center">
            <Grid item xs={12} md={6} lg={5}>
              <Card
                sx={{
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
                {billingPeriod === 'annual' && (
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
                )}
                <CardContent sx={{ p: 5 }}>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    gutterBottom
                    align="center"
                    sx={{ color: '#1A1F36', mb: 3 }}
                  >
                    {locale === 'fr' ? 'Plan Professionnel' : 'Professional Plan'}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography
                      variant="h2"
                      fontWeight={600}
                      component="span"
                      sx={{ color: billingPeriod === 'annual' ? '#10B981' : '#1A1F36' }}
                    >
                      {billingPeriod === 'monthly' ? '99$' : '79$'}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4A5568' }} component="span">
                      {' '}/ {tPricing('month')}
                    </Typography>
                    {billingPeriod === 'annual' && (
                      <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, mt: 1 }}>
                        948$ {tPricing('billedAnnually')}
                      </Typography>
                    )}
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
                    {billingPeriod === 'annual' && (
                      <Stack direction="row" spacing={2}>
                        <CheckCircle sx={{ fontSize: 20, mt: 0.2, color: '#10B981' }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#10B981', lineHeight: 1.7 }}>
                          {tPricing('save240')}
                        </Typography>
                      </Stack>
                    )}
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
      )}

      {/* FAQ Section */}
      <Box
        sx={{
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
            backgroundImage: 'url(/backgrounds/bg9.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.5)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                fontFamily: 'var(--font-fraunces)',
                color: '#E8E2D5',
                letterSpacing: '-0.01em',
              }}
            >
              {t('faq.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                color: 'rgba(232, 226, 213, 0.85)',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
              }}
            >
              {t('faq.subtitle')}
            </Typography>
          </Box>

          <Stack spacing={2}>
            {[1, 2, 3, 4].map((q) => (
              <Accordion
                key={q}
                sx={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232, 226, 213, 0.2)',
                  borderRadius: '16px !important',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#10B981' }} />}
                  sx={{
                    px: 4,
                    py: 2,
                    '&.Mui-expanded': {
                      minHeight: 'auto',
                    },
                    '& .MuiAccordionSummary-content': {
                      my: 1,
                      '&.Mui-expanded': {
                        my: 1,
                      },
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      color: '#1A1F36',
                      fontSize: '1.1rem',
                    }}
                  >
                    {t(`faq.q${q}.question`)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 4,
                    pb: 3,
                    pt: 0,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#4A5568',
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                    }}
                  >
                    {t(`faq.q${q}.answer`)}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Waitlist Section */}
      <Box
        id="waitlist"
        sx={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
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
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                rgba(255, 255, 255, 0.03) 40px,
                rgba(255, 255, 255, 0.03) 80px
              )
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 400,
                mb: 2,
                color: 'white',
                fontFamily: 'var(--font-fraunces)',
                letterSpacing: '-0.01em',
              }}
            >
              {t('waitlist.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 300,
                fontSize: '1.15rem',
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              {t('waitlist.subtitle')}
            </Typography>
          </Box>

          <WaitlistForm />
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
                  mb: 2,
                }}
              >
                {locale === 'fr'
                  ? 'Plateforme professionnelle d\'évaluation immobilière avec intelligence artificielle.'
                  : 'Professional real estate appraisal platform with artificial intelligence.'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(232, 226, 213, 0.6)',
                  fontSize: '0.9rem',
                }}
              >
                <a
                  href="mailto:contact@valeamax.com"
                  style={{
                    color: '#10B981',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  contact@valeamax.com
                </a>
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
                  onClick={() => handleScroll('demo')}
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
                <Button
                  onClick={() => handleScroll('waitlist')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(232, 226, 213, 0.6)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    p: 0,
                    minWidth: 0,
                    fontWeight: 600,
                    '&:hover': {
                      color: '#10B981',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {t('nav.waitlist')}
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

