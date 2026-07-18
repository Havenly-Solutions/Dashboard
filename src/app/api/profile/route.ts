import { apiProxy } from '@/lib/serverFetch';

export async function PUT(req: Request) {
  return apiProxy(req, '/users/me');
}

export async function GET(req: Request) {
  return apiProxy(req, '/users/me');
}
