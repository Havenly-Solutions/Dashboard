import { NextRequest } from 'next/server'
import { apiProxy } from '@/lib/server-fetch'

export async function PUT(req: NextRequest) {
  return apiProxy(req, '/api/profile')
}

export async function GET(req: NextRequest) {
  return apiProxy(req, '/api/profile/my-requests')
}

export async function POST(req: NextRequest) {
  return apiProxy(req, '/api/profile/request-change')
}
