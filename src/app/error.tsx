'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
        
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        
        <h2 className="font-display font-bold text-[#1A1A2E] text-2xl mb-2">Platform Exception</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          The Guardian Protocol encountered an unexpected fault state. System engineers have been notified via secure channels.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Diagnostic Output</p>
          <p className="text-xs text-red-600 font-mono break-words">
            {error.message || 'Unknown runtime exception'}
          </p>
          {error.digest && (
            <p className="text-[10px] text-gray-400 font-mono mt-2 pt-2 border-t border-gray-200">
              Trace ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
          >
            Return to Feed
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1A2E] text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-lg shadow-black/10"
          >
            <RefreshCw size={16} />
            Reinitialize
          </button>
        </div>
      </div>
    </div>
  )
}
