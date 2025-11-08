import { Metadata } from 'next'
import { Inter, Montserrat, Fraunces } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n'
import { ValleaThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { BackgroundImportProvider } from '@/contexts/BackgroundImportContext'
import { PostHogProvider } from '@/lib/analytics/posthog'
import '../globals.css'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  title: 'Valea Max',
  description: 'Real Estate Appraisal Application',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  // Await params in Next.js 14+
  const { locale } = await params

  // Ensure that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${montserrat.variable} ${fraunces.variable} ${inter.className}`}>
        <PostHogProvider>
          <NextIntlClientProvider messages={messages}>
            <ValleaThemeProvider>
              <AuthProvider>
                <SettingsProvider>
                  <BackgroundImportProvider>
                    {children}
                  </BackgroundImportProvider>
                </SettingsProvider>
              </AuthProvider>
            </ValleaThemeProvider>
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}