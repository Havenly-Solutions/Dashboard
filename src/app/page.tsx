import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/components/auth/LoginForm'

export default async function RootLoginPage() {
  try {
    const session = await getServerSession(authOptions)

    if (session) {
      redirect('/dashboard')
    }

    return <LoginForm />
  } catch (error) {
    console.error('RootLoginPage Error:', error)
    // If auth fails or session check crashes, just show the login form
    return <LoginForm />
  }
}
