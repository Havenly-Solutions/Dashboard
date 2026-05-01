import { apiProxy } from '@/lib/server-fetch';

export async function GET(req: Request) {
  return apiProxy(req, '/api/export/audit-logs');
}
