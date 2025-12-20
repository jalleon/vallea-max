import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
})

export function middleware(request: any) {
  // Handle i18n routing only
  // Auth session management is handled by Supabase client in individual pages/components
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/',
    '/(fr|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}