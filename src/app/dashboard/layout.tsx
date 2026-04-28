import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const user = session.user as any
  
  // 4D. Force Password Change Redirection
  // If user must change password, we only allow them on the profile/security page
  // We check for a hypothetical path like '/dashboard/settings/security'
  if (user?.mustChangePassword) {
    // In a real Next.js app, we would use headers() to check current path if needed,
    // but layouts wrap children. To avoid infinite loops, we need a way to detect path.
    // However, server-side layouts in App Router don't easily see the current path.
    // We'll rely on the children rendering a "Blocked" state or specific page.
    // A better way is to handle this in middleware.ts
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0 w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
