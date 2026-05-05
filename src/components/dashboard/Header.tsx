'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, Search, LogOut, User } from 'lucide-react'
import { Role } from '@/types'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/apiClientClient'
import NotificationFeed from './NotificationFeed'
import { toast } from 'sonner'

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

  useEffect(() => {
    async function fetchAlerts() {
      try {
        await apiClient('/api/analytics')
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
    <header className="bg-white border-b border-[#dadce0] px-6 h-[64px] flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-[22px] font-normal text-[#202124] leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-[#5f6368] mt-0.5">{subtitle}</p>}
        </div>
        
        {/* Status indicator - Google Style */}
        {role && (
          <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-[#dadce0]">
            <div className="flex items-center gap-2">
              <span className={cn('text-[11px] px-2 py-0.5 rounded-full border font-medium', clearance.color.replace('bg-black', 'bg-white').replace('text-[#C0392B]', 'text-[#ea4335]'))}>
                {clearance.label}
              </span>
              <span className="text-[12px] font-normal text-[#5f6368]">
                 {user?.department || 'Active'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block mr-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" />
          <input className="bg-[#f1f3f4] border-transparent rounded-lg pl-10 pr-4 py-2 text-[14px] text-[#202124] placeholder-[#5f6368] focus:bg-white focus:border-[#1a73e8] focus:ring-0 w-64 transition-all" placeholder="Search report..." />
        </div>
        
        <NotificationFeed />

        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <div className="relative ml-2">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-3 border-l border-[#dadce0] group"
          >
            <div className="w-8 h-8 rounded-full bg-[#5f6368] flex items-center justify-center text-white text-[12px] font-medium">
              {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#dadce0] rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] py-4 z-50">
              <div className="px-6 pb-4 border-b border-[#f1f3f4] text-center">
                <div className="w-16 h-16 rounded-full bg-[#5f6368] flex items-center justify-center text-white text-2xl font-medium mx-auto mb-2">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </div>
                <p className="text-[16px] font-medium text-[#202124]">{user?.name}</p>
                <p className="text-[14px] text-[#5f6368]">{user?.email}</p>
              </div>
              <div className="py-2">
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                   className="w-full flex items-center gap-3 px-6 py-2 text-[14px] text-[#202124] hover:bg-[#f8f9fa]"
                >
                  <User size={18} className="text-[#5f6368]" /> Manage Account
                </button>
              </div>
              <div className="border-t border-[#f1f3f4] pt-2">
                <button 
                  onClick={async () => {
                    try {
                      toast.loading('Signing out...');
                      await signOut({ callbackUrl: '/' });
                    } catch (e) {
                      toast.error('Sign out failed');
                      console.error(e);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-6 py-2 text-[14px] text-[#ea4335] hover:bg-[#f8f9fa]"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

  )
}
