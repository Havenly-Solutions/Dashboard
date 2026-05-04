'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Radio, FileText, Users, BarChart2, BookOpen, AlertCircle, Network, LogOut, Settings, X, Megaphone, LifeBuoy, Clapperboard, Menu } from 'lucide-react'
import { ROLE_PERMISSIONS, ROLE_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import PortalSwitcher, { usePortalView } from '../PortalSwitcher'
import { toast } from 'sonner'

const LogoIcon = ({ size = 16 }: { size?: number }) => (
  <Image src="/favicon.ico" alt="" width={size} height={size} className="rounded-sm shrink-0 object-contain" />
)

const ALL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Live Feed', icon: Radio, exact: true, scope: 'feed:read' },
  { href: '/dashboard/sos-alerts', label: 'SOS Alerts', icon: AlertCircle, scope: 'sos:read' },
  { href: '/dashboard/mesh-topology', label: 'Mesh Topology', icon: Network, scope: 'mesh:read' },
  { href: '/dashboard/safety-logs', label: 'Safety Logs', icon: LogoIcon, scope: 'safety:read' },
  { href: '/dashboard/ngo-portal', label: 'NGO Portal', icon: Users, scope: 'ngo:read' },
  { href: '/dashboard/pre-registrations', label: 'Pre-Registrations', icon: FileText, scope: 'pre-registrations:read' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2, scope: 'analytics:read' },
  { href: '/dashboard/media', label: 'Media Vault', icon: Clapperboard, scope: 'media:read' },
  { href: '/dashboard/broadcast', label: 'Tour Broadcast', icon: Megaphone, scope: 'broadcast:read' },
  { href: '/dashboard/team', label: 'Team Management', icon: Users, scope: 'team:read' },
  { href: '/dashboard/approvals', label: 'Approvals Hub', icon: LogoIcon, scope: 'approvals:read' },
  { href: '/dashboard/resource-centre', label: 'Resource Centre', icon: BookOpen, scope: 'resource-centre:read' },
  { href: '/dashboard/support-tickets', label: 'Support Tickets', icon: LifeBuoy, scope: 'support:read' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const portalView = usePortalView()

  // Use portal view if available (for Founder previewing other roles), otherwise use actual role
  const actualRole = (session?.user as any)?.role as string
  const effectiveRole = (actualRole === 'FOUNDER' ? portalView : actualRole) as string
  
  // Normalized role lookup to be case-insensitive just in case
  const roleKey = Object.keys(ROLE_PERMISSIONS).find(
    k => k.toUpperCase() === effectiveRole?.toUpperCase()
  )
  
  const permissions = roleKey ? ROLE_PERMISSIONS[roleKey] : []

  // DEBUG: Uncomment to trace permission issues in console
  /*
  console.log('[Sidebar Auth Debug]:', {
    actualRole,
    effectiveRole,
    roleKey,
    permissionsCount: permissions.length,
    pathname
  });
  */

  const isAllowed = (item: typeof ALL_NAV_ITEMS[0]) => {
    if (permissions.includes('*')) return true
    if (!item.scope) return true 
    
    // Check if permissions include the specific scope (e.g. 'sos:read') 
    // OR the direct path (e.g. '/dashboard/sos-alerts')
    const allowed = permissions.includes(item.scope) || permissions.includes(item.href)
    return allowed
  }

  const visibleItems = ALL_NAV_ITEMS.filter(isAllowed)

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
          <button onClick={() => setIsOpen(false)} title="Close Menu" className="md:hidden ml-auto text-[#5f6368] p-1">
            <X size={20} />
          </button>
        </div>

        {/* PORTAL SWITCHER */}
        <div id="portal-switcher" className="px-4 py-3 bg-[#f8f9fa] border-b border-[#dadce0]">
          <PortalSwitcher />
        </div>

        {/* Nav */}
        <nav 
          id="sidebar-nav" 
          className="flex-1 py-4 overflow-y-auto pr-2 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          {visibleItems.map(({ href, label, icon: Icon, exact, scope }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const id = scope ? `nav-${scope.split(':')[0]}` : `nav-${label.toLowerCase().replace(/\s+/g, '-')}`
            return (
              <Link 
                key={href} 
                href={href} 
                id={id}
                onClick={() => setIsOpen(false)} 
                className={cn('sidebar-nav-item', active ? 'active' : 'inactive')}
              >
                <Icon size={20} />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="pb-4 border-t border-[#dadce0] pt-4 mt-auto">
          <div className="px-6 py-2 mb-2">
            <p className="text-[11px] text-[#5f6368] font-medium mb-1 uppercase tracking-wider">Clearance Level</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[13px] text-[#202124] font-semibold">{ROLE_LABELS[effectiveRole]}</p>
            </div>
          </div>
          <button 
            id="nav-logout"
            onClick={async (e) => {
              e.preventDefault();
              try {
                toast.loading('Initiating secure sign out...');
                console.log('[Sidebar] Initiating secure sign out...');
                // Clear session storage as well
                sessionStorage.clear();
                await signOut({ callbackUrl: '/' });
              } catch (error) {
                toast.error('Sign out failed');
                console.error('[Sidebar] Sign out failed:', error);
              }
            }} 
            className="sidebar-nav-item inactive w-[calc(100%-8px)] hover:bg-[#fce8e6] hover:text-[#ea4335] group"
          >
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

    </>
  )
}
