'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bell, Settings, Search, LogOut, User, ShieldCheck, Loader2 } from 'lucide-react'
import { ROLE_LABELS, ROLE_BADGE_COLORS, Role } from '@/types'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface HeaderProps { title: string; subtitle?: string }

const CLEARANCE_LEVELS: Record<string, { label: string, color: string }> = {
  [Role.FOUNDER]: { label: 'ULTRA-L5', color: 'bg-black text-[#C0392B] border-black' },
  [Role.CHIEF_OFFICER]: { label: 'SECRET-L4', color: 'bg-red-900/10 text-red-700 border-red-700' },
  [Role.ADMIN]: { label: 'CONFIDENTIAL-L3', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  [Role.PRO]: { label: 'OP-L2', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  [Role.NGO_GOLD]: { label: 'OP-L2', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  [Role.NGO_PARTNER]: { label: 'OP-L2', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  [Role.FREE]: { label: 'PUB-L1', color: 'bg-gray-50 text-gray-400 border-gray-200' },
  [Role.GUEST]: { label: 'PUB-L1', color: 'bg-gray-50 text-gray-400 border-gray-200' },
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role as Role
  const [showProfile, setShowProfile] = useState(false)
  const [activeAlerts, setActiveAlerts] = useState(0)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/analytics')
        const data = await res.json()
        setActiveAlerts(data.activeAlerts || 0)
      } catch (e) {
        // Silently fail for header polling
      }
    }
    fetchAlerts()
    const id = setInterval(fetchAlerts, 30000) // Poll every 30s
    return () => clearInterval(id)
  }, [])

  const clearance = role ? CLEARANCE_LEVELS[role] || CLEARANCE_LEVELS[Role.GUEST] : CLEARANCE_LEVELS[Role.GUEST]

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="font-display font-bold text-[#1A1A2E] text-2xl leading-tight">{title}</h1>
          {subtitle && <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">{subtitle}</p>}
        </div>
        
        {/* Safety Context / Clearance Badge */}
        {role && (
          <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className={cn("flex flex-col items-start")}>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Safety Context</span>
              <div className="flex items-center gap-2">
                <span className={cn('text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-tighter', clearance.color)}>
                  {clearance.label}
                </span>
                <span className="text-[10px] font-semibold text-[#1A1A2E] uppercase">
                   {user?.department || 'Active Duty'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[#C0392B] w-48 transition-colors font-medium" placeholder="System Search..." />
        </div>
        
        <button 
          onClick={() => router.push('/dashboard/sos-alerts')}
          className="relative p-2 text-gray-400 hover:text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors group"
          title="SOS Alerts"
        >
          <Bell size={18} />
          {activeAlerts > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#C0392B] text-white text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-white px-1">
              {activeAlerts}
            </span>
          )}
        </button>

        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="p-2 text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-50 rounded-lg transition-colors px-3"
          title="Settings"
        >
          <Settings size={18} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-3 border-l border-gray-100 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1A1A2E] flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-105 transition-transform shadow-sm">
              {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'US'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#1A1A2E] leading-none">{user?.name}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={cn('text-[8px] font-bold uppercase', role === Role.FOUNDER ? 'text-[#C0392B]' : 'text-gray-400')}>
                  {ROLE_LABELS[role]}
                </span>
                {role === Role.FOUNDER && <ShieldCheck size={8} className="text-[#C0392B]" />}
              </div>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Connected Session</p>
                <p className="text-xs font-bold truncate text-[#1A1A2E]">{user?.email}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                   className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User size={14} className="text-gray-400" /> Account Intelligence
                </button>
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                   className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ShieldCheck size={14} className="text-gray-400" /> Security Protocol
                </button>
              </div>
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button 
                  onClick={() => router.push('/api/auth/signout')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
