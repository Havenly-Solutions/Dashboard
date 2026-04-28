'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const countdown = useCountdown(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-11-24T00:00:00+02:00')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected authentication error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-havenly-navy flex">
      {/* Left — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#0f0f1f] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0B1A]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_#1A1A2E_0%,_transparent_100%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="Havenly Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-white text-xl tracking-tight">HAVENLY SOLUTIONS</span>
          </div>
          <p className="text-white/40 text-sm font-sans">Dashboard</p>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-display font-bold text-white text-5xl leading-tight mb-4">
              Your Haven.<br />
              <span className="text-havenly-red">Your Community.</span><br />
              Always On.
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              The Black Sheep Tech Corp (PTY) LTD - Building community tech that works for South Africans in the moments that matter most.
            </p>
          </div>
          <div className="border border-white/10 rounded-xl p-5 bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-sans">Launch Countdown</p>
            <div className="flex gap-4">
              {[
                { v: countdown.days, l: 'Days' }, 
                { v: countdown.hours, l: 'Hours' }, 
                { v: countdown.mins, l: 'Mins' }, 
                { v: countdown.secs, l: 'Secs' }
              ].map(({ v, l }) => (
                <div key={l} className="flex-1 min-w-[60px]">
                  <div className="font-display font-bold text-white text-3xl tabular-nums tracking-tighter">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="text-white/40 text-[10px] uppercase tracking-wider font-sans">{l}</div>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-3">24 November 2026 · National Launch</p>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white/30 text-xs">System Status: Active</span>
          </div>
        </div>
      </div>

      {/* Right — login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="Havenly Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-white text-lg">HAVENLY SOLUTIONS</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-havenly-red animate-live" />
              <span className="text-white/60 text-xs tracking-widest uppercase font-sans">Protocol Active</span>
            </div>
            <h2 className="font-display font-bold text-white text-3xl mb-1 text-glow">Secure Access</h2>
            <p className="text-white/40 text-sm">Authorised personnel only</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-white/50 text-xs uppercase tracking-widest mb-2">Email</label>
              <input
                id="login-email"
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-havenly-red transition-colors"
                placeholder="your@havenly.co.za"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-white/50 text-xs uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-havenly-red transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-havenly-red hover:bg-[#a93226] text-white font-display font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-havenly-red/20 active:scale-[0.98]"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Authenticating...</> : 'Access Command Centre'}
            </button>
          </form>
          <p className="text-white/20 text-xs text-center mt-6">
            The Black Sheep Tech Corp (PTY) Ltd · Confidential
          </p>
        </div>
      </div>
    </div>
  )
}
