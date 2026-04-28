import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROLE_PERMISSIONS } from '@/types'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 4D. Force Password Change Redirection
    if (token.mustChangePassword && pathname !== '/dashboard/settings/security') {
      return NextResponse.redirect(new URL('/dashboard/settings/security', req.url))
    }

    const role = token.role as keyof typeof ROLE_PERMISSIONS
    const permissions = ROLE_PERMISSIONS[role]

    if (!permissions) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Founder and Chief Officer bypass
    if (permissions.includes('*')) {
      return NextResponse.next()
    }

    const isAllowed = permissions.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (!isAllowed) {
      const defaultRoute = permissions[0] || '/dashboard'
      return NextResponse.redirect(new URL(defaultRoute, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
