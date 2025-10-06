import { useTranslations as useNextIntlTranslations, useFormatter, useLocale } from 'next-intl'

/**
 * Custom hook to access translations with TypeScript support
 * Wrapper around next-intl's useTranslations
 */
export function useTranslation(namespace?: string) {
  const t = useNextIntlTranslations(namespace)
  const format = useFormatter()
  const locale = useLocale()

  return {
    // Main translation function
    t,

    // Formatting utilities
    format: {
      // Format numbers
      number: (value: number, options?: any) => {
        return format.number(value, options)
      },

      // Format currency
      currency: (value: number) => {
        return format.number(value, {
          style: 'currency',
          currency: 'CAD',
        })
      },

      // Format dates
      date: (value: Date | string, options?: any) => {
        const date = typeof value === 'string' ? new Date(value) : value
        return format.dateTime(date, options)
      },

      // Format date range
      dateRange: (from: Date | string, to: Date | string) => {
        const fromDate = typeof from === 'string' ? new Date(from) : from
        const toDate = typeof to === 'string' ? new Date(to) : to
        return `${format.dateTime(fromDate, { dateStyle: 'medium' })} - ${format.dateTime(toDate, { dateStyle: 'medium' })}`
      },

      // Format relative time
      relativeTime: (value: Date | string) => {
        const date = typeof value === 'string' ? new Date(value) : value
        return format.relativeTime(date)
      },

      // Pluralization helper
      plural: (count: number, options: { zero?: string; one: string; other: string }) => {
        if (count === 0 && options.zero) return options.zero
        if (count === 1) return options.one
        return options.other.replace('#', count.toString())
      }
    },

    // Current locale
    locale,

    // Check if locale is French
    isFrench: locale === 'fr',

    // Check if locale is English
    isEnglish: locale === 'en'
  }
}

/**
 * Hook for common translations used across the app
 */
export function useCommonTranslations() {
  const { t, format, locale } = useTranslation('common')

  return {
    t,
    format,
    locale,
    // Commonly used translations
    appName: t('appName'),
    loading: t('loading'),
    error: t('error'),
    success: t('success'),
    cancel: t('cancel'),
    confirm: t('confirm'),
    save: t('save'),
    delete: t('delete'),
    edit: t('edit'),
    view: t('view'),
    add: t('add'),
    search: t('search'),
    clear: t('clear'),
    close: t('close')
  }
}