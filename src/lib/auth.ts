import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Role } from '@/types'
import { apiClient } from '@/lib/apiClient'



export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 60 }, // 30 minutes max session age
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
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

          const result = await apiClient(`/api/auth/login`, {
            method: 'POST',
            headers: { 
              'x-forwarded-for': forwardedFor,
              'user-agent': userAgent
            },
            body: JSON.stringify({
               email: credentials.email,
               password: credentials.password
            }),
          })
          
          const { user, accessToken, refreshToken } = result
          
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            phone: user.phone,
            role: user.role as Role,
            portalId: user.portalId,
            department: user.department,
            accessToken,
            refreshToken,
            mustChangePassword: user.mustChangePassword,
            hasCompletedOnboarding: user.hasCompletedOnboarding
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
        token.portalId = (user as any).portalId // Persist portalId
        token.phone = (user as any).phone
        token.mustChangePassword = (user as any).mustChangePassword
        token.hasCompletedOnboarding = (user as any).hasCompletedOnboarding
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
        if (session.user?.hasCompletedOnboarding === true) token.hasCompletedOnboarding = true
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
          ;(session.user as any).portalId = token.portalId // Expose portalId to frontend
          ;(session.user as any).phone = token.phone
          ;(session.user as any).mustChangePassword = token.mustChangePassword
          ;(session.user as any).hasCompletedOnboarding = token.hasCompletedOnboarding
        }
      }
      return session
    },
  },
}
