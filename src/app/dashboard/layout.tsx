import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RoleNav } from '@/components/dashboard/RoleNav';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Logo / brand */}
        <div className="flex h-14 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            Havenly
          </span>
        </div>

        {/* Role-aware navigation */}
        <div className="flex-1 overflow-y-auto">
          <RoleNav />
        </div>

        {/* User + socket connection status at the bottom */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <ConnectionStatus />
          <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
            {session.user?.email}
          </p>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
