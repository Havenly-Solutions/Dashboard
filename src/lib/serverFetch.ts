import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'https://api.havenly.solutions'

/**
 * serverFetch
 * Securely proxies server-side requests from Dashboard to Backend
 */
export async function serverFetch(path: string, options: RequestInit & { requiresAuth?: boolean } = {}) {
  const { requiresAuth = true, ...fetchOptions } = options;
  const headersList = getHeaders()
  let accessToken = headersList.get('x-auth-token')
  let refreshToken = null
  
  const PUBLIC_API_PATHS = [
    '/api/pre-registrations/register',
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/v1/dashboard/auth/login',
    '/api/v1/dashboard/auth/refresh'
  ];
  const isPublicPath = PUBLIC_API_PATHS.some(p => path.startsWith(p));

  if (!accessToken && requiresAuth && !isPublicPath) {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error(`>>> [serverFetch] Session missing for path: ${path}`);
      return null
    }
    accessToken = (session as any).accessToken
    refreshToken = (session as any).refreshToken
  }

  const forwardedFor = headersList.get('x-forwarded-for') || ''
  const userAgent = headersList.get('user-agent') || ''

  const url = `${BACKEND_URL}${path}`
  console.log(`[serverFetch] Initiating ${fetchOptions.method || 'GET'} to ${url}`);

  const headers: any = {
    'Content-Type': 'application/json',
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    'x-forwarded-for': forwardedFor,
    'user-agent': userAgent,
    ...fetchOptions.headers,
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    const method = fetchOptions.method || 'GET';
    console.log(`[serverFetch] ${method} ${path} - Status: ${response.status} - Duration: ${duration}ms`);

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
        const refreshRes = await fetch(`${BACKEND_URL}/api/v1/dashboard/auth/refresh`, {
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
        } else {
          const errorBody = await refreshRes.text().catch(() => 'No body');
          console.error(`>>> [serverFetch] Token refresh failed for ${path}: Status ${refreshRes.status}`, { errorBody });
        }
      }
    }

    return response
  } catch (error: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.error('>>> RAW FETCH ERROR', {
      path,
      url,
      duration,
      name: error?.name,
      message: error?.message,
      cause: error?.cause,
      code: error?.cause?.code,
      stack: error?.stack,
    });
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

  console.error(`>>> [apiProxy] Processing ${method} to ${proxyPath} (BACKEND_URL: ${BACKEND_URL})`);

  let body: any = undefined
  if (['POST', 'PATCH', 'PUT'].includes(method)) {
    try {
      body = await req.json()
    } catch (e) {
      // Empty or invalid JSON body
    }
  }

  const isAuthPath = path.includes('/auth/login') || path.includes('/auth/refresh');

  const res = await serverFetch(proxyPath, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    requiresAuth: !isAuthPath,
  } as any)

  console.error(`>>> [apiProxy] Result for ${proxyPath}:`, res ? `Status ${res.status}` : 'NULL');

  if (!res) {
    console.error(`[apiProxy] 504 Gateway Timeout on ${method} ${proxyPath} - Backend returned null`);
    return NextResponse.json({
      error: 'Gateway Timeout: Backend Unreachable',
      path: proxyPath,
      method: method
    }, { status: 504 })
  }

  // Stream the response back to the client
  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    }
  })
}
