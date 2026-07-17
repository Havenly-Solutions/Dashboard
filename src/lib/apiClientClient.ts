'use client';

import { getSession } from 'next-auth/react';
import { baseApiClient } from './apiClient';

/**
 * apiClient
 * Client-side convenience wrapper that injects the session token.
 * ONLY use this in Client Components.
 */
export async function apiClient(endpoint: string, options: any = {}) {
  let token = options.token;

  if (!token && typeof window !== 'undefined') {
    const session = await getSession() as any;
    token = session?.accessToken;
  }

  return baseApiClient(endpoint, { ...options, token });
}
