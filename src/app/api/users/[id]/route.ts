import { NextRequest } from 'next/server'
import { apiProxy } from '@/lib/server-fetch'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return apiProxy(req, `/api/users/${params.id}`)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return apiProxy(req, `/api/users/${params.id}`)
}
