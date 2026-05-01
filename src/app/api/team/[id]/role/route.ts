import { apiProxy } from '@/lib/server-fetch';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return apiProxy(req, `/api/team/${params.id}/role`);
}
