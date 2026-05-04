'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setLoading(false), 1500)
    }

    if (document.readyState === 'complete') {
      handleLoad()
      return () => {}
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F9F9F9] transition-opacity duration-700">
      <div className="relative">
        {/* Heartbeat pulse circles */}
        <div className="absolute inset-0 scale-150 opacity-20 bg-[#C0392B] rounded-full animate-heartbeat-outer" />
        <div className="absolute inset-0 scale-125 opacity-40 bg-[#C0392B] rounded-full animate-heartbeat-inner" />
        
        {/* Main Logo */}
        <div className="relative animate-heartbeat flex items-center gap-3 bg-[#1A1A2E] p-3 rounded-xl shadow-2xl">
          <Image src="/favicon.ico" alt="Havenly Logo" width={48} height={48} className="object-contain" />
          <span className="text-white font-display font-bold text-2xl tracking-tighter">
            HAVENLY SOLUTIONS
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.05); }
          30% { transform: scale(1); }
          45% { transform: scale(1.08); }
          60% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        @keyframes heartbeat-outer {
          0% { transform: scale(1.2); opacity: 0; }
          10% { transform: scale(1.2); opacity: 0.1; }
          45% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        @keyframes heartbeat-inner {
          0% { transform: scale(1.1); opacity: 0; }
          10% { transform: scale(1.1); opacity: 0.2; }
          45% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.1); opacity: 0; }
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        .animate-heartbeat-outer {
          animation: heartbeat-outer 1.5s ease-out infinite;
        }

        .animate-heartbeat-inner {
          animation: heartbeat-inner 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  )
}
