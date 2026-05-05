'use client'
import React from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import NextLink from 'next/link'
import Image from 'next/image'

import { toast } from 'sonner'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPw, setShowPw] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const countdown = useCountdown(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-07-01T00:00:00+02:00')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        if (res.error !== 'CredentialsSignin') {
          console.warn(`Sign in failed: ${res.error}`)
        }
        toast.error(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
        setLoading(false)
      } else {
        toast.success('Login successful. Redirecting...')
        // Remove callbackUrl if present in URL manually or just push to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Login Error:', err)
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
          alt="Havenly Solutions Security Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 z-10 bg-[#1A1A2E]/80 backdrop-blur-[2px]" />

      {/* Login Card (Power BI Aesthetic) */}
      <div className="relative z-20 bg-white w-full max-w-[840px] h-auto min-h-[480px] rounded-sm shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-500">

        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#1A1A2E] rounded flex items-center justify-center relative overflow-hidden">
              <Image src="/logo.png" alt="Havenly Solutions Logo" fill className="object-contain p-1.5" />
            </div>
            <span className="font-display font-bold text-[#444] text-sm uppercase tracking-wider">Havenly Solutions</span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[#333] mb-6">
              Sign in
            </h2>

            <form onSubmit={handleSubmit} method="POST" className="space-y-6">
              <div className="animate-in slide-in-from-right-4 duration-300">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Business Email"
                  title="Enter your business email"
                  className="w-full border-b border-[#444] py-3 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#444] mb-6"
                />
              </div>

              <div className="animate-in slide-in-from-right-4 duration-300 relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  title="Enter your password"
                  className="w-full border-b border-[#444] py-3 text-[15px] focus:outline-none focus:border-[#0067b8] transition-colors placeholder-[#444] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1 p-2 text-[#444] hover:text-[#333]"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

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
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
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
            <span className="text-[15px] text-[#444]">...</span>
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
              {mounted ? (
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="flex flex-col"><span className="text-lg font-black text-[#C0392B]">{countdown.days}</span><span className="text-[8px] uppercase text-gray-400">D</span></div>
                  <div className="flex flex-col"><span className="text-lg font-black text-[#1A1A2E]">{countdown.hours}</span><span className="text-[8px] uppercase text-gray-400">H</span></div>
                  <div className="flex flex-col"><span className="text-lg font-black text-[#1A1A2E]">{countdown.mins}</span><span className="text-[8px] uppercase text-gray-400">M</span></div>
                  <div className="flex flex-col"><span className="text-lg font-black text-[#1A1A2E]">{countdown.secs}</span><span className="text-[8px] uppercase text-gray-400">S</span></div>
                </div>
              ) : (
                <div className="h-10 flex items-center justify-center">
                  <div className="w-full h-2 bg-gray-100 animate-pulse rounded" />
                </div>
              )}
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
