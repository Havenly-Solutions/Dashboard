import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Role } from '@/types'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3005'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  pages: { signIn: '/', error: '/', signOut: '/' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const forwardedFor = req?.headers?.['x-forwarded-for'] || ''
          const userAgent = req?.headers?.['user-agent'] || ''

          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-forwarded-for': forwardedFor,
              'user-agent': userAgent
            },
            body: JSON.stringify({
               email: credentials.email,
               password: credentials.password
            }),
          })

          const body = await res.text()
          let result: any = {}
          try {
            result = JSON.parse(body)
          } catch (e) {
            console.error('Failed to parse auth response as JSON:', body)
          }

          if (!res.ok) {
            console.error('Auth Backend Error:', res.status, body)
            throw new Error(result.error || `Authentication failed (${res.status})`)
          }
          
          const { user, accessToken, refreshToken } = result
          
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            phone: user.phone,
            role: user.role as Role,
            department: user.department,
            mustChangePassword: user.mustChangePassword,
            accessToken,
            refreshToken,
          }
        } catch (error: any) {
          console.error('Authorize Exception:', error.message)
          throw new Error(error.message)
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.mustChangePassword = (user as any).mustChangePassword
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken
        }
        if ((user as any).refreshToken) {
          token.refreshToken = (user as any).refreshToken
        }
      }
      
      // Handle session updates (e.g. name/phone change)
      if (trigger === "update" && session) {
        const newName = session.user?.name || session.name;
        const newPhone = session.user?.phone || session.phone;
        
        if (newName) token.name = newName
        if (newPhone) token.phone = newPhone
        if (session.mustChangePassword === false) token.mustChangePassword = false
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        ;(session as any).accessToken = token.accessToken
        ;(session as any).refreshToken = token.refreshToken
        if (session.user) {
          ;(session.user as any).id = token.id
          ;(session.user as any).role = token.role
          ;(session.user as any).phone = token.phone
          ;(session.user as any).mustChangePassword = token.mustChangePassword
        }
      }
      return session
    },
  },
}
