import { apiProxy } from '@/lib/server-fetch';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return apiProxy(req, `/api/team/${params.id}`);
}
