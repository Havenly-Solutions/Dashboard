import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_PERMISSIONS } from '@/types'

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET as string 
    })
    const pathname = req.nextUrl.pathname

    // 1. If no token and trying to access dashboard, redirect to login
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
      return passWithToken(req, token.accessToken as string)
    }

    // 4. Check specific path permissions
    const isAllowed = permissions.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (!isAllowed) {
      const defaultRoute = permissions[0] || '/dashboard'
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
 * This allows downstream Server Components and Route Handlers to bypass redundant session lookups.
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
  matcher: ['/dashboard/:path*', '/api/:path*'], // Added /api to matcher for token passthrough
}
