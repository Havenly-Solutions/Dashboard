import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_PERMISSIONS } from '@/types'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const pathname = req.nextUrl.pathname

  // 1. If no token and trying to access dashboard, redirect to login WITHOUT callbackUrl
  if (!token) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // 2. If token exists but role is invalid
  const role = token.role as keyof typeof ROLE_PERMISSIONS
  const permissions = ROLE_PERMISSIONS[role]

  if (!permissions) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 3. Founder and Chief Officer bypass
  if (permissions.includes('*')) {
    return NextResponse.next()
  }

  // 4. Check specific path permissions
  const isAllowed = permissions.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (!isAllowed) {
    const defaultRoute = permissions[0] || '/dashboard'
    // Avoid redirect loops if default route is current route
    if (pathname === defaultRoute) return NextResponse.next()
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
