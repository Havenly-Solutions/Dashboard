import { getSession, signOut } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3005';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRrefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiClient(path: string, options: RequestInit = {}) {
  const session: any = await getSession();
  
  if (!session) console.warn('[apiClient] No session found for:', path);
  else if (!session.accessToken) console.warn('[apiClient] No accessToken in session for:', path);

  const headers: any = {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { 'Authorization': `Bearer ${session.accessToken}` } : {}),
    ...options.headers,
  };

  const url = `${BACKEND_URL}${path}`;

  try {
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401 && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const { accessToken } = await refreshRes.json();
            isRefreshing = false;
            onRrefreshed(accessToken);
          } else {
            console.error('[apiClient] Refresh failed:', refreshRes.status);
            isRefreshing = false;
            signOut({ callbackUrl: '/' });
            throw new Error('Session expired');
          }
        } catch (err) {
          console.error('[apiClient] Refresh exception:', err);
          isRefreshing = false;
          signOut({ callbackUrl: '/' });
          throw err;
        }
      }

      // Wait for refresh to complete
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(url, { ...options, headers, credentials: 'include' });
    }

    return response;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
