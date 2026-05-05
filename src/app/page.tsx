import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import dynamic from 'next/dynamic'

const LoginForm = dynamic(() => import('@/components/auth/LoginForm'), { ssr: false })

export default async function RootLoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
