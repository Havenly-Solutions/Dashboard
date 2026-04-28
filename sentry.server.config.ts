import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://7206da59e951d17b5dcfadf0b8893bd0@o4511298674098176.ingest.us.sentry.io/4511298678292480",
  tracesSampleRate: 1.0,
});
