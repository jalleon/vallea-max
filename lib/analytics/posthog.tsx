'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize PostHog only if API key is available
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        // Enable debug mode in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
        capture_pageview: false, // We'll manually capture pageviews
      })
    }
  }, [])

  useEffect(() => {
    // Track pageviews
    if (pathname && posthog.__loaded) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}

// Helper function to capture custom events
export function captureEvent(eventName: string, properties?: Record<string, any>) {
  if (posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

// Helper function to identify users
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (posthog.__loaded) {
    posthog.identify(userId, properties)
  }
}

// Export posthog instance
export { posthog }
