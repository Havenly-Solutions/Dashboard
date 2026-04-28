import { NextRequest } from 'next/server'
import { apiProxy } from '@/lib/server-fetch'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return apiProxy(req, `/api/ngo-partners/${params.id}`)
}
