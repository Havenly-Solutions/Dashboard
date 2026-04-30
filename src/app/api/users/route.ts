export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { apiProxy } from '@/lib/server-fetch'

export async function GET(req: NextRequest) {
  return apiProxy(req, '/api/users')
}

export async function POST(req: NextRequest) {
  return apiProxy(req, '/api/team/invite')
}
