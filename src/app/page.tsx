'use client'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import NextLink from 'next/link'
import Image from 'next/image'

import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

export default function RootLoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: Password (Power BI style)

  const countdown = useCountdown(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-11-24T00:00:00+02:00')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1 && email) {
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        if (res.error !== 'CredentialsSignin') {
          Sentry.withScope((scope) => {
            scope.setExtra("email", email);
            scope.setLevel("warning");
            Sentry.captureMessage(`Sign in failed: ${res.error}`);
          });
        }
        toast.error(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
        setLoading(false)
      } else {
        toast.success('Login successful. Redirecting...')
        router.push('/dashboard')
      }
    } catch (err) {
      Sentry.withScope((scope) => {
        scope.setExtra("email", email);
        scope.setLevel("error");
        Sentry.captureException(err);
      });
      toast.error('An unexpected authentication error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/police.jpg"
          alt="Havenly Security Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 z-10 bg-[#1A1A2E]/80 backdrop-blur-[2px]" />

      {/* Login Card (Power BI Aesthetic) */}
      <div className="relative z-20 bg-white w-full max-w-[840px] h-auto min-h-[480px] rounded-sm shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-500">

        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#1A1A2E] rounded flex items-center justify-center p-1.5 relative">
              <Image src="/favicon.ico" alt="Havenly Logo" fill className="object-contain p-1.5" />
            </div>
            <span className="font-display font-bold text-[#666] text-sm uppercase tracking-wider">Havenly Solutions</span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[#333] mb-2">
              {step === 1 ? 'Sign in' : 'Enter password'}
            </h2>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[#0067b8] hover:underline mb-6 flex items-center gap-1"
                title="Go back to email step"
              >
                ← {email}
              </button>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Business Email"
                    title="Enter your business email"
                    className="w-full border-b border-[#666] py-2 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#666]"
                  />
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300 relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    placeholder="Password"
                    title="Enter your password"
                    className="w-full border-b border-[#666] py-2 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#666] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-0 top-2 text-[#666] hover:text-[#333]"
                    title={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <NextLink href="/forgot-password">
                  <span className="text-[13px] text-[#0067b8] hover:underline cursor-pointer">Forgot password?</span>
                </NextLink>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0067b8] hover:bg-[#005da6] text-white px-10 py-1.5 text-[15px] font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : step === 1 ? 'Next' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NextLink href="https://havenly.solutions/Terms">
                <span className="text-[12px] text-[#666] hover:underline cursor-pointer">Terms of use</span>
              </NextLink>
              <NextLink href="https://havenly.solutions/Privacypolicy">
                <span className="text-[12px] text-[#666] hover:underline cursor-pointer">Privacy & cookies</span>
              </NextLink>
            </div>
            <span className="text-[15px] text-[#666]">...</span>
          </div>
        </div>

        {/* Right Side: Decorative/Information Panel */}
        <div className="hidden md:flex w-[320px] bg-[#F2F2F2] p-10 flex-col justify-between border-l border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="font-display font-black text-[#1A1A2E] text-lg tracking-tighter italic">Havenly Solutions Dashboard</span>
            </div>
            <h3 className="text-[#1A1A2E] font-bold text-xl mb-4 leading-tight">National Security Infrastructure</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Building community driven safety technology for South Africa. Trust, transparency, and rapid response.
            </p>
            <p className="text-[#1A1A2E] font-bold text-sm mb-4 leading-tight">
              Your Haven. Your Community. <span className="text-red-500 font-bold">Always On.</span>
            </p>

            {/* Launch Countdown in Side Panel */}
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Launch Countdown</p>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="flex flex-col"><span className="text-lg font-black text-[#C0392B]">{countdown.days}</span><span className="text-[8px] uppercase text-gray-400">D</span></div>
                <div className="flex flex-col"><span className="text-lg font-black text-[#1A1A2E]">{countdown.hours}</span><span className="text-[8px] uppercase text-gray-400">H</span></div>
                <div className="flex flex-col"><span className="text-lg font-black text-[#1A1A2E]">{countdown.mins}</span><span className="text-[8px] uppercase text-gray-400">M</span></div>
                <div className="flex flex-col"><span className="text-lg font-black text-[#1A1A2E]">{countdown.secs}</span><span className="text-[8px] uppercase text-gray-400">S</span></div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-400">
            © 2026 The Black Sheep Tech Corp (PTY) Ltd. <br />All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
