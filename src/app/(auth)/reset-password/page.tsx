'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react'
import NextLink from 'next/link'
import Image from 'next/image'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      router.push('/')
    }
  }, [token, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.havenly.solutions'
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      })

      if (res.ok) {
        setSuccess(true)
        toast.success('Password reset successful')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (err) {
      Sentry.captureException(err)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-[#333] mb-4">Password reset</h2>
        <p className="text-sm text-gray-500 mb-8">
          Your password has been successfully updated. You can now sign in with your new credentials.
        </p>
        <NextLink href="/" className="inline-block bg-[#0067b8] hover:bg-[#005da6] text-white px-10 py-2 rounded-sm text-sm font-medium transition-colors">
          Sign in now
        </NextLink>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-[#333] mb-6">Set new password</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please enter a new password for your Havenly Solutions account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="New Password"
            className="w-full border-b border-[#666] py-2 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#666] pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-0 top-2 text-[#666] hover:text-[#333]"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <input
          type={showPw ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm New Password"
          className="w-full border-b border-[#666] py-2 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#666]"
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0067b8] hover:bg-[#005da6] text-white py-2 text-[15px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
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

        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#0067b8]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
