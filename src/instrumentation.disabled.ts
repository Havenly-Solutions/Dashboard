import * as Sentry from "@sentry/nextjs";

export function register() {
  // Sentry initialization is handled in sentry.server.config.ts and sentry.client.config.ts
  // Only enabled in production
}

// Only capture request errors in production
export const onRequestError = process.env.NODE_ENV === 'production' 
  ? Sentry.captureRequestError 
  : undefined;
