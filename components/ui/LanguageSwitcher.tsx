'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { MenuItem, Select, FormControl, Box, Typography } from '@mui/material'
import { Language } from '@mui/icons-material'
import { useTransition } from 'react'

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale in the pathname
      const currentPathWithoutLocale = (pathname || '/').replace(/^\/[a-z]{2}/, '')
      const newPath = newLocale === 'fr'
        ? currentPathWithoutLocale || '/'
        : `/${newLocale}${currentPathWithoutLocale}`

      router.push(newPath)
      router.refresh()
    })
  }

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        startAdornment={
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, ml: 1 }}>
            <Language fontSize="small" />
          </Box>
        }
        sx={{
          bgcolor: 'background.paper',
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            py: 1
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" sx={{ fontSize: '1.2em' }}>
                {lang.flag}
              </Typography>
              <Typography>{lang.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

// Compact version for mobile or smaller spaces
export function LanguageSwitcherCompact() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const currentLang = languages.find(l => l.code === locale)

  const toggleLanguage = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr'
    startTransition(() => {
      const currentPathWithoutLocale = (pathname || '/').replace(/^\/[a-z]{2}/, '')
      const newPath = newLocale === 'fr'
        ? currentPathWithoutLocale || '/'
        : `/${newLocale}${currentPathWithoutLocale}`

      router.push(newPath)
      router.refresh()
    })
  }

  return (
    <Box
      component="button"
      onClick={toggleLanguage}
      disabled={isPending}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        bgcolor: 'background.paper',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <Typography component="span" sx={{ fontSize: '1.2em' }}>
        {currentLang?.flag}
      </Typography>
      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
        {currentLang?.code.toUpperCase()}
      </Typography>
    </Box>
  )
}