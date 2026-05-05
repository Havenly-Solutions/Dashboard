"use client";

import React from "react";

export default function RootLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error
    console.error('ROOT_LAYOUT_ERROR:', error.digest, error);
    
    // Conditionally import and use Sentry only in production
    if (process.env.NODE_ENV === 'production') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.withScope((scope) => {
          scope.setExtra("digest", error.digest);
          scope.setTag("error_boundary", "root_layout");
          Sentry.captureException(error);
        });
      }).catch(() => {});
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-red-50">
      <h2 className="text-2xl font-bold mb-4 text-red-800">Critical Application Error</h2>
      <p className="text-red-600 mb-8">We encountered a serious issue loading the application layout.</p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => reset()}
      >
        Reload Application
      </button>
    </div>
  );
}
