import { NextResponse } from 'next/server';
import { apiProxy } from '@/lib/serverFetch';

export async function PUT(req: Request) {
  return apiProxy(req, '/api/v1/profile');
}

export async function GET(req: Request) {
  return apiProxy(req, '/api/v1/profile');
}
