import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

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

  const url = `${BACKEND_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${(session.user as any).accessToken}`,
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
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
