"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function RootLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setExtra("digest", error.digest);
      scope.setTag("error_boundary", "root_layout");
      Sentry.captureException(error);
    });
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
