'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  BarChart2,
  AlertTriangle,
  FileText,
  Globe,
  Settings,
  Activity,
  Database,
  Bell,
} from 'lucide-react';

// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
    <nav className="flex flex-col gap-1 px-3 py-4">
      {/* Role badge */}
      <div className="mb-4 px-3">
        <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
            className={[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            ].join(' ')}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
