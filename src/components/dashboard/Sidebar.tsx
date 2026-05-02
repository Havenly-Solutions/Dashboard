'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Shield, Radio, FileText, Users, BarChart2, BookOpen, AlertCircle, Network, LogOut, Settings, HelpCircle, ChevronRight, Menu, X, Megaphone, LifeBuoy } from 'lucide-react'
import { ROLE_PERMISSIONS, ROLE_LABELS, Role } from '@/types'
import { cn } from '@/lib/utils'
import PortalSwitcher, { usePortalView } from '../PortalSwitcher'

const LogoIcon = ({ size = 16 }: { size?: number }) => (
  <Image src="/favicon.ico" alt="" width={size} height={size} className="rounded-sm shrink-0 object-contain" />
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
  { href: '/dashboard/support-tickets', label: 'Support Tickets', icon: LifeBuoy },
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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-4 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#1A1A2E] p-1">
            <Image src="/favicon.ico" alt="Havenly Solutions Logo" width={32} height={32} className="w-full h-full object-contain" />
          </div>
          <div className="font-display font-bold text-[#1A1A2E] text-base leading-none">Havenly Solutions</div>
        </div>
        <button onClick={() => setIsOpen(true)} className="text-[#1A1A2E]/80 hover:text-[#1A1A2E] p-2" aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay Background for Mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "w-64 min-h-screen bg-white border-r border-[#dadce0] flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 md:translate-x-0 overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section - Google Style */}
        <div className="px-6 h-[64px] flex items-center gap-3 border-b border-[#dadce0]">
          <Image src="/favicon.ico" alt="Havenly Logo" width={24} height={24} className="object-contain" />
          <div className="text-[18px] font-medium text-[#5f6368] tracking-tight">
            Havenly <span className="font-normal text-[#80868b]">Solutions</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-[#5f6368] p-1">
            <X size={20} />
          </button>
        </div>

        {/* PORTAL SWITCHER */}
        <div className="px-4 py-3 bg-[#f8f9fa] border-b border-[#dadce0]">
          <PortalSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto pr-2">
          {visibleItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setIsOpen(false)} className={cn('sidebar-nav-item', active ? 'active' : 'inactive')}>
                <Icon size={20} />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="pb-4 border-t border-[#dadce0] pt-4">
          <div className="px-6 py-2 mb-2">
            <p className="text-[11px] text-[#5f6368] font-medium mb-1">Clearance Level</p>
            <p className="text-[13px] text-[#202124] font-medium">{ROLE_LABELS[effectiveRole]}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="sidebar-nav-item inactive w-[calc(100%-8px)]">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

    </>
  )
}
