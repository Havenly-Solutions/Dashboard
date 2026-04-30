import { NextRequest } from 'next/server'
import { apiProxy } from '@/lib/server-fetch'

export async function POST(req: NextRequest) {
  return apiProxy(req, '/api/team/invite')
}
