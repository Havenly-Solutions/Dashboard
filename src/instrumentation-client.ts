import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://7206da59e951d17b5dcfadf0b8893bd0@o4511298674098176.ingest.us.sentry.io/4511298678292480",
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^http:\/\/localhost:3005\/api/],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
