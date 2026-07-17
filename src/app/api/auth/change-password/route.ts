import { NextRequest } from 'next/server'
import { apiProxy } from '@/lib/serverFetch'

export async function POST(req: NextRequest) {
  return apiProxy(req, '/api/auth/change-password')
}
