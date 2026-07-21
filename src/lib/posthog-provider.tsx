'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Optimization: Initialize PostHog when the browser is idle to avoid
    // blocking the main thread during initial page load/hydration.
    const initPostHog = () => {
      // Avoid "already initialized" warning in dev mode / HMR
      if (posthog.__loaded) return;

      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        // Ensure PostHog doesn't break if tracking protection is enabled
        on_xhr_error: (error) => console.warn('PostHog XHR error (likely tracking protection):', error),
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') ph.debug();
        }
      })
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => initPostHog())
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(initPostHog, 1000)
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
