const { withSentryConfig } = require('@sentry/nextjs')
const withNextIntl = require('next-intl/plugin')('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  /* config options here */
}

// Wrap with next-intl first, then Sentry
const configWithIntl = withNextIntl(nextConfig)

module.exports = withSentryConfig(
  configWithIntl,
  {
    // Sentry Webpack Plugin options
    silent: true, // Suppresses all logs
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Upload source maps for better error tracking
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
)