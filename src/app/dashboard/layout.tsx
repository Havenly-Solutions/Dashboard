import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import ForcePasswordChangeModal from '@/components/dashboard/ForcePasswordChangeModal'
import SessionManager from '@/components/auth/SessionManager'
import SystemBanner from '@/components/ui/SystemBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-[#f1f3f4]">
      <SystemBanner />
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full overflow-x-hidden">
        <main className="flex-1">
          {children}
        </main>
        <ForcePasswordChangeModal />
        <SessionManager />
      </div>
    </div>

  )
}
