'use client';
import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error
    console.error('CRITICAL_DASHBOARD_ERROR:', error.digest, error);
    
    // Conditionally import and use Sentry only in production
    if (process.env.NODE_ENV === 'production') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error);
      }).catch(() => {});
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C0392B]" />
        
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-[#C0392B]" size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          Systems Interrupted
        </h1>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          The dashboard encountered an unexpected failure. This incident has been logged for cryptographic audit and engineering review.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A2E] text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg"
          >
            <RefreshCcw size={18} /> Re-Initialize Application
          </button>
          
          <Link 
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all text-sm"
          >
            <Home size={18} /> Return to Home
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-50 flex flex-col items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Diagnostic ID
          </p>
          <code className="text-[10px] text-gray-500 font-mono mt-1 px-2 py-1 bg-gray-50 rounded">
            {error.digest || 'UNSET_HASH_BLOCK'}
          </code>
        </div>
      </div>
    </div>
  );
}
