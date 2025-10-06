# Internationalization (i18n) Implementation Guide

This guide explains how to use the internationalization features in the Valea Max application.

## Overview

The application uses **next-intl** for internationalization, supporting French (default) and English.

## Features Implemented

✅ Automatic locale detection from browser preferences
✅ Manual language switching with persistent selection
✅ URL-based locale routing (French as default without prefix)
✅ Full TypeScript support
✅ Pluralization support
✅ Date/time/number formatting
✅ Variable interpolation
✅ Nested translations

## Project Structure

```
vallea-max/
├── i18n.ts                          # i18n configuration
├── middleware.ts                     # Locale routing middleware
├── messages/
│   ├── fr.json                      # French translations
│   └── en.json                      # English translations
├── app/
│   └── [locale]/                    # Locale-based routing
│       ├── layout.tsx               # Root layout with NextIntlClientProvider
│       ├── login/page.tsx           # Example: Login page with translations
│       └── ...                      # Other pages
├── components/
│   └── ui/
│       └── LanguageSwitcher.tsx    # Language switching component
└── hooks/
    └── useTranslation.ts            # Custom translation hook
```

## Usage Examples

### 1. Simple Text Translation

```tsx
import { useTranslation } from '@/hooks/useTranslation'

function MyComponent() {
  const { t } = useTranslation('library')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  )
}
```

### 2. Variable Interpolation

```tsx
// In messages/fr.json:
// "welcome": "Bienvenue, {name}!"

const { t } = useTranslation('dashboard')
const userName = "Jean"

return <h1>{t('welcome', { name: userName })}</h1>
// Output: "Bienvenue, Jean!"
```

### 3. Pluralization

```tsx
// In messages/fr.json:
// "results": "{count, plural, =0 {Aucun résultat} =1 {1 résultat} other {# résultats}}"

const { t } = useTranslation('common')
const resultCount = 5

return <p>{t('results', { count: resultCount })}</p>
// Output: "5 résultats"
```

### 4. Date Formatting

```tsx
const { format } = useTranslation()

// Short date
const shortDate = format.date(new Date())
// Output FR: "4 oct. 2025"
// Output EN: "Oct 4, 2025"

// Custom format
const customDate = format.date(new Date(), {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
// Output FR: "samedi 4 octobre 2025"
// Output EN: "Saturday, October 4, 2025"

// Date range
const range = format.dateRange(startDate, endDate)
// Output: "1 oct. 2025 - 31 oct. 2025"
```

### 5. Number and Currency Formatting

```tsx
const { format } = useTranslation()

// Number formatting
const formattedNumber = format.number(1234567.89)
// Output FR: "1 234 567,89"
// Output EN: "1,234,567.89"

// Currency formatting
const price = format.currency(299000)
// Output FR: "299 000,00 $"
// Output EN: "$299,000.00"

// Percentage
const percent = format.number(0.75, { style: 'percent' })
// Output: "75%"
```

### 6. Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

// Full dropdown version
<LanguageSwitcher />

// Compact toggle version
<LanguageSwitcherCompact />
```

### 7. Server Components

For server components, use the async version:

```tsx
import { getTranslations } from 'next-intl/server'

export default async function ServerComponent() {
  const t = await getTranslations('library')

  return <h1>{t('title')}</h1>
}
```

### 8. Metadata and SEO

```tsx
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}
```

### 9. Links with Locale

```tsx
import { useLocale } from 'next-intl'
import Link from 'next/link'

function LocalizedLink() {
  const locale = useLocale()

  // For French (default locale), no prefix needed
  const href = locale === 'fr' ? '/dashboard' : `/${locale}/dashboard`

  return <Link href={href}>Dashboard</Link>
}
```

### 10. Accessing Current Locale

```tsx
const { locale, isFrench, isEnglish } = useTranslation()

if (isFrench) {
  // French-specific logic
}

// Or use the locale directly
const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-CA'
```

## Migration Steps for Existing Components

To migrate existing components to use i18n:

1. **Move the component** to `app/[locale]/` directory structure
2. **Extract text** to translation files (`messages/fr.json` and `messages/en.json`)
3. **Import the hook**: `import { useTranslation } from '@/hooks/useTranslation'`
4. **Replace hardcoded text** with translation calls: `t('key')`
5. **Update links** to include locale when needed
6. **Test** both languages

### Example Migration

**Before:**
```tsx
<Typography variant="h4">
  Bibliothèque de Propriétés
</Typography>
<Button>Nouvelle Propriété</Button>
```

**After:**
```tsx
const { t } = useTranslation('library')

<Typography variant="h4">
  {t('title')}
</Typography>
<Button>{t('newProperty')}</Button>
```

## Adding New Translations

1. Add the key-value pair to both `messages/fr.json` and `messages/en.json`
2. Use the translation in your component with `t('namespace.key')`
3. TypeScript will provide autocomplete for available translation keys

## Best Practices

1. **Organize translations** by feature/page in nested objects
2. **Use meaningful keys** that describe the content, not the UI element
3. **Keep translations DRY** - use common translations for repeated text
4. **Handle plurals properly** using the ICU message format
5. **Format dates/numbers** using the formatter utilities
6. **Test all languages** when making changes
7. **Use namespaces** to organize translations (e.g., 'auth.login.title')
8. **Provide context** in translation keys for translators

## Common Patterns

### Form Validation Messages
```tsx
const { t } = useTranslation('auth.signup.errors')

if (password.length < 6) {
  setError(t('passwordTooShort'))
}
```

### Dynamic Lists
```tsx
const { t } = useTranslation('library.propertyTypes')

const types = ['Condo', 'Unifamiliale', 'Plex']
types.map(type => (
  <MenuItem key={type} value={type}>
    {t(type)}
  </MenuItem>
))
```

### Conditional Text
```tsx
const { t } = useTranslation('common')
const { isFrench } = useTranslation()

// Use different formatting based on locale
const formattedValue = isFrench
  ? value.toLocaleString('fr-CA')
  : value.toLocaleString('en-CA')
```

## Troubleshooting

### Issue: Translations not updating
- Clear browser cache
- Restart the development server
- Check that translation keys match exactly (case-sensitive)

### Issue: Locale not persisting
- The middleware saves the locale preference in a cookie
- Check browser cookie settings

### Issue: 404 on locale routes
- Ensure middleware.ts is in the root directory
- Check that the locale is included in the i18n.ts config

## Testing

To test internationalization:

1. **Browser language preference**: Change browser language settings
2. **Manual switching**: Use the language switcher component
3. **Direct URL access**: Navigate to `/en/page` or `/page` (French)
4. **Persistence**: Switch language and refresh to verify it persists

## Performance Considerations

- Translation files are loaded once per locale
- Use dynamic imports for large translation files
- Consider splitting translations by route for large applications
- The default locale (French) doesn't require a URL prefix for better SEO

## Future Enhancements

- [ ] Add more languages (Spanish, Portuguese)
- [ ] Implement locale-specific number formats
- [ ] Add RTL language support
- [ ] Create translation management workflow
- [ ] Add locale-specific images/assets
- [ ] Implement locale-based form validation