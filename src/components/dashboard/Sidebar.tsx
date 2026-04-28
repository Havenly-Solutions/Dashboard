'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Shield, Radio, FileText, Users, BarChart2, BookOpen, AlertCircle, Network, LogOut, Settings, HelpCircle, ChevronRight, Menu, X, Megaphone } from 'lucide-react'
import { ROLE_PERMISSIONS, ROLE_LABELS, Role } from '@/types'
import { cn } from '@/lib/utils'
import PortalSwitcher, { usePortalView } from '../PortalSwitcher'

const LogoIcon = ({ size = 16 }: { size?: number }) => (
  <img src="/logo.png" alt="" width={size} height={size} className="rounded-sm shrink-0" />
)

const ALL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Live Feed', icon: Radio, exact: true },
  { href: '/dashboard/sos-alerts', label: 'SOS Alerts', icon: AlertCircle },
  { href: '/dashboard/mesh-topology', label: 'Mesh Topology', icon: Network },
  { href: '/dashboard/safety-logs', label: 'Safety Logs', icon: LogoIcon },
  { href: '/dashboard/ngo-portal', label: 'NGO Portal', icon: Users },
  { href: '/dashboard/pre-registrations', label: 'Pre-Registrations', icon: FileText },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/team', label: 'Team Management', icon: Users },
  { href: '/dashboard/approvals', label: 'Approvals Hub', icon: LogoIcon },
  { href: '/dashboard/broadcast', label: 'Tour Broadcast', icon: Megaphone },
  { href: '/dashboard/resource-centre', label: 'Resource Centre', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const portalView = usePortalView()

  // Use portal view if available (for Founder previewing other roles), otherwise use actual role
  const actualRole = (session?.user as any)?.role as Role
  const effectiveRole = actualRole === 'FOUNDER' ? portalView : actualRole

  const permissions = effectiveRole ? ROLE_PERMISSIONS[effectiveRole] : []
  const isAllowed = (href: string) => {
    if (permissions.includes('*')) return true
    return permissions.some(p => href === p)
  }

  const visibleItems = ALL_NAV_ITEMS.filter(item => isAllowed(item.href))

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A2E] z-30 flex items-center justify-between px-4 border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Havenly Logo" className="w-full h-full object-cover" />
          </div>
          <div className="font-display font-bold text-white text-base leading-none">Havenly Solutions</div>
        </div>
        <button onClick={() => setIsOpen(true)} className="text-white/80 hover:text-white p-2" aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay Background for Mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "w-60 min-h-screen bg-[#1A1A2E] flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 md:translate-x-0 overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="Havenly Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-base leading-none">Havenly Solutions</div>
              <div className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Dashboard</div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white/50 p-1" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* PORTAL SWITCHER — Founder-only view toggle (see PortalSwitcher.tsx) */}
        <div className="px-3 py-3 border-b border-white/10">
          <PortalSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {visibleItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setIsOpen(false)} className={cn('sidebar-nav-item', active ? 'active' : 'inactive')}>
                <Icon size={16} />
                <span>{label}</span>
                {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-white/10 pt-4">
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0B6E4F]" />
              <span className="text-white/30 text-[10px] uppercase tracking-widest">System Active</span>
            </div>
            {/* Show effective role label */}
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/50 mb-1">Current Role</p>
              <p className="text-sm text-white font-medium">{ROLE_LABELS[effectiveRole]}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="sidebar-nav-item inactive w-full">
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
