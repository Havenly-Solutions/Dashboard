import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

import { headers as getHeaders } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3005'

/**
 * serverFetch
 * Securely proxies server-side requests from Dashboard to Backend
 */
export async function serverFetch(path: string, options: RequestInit = {}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  const headersList = getHeaders()
  const forwardedFor = headersList.get('x-forwarded-for') || ''
  const userAgent = headersList.get('user-agent') || ''

  const url = `${BACKEND_URL}${path}`
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${(session.user as any).accessToken}`,
    'x-forwarded-for': forwardedFor,
    'user-agent': userAgent,
    ...options.headers,
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If unauthorized, attempt token refresh
    if (response.status === 401 && path !== '/api/auth/refresh') {
      console.log(`[serverFetch] 401 detected on ${path}, attempting refresh...`)
      
      // We need to forward the refreshToken cookie to the backend
      // Since serverFetch is called from various places, we might not always have access to req.cookies
      // But in Next.js Server Components/Actions, we can use 'next/headers'
      const { cookies } = await import('next/headers')
      const cookieStore = cookies()
      const refreshToken = cookieStore.get('refreshToken')?.value

      const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `refreshToken=${refreshToken}`
        }
      })

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json()
        console.log(`[serverFetch] Refresh successful for ${path}`)
        
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${accessToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } else {
        console.warn(`[serverFetch] Refresh failed for ${path}: ${refreshRes.status}`)
      }
    }

    return response
  } catch (error) {
    console.error(`serverFetch error [${path}]:`, error)
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
  
  const body = ['POST', 'PATCH', 'PUT'].includes(method) ? await req.json() : undefined

  const res = await serverFetch(proxyPath, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res) {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 })
  }

  const text = await res.text()
  try {
    const data = JSON.parse(text)
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: text || 'Unknown backend error' }, { status: res.status })
  }
}
