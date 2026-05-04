'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/apiClient'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import NextLink from 'next/link'
import Image from 'next/image'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

function AcceptInviteForm() {
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
      toast.error('Invalid or missing invitation token')
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
      await apiClient(`/api/auth/accept-invite`, {
        method: 'POST',
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      setSuccess(true)
      toast.success('Account setup successful')
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
        <h2 className="text-2xl font-semibold text-[#333] mb-4">Welcome to Havenly Solutions</h2>
        <p className="text-sm text-gray-500 mb-8">
          Your account has been successfully created. You can now sign in with your password.
        </p>
        <NextLink href="/" className="inline-block bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white px-10 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg">
          Sign in now
        </NextLink>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-[#333] mb-6 tracking-tight">Set up your account</h2>
      <p className="text-sm text-gray-500 mb-8">
        Welcome to Havenly Solutions. Please set a password to activate your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Choose Password"
            className="w-full border-b border-gray-200 py-3 text-[15px] focus:outline-none focus:border-[#1A1A2E] transition-colors placeholder-gray-400 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <input
          type={showPw ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm Password"
          className="w-full border-b border-gray-200 py-3 text-[15px] focus:outline-none focus:border-[#1A1A2E] transition-colors placeholder-gray-400"
        />

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white py-3 rounded-lg text-[15px] font-semibold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Activate Account'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background element */}
      <div className="absolute inset-0 z-0">
        <Image src="/police.jpg" alt="Background" fill className="object-cover" priority />
      </div>
      <div className="absolute inset-0 z-10 bg-[#1A1A2E]/85 backdrop-blur-[4px]" />

      <div className="relative z-20 bg-white w-full max-w-[440px] rounded-2xl shadow-2xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#1A1A2E] rounded-xl flex items-center justify-center p-2 shadow-inner">
            <Image src="/favicon.ico" alt="Havenly Solutions Logo" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <span className="block font-display font-black text-[#1A1A2E] text-lg leading-none tracking-tighter">HAVENLY SOLUTIONS</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Operational Command</span>
          </div>
        </div>

        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#1A1A2E]" /></div>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  )
}
