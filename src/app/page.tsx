import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/components/auth/LoginForm'
import { ROLE_PERMISSIONS } from '@/types'

interface PageProps {
  searchParams: { error?: string }
}

export default async function RootLoginPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  // Only redirect if a session exists AND there isn't an unauthorized error in the URL
  // Also verify the user has a valid role that exists in our permissions map
  if (session && searchParams.error !== 'unauthorized') {
    const role = (session.user as any)?.role
    if (role && ROLE_PERMISSIONS[role]) {
      redirect('/dashboard')
    }
  }

  return <LoginForm />
}
