import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_PERMISSIONS } from '@/types'

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET as string,
      cookieName: 'next-auth.session-token'
    })
    const { pathname, searchParams } = req.nextUrl

    // 1. If no token and trying to access dashboard, redirect to login
    if (!token) {
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // 2. If token exists but role is invalid or permissions missing
    const tokenRole = (token.role as string || '').toUpperCase()
    const roleKey = Object.keys(ROLE_PERMISSIONS).find(k => k.toUpperCase() === tokenRole)
    const permissions = roleKey ? ROLE_PERMISSIONS[roleKey] : null

    if (!permissions) {
      // Prevent loop: If already on home with an error, don't redirect again
      if (pathname === '/' && searchParams.has('error')) return NextResponse.next()
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
    }

    // 3. Founder and Chief Officer bypass
    if (permissions.includes('*')) {
      return passWithToken(req, token.accessToken as string)
    }

    // 4. Check specific path permissions
    // Map /api/resource to /dashboard/resource for permission matching
    const normalizedPath = pathname.startsWith('/api/') 
      ? pathname.replace('/api/', '/dashboard/') 
      : pathname

    const isAllowed = permissions.some(
      (p) => normalizedPath === p || normalizedPath.startsWith(p + '/')
    )

    if (!isAllowed) {
      // Don't redirect API calls, just return unauthorized
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      const defaultRoute = permissions.find(p => p.startsWith('/dashboard')) || '/dashboard'
      
      // If we are already on the default route or a base path, don't loop
      if (pathname === defaultRoute) return passWithToken(req, token.accessToken as string)
      
      return NextResponse.redirect(new URL(defaultRoute, req.url))
    }

    return passWithToken(req, token.accessToken as string)
  } catch (error) {
    console.error('Middleware Error:', error)
    return NextResponse.next()
  }
}

/**
 * Helper to pass the request forward while injecting the access token into headers.
 */
function passWithToken(req: NextRequest, token: string) {
  const requestHeaders = new Headers(req.headers)
  if (token) {
    requestHeaders.set('x-auth-token', token)
  }
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  // Exclude auth routes and static assets
  matcher: [
    '/dashboard/:path*',
    '/api/((?!auth).*)', // Matches /api/ but not /api/auth/
  ],
}
