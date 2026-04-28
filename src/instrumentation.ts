import * as Sentry from "@sentry/nextjs";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Sentry is automatically initialized via sentry.server.config.ts
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Sentry is automatically initialized via sentry.edge.config.ts
  }
}

export const onRequestError = Sentry.captureRequestError;
