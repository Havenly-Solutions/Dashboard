"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Error from "next/error";
import React from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  React.useEffect(() => {
    // Log the error
    console.error('GLOBAL_ERROR:', error.digest, error);
    
    // Conditionally import and use Sentry only in production
    if (process.env.NODE_ENV === 'production') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error);
      }).catch(() => {});
    }
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={500} title="Error" />
      </body>
    </html>
  );
}
