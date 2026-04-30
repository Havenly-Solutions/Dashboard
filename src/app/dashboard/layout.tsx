import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import ForcePasswordChangeModal from '@/components/dashboard/ForcePasswordChangeModal'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0 w-full overflow-x-hidden">
        {children}
        <ForcePasswordChangeModal />
      </div>
    </div>
  )
}
