import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'https://api.havenly.solutions'

/**
 * serverFetch
 * Securely proxies server-side requests from Dashboard to Backend
 */
export async function serverFetch(path: string, options: RequestInit = {}) {
  const headersList = getHeaders()
  
  // OPTIMIZATION: Check for token injected by middleware first
  let accessToken = headersList.get('x-auth-token')
  let refreshToken = null

  if (!accessToken) {
    const session = await getServerSession(authOptions)
    if (!session) return null
    accessToken = (session as any).accessToken
    refreshToken = (session as any).refreshToken
  }

  const forwardedFor = headersList.get('x-forwarded-for') || ''
  const userAgent = headersList.get('user-agent') || ''

  const url = `${BACKEND_URL}${path}`
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'x-forwarded-for': forwardedFor,
    'user-agent': userAgent,
    ...options.headers,
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    if (duration > 2000) {
      console.warn(`[serverFetch] Slow backend response from ${path}: ${duration}ms`);
    }

    // If unauthorized, attempt token refresh
    if (response.status === 401 && path !== '/api/auth/refresh') {
      if (!refreshToken) {
        const session = await getServerSession(authOptions)
        refreshToken = (session as any)?.refreshToken
      }

      if (refreshToken) {
        const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          signal: controller.signal,
        })

        if (refreshRes.ok) {
          const { accessToken: newAccessToken } = await refreshRes.json()
          headers['Authorization'] = `Bearer ${newAccessToken}`
          return fetch(url, {
            cache: 'no-store',
            ...options,
            headers,
          })
        }
      }
    }

    return response
  } catch (error: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    if (error.name === 'AbortError') {
       console.error(`[serverFetch] Timeout after ${duration}ms on ${path}`);
    } else {
       console.error(`[serverFetch] error after ${duration}ms [${path}]:`, error);
    }
    return null
  }
}

/**
 * apiProxy
 * Helper to handle standard proxy responses
 */
export async function apiProxy(req: Request, path: string) {
  const method = req.method
  const urlObj = new URL(req.url)
  const proxyPath = `${path}${urlObj.search}`
  
  let body: any = undefined
  if (['POST', 'PATCH', 'PUT'].includes(method)) {
    try {
      body = await req.json()
    } catch (e) {
      // Empty or invalid JSON body
    }
  }

  const res = await serverFetch(proxyPath, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  } as RequestInit)

  if (!res) {
    return NextResponse.json({ error: 'Gateway Timeout: Backend Unreachable' }, { status: 504 })
  }

  // Stream the response back to the client
  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    }
  })
}
