'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Activity,
  AlertTriangle,
  BarChart2,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  Settings,
  Users,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';


// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// ─── Role → nav items map ─────────────────────────────────────────────────────
// Only the routes each role is permitted to see are listed here.
// The backend still enforces authorization — this is for UI clarity only.

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  FOUNDER: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Team', href: '/dashboard/team', icon: Users },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { label: 'Live feed', href: '/dashboard/live-feed', icon: Activity },
    { label: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
    { label: 'Registrations', href: '/dashboard/registrations', icon: FileText },
    { label: 'NGO portal', href: '/dashboard/ngo', icon: Globe },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],

  CHIEF_OFFICER: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Team', href: '/dashboard/team', icon: Users },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { label: 'Live feed', href: '/dashboard/live-feed', icon: Activity },
    { label: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
    { label: 'Registrations', href: '/dashboard/registrations', icon: FileText },
    { label: 'NGO portal', href: '/dashboard/ngo', icon: Globe },
  ],

  // Data scientist sees analytics + registrations data only.
  // All data is scoped to the founder's company in the backend queries.
  DATA_SCIENTIST: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { label: 'Data explorer', href: '/dashboard/data', icon: Database },
    { label: 'Registrations', href: '/dashboard/registrations', icon: FileText },
  ],

  MANAGER: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live feed', href: '/dashboard/live-feed', icon: Activity },
    { label: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
    { label: 'NGO portal', href: '/dashboard/ngo', icon: Globe },
  ],

  DEVELOPER: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Safety logs', href: '/dashboard/logs', icon: FileText },
    { label: 'Network', href: '/dashboard/network', icon: Activity },
  ],

  // PA manages registrations and comms only
  PA: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Registrations', href: '/dashboard/registrations', icon: FileText },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ],

  // NGO partner: read-only analytics and resource centre
  NGO_PARTNER: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { label: 'Resources', href: '/dashboard/ngo', icon: Globe },
  ],

  INVESTOR: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  ],
};

// Fallback for unmapped roles
const DEFAULT_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RoleNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role ?? '';

  const items = NAV_BY_ROLE[role] ?? DEFAULT_NAV;

  return (
    <nav className="flex flex-col py-4 pr-4">
      {/* Role badge - GSC Style Chip */}
      <div className="mb-4 px-6">
        <span className="inline-block rounded-full bg-[#e8f0fe] px-3 py-1 text-[11px] font-medium text-[#1a73e8] border border-[#d2e3fc]">
          {role.replace('_', ' ')}
        </span>
      </div>

      {items.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'sidebar-nav-item',
              isActive ? 'active' : 'inactive'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="text-[14px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
