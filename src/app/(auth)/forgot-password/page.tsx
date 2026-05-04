'use client'
import { useState } from 'react'

import { apiClient } from '@/lib/apiClient'
import { Loader2, ArrowLeft, Send } from 'lucide-react'
import NextLink from 'next/link'
import Image from 'next/image'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      await apiClient(`/api/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSubmitted(true)
      toast.success('Reset link sent if account exists')
    } catch (err) {
      Sentry.captureException(err)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/police.jpg" alt="Background" fill className="object-cover" priority />
      </div>
      <div className="absolute inset-0 z-10 bg-[#1A1A2E]/80 backdrop-blur-[2px]" />

      <div className="relative z-20 bg-white w-full max-w-[420px] rounded-sm shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded flex items-center justify-center p-1.5 relative">
            <Image src="/favicon.ico" alt="Havenly Solutions Logo" fill className="object-contain p-1.5" />
          </div>
          <span className="font-display font-bold text-[#666] text-sm uppercase tracking-wider">Havenly Solutions</span>
        </div>

        {!submitted ? (
          <>
            <h2 className="text-2xl font-semibold text-[#333] mb-6">Reset password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your business email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Business Email"
                className="w-full border-b border-[#666] py-2 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#666]"
              />

              <div className="flex items-center justify-between pt-4">
                <NextLink href="/" className="text-sm text-[#0067b8] hover:underline flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to sign in
                </NextLink>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0067b8] hover:bg-[#005da6] text-white px-8 py-1.5 text-[15px] font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Send link</>}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-50 text-[#0067b8] rounded-full flex items-center justify-center mx-auto mb-6">
              <Send size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-[#333] mb-4">Check your email</h2>
            <p className="text-sm text-gray-500 mb-8">
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <NextLink href="/" className="inline-block bg-[#0067b8] hover:bg-[#005da6] text-white px-10 py-2 rounded-sm text-sm font-medium transition-colors">
              Return to login
            </NextLink>
          </div>
        )}
      </div>
    </div>
  )
}
