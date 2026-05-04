export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    const message = data.debug ? `${data.message || data.error} (Debug: ${data.debug})` : (data.message || data.error || `API error: ${status}`);
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Base API client that doesn't automatically fetch session to avoid circular dependencies and server-side issues.
 */
export async function baseApiClient(endpoint: string, options: any = {}) {
  const { responseType = 'json', token, ...fetchOptions } = options;
  
  const isBrowser = typeof window !== 'undefined';
  const baseUrl = isBrowser ? window.location.origin : (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || '');
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const headers = new Headers(fetchOptions.headers || {});
  
  if (!headers.has('Content-Type') && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const config = {
    ...fetchOptions,
    headers,
  };

  try {
    if (isBrowser) console.log(`[apiClient] Requesting ${url}`, fetchOptions);
    const response = await fetch(url, config);
    if (isBrowser) console.log(`[apiClient] Response from ${url}:`, response.status, response.ok);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No response body');
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      console.error(`[apiClient] Error ${response.status} on ${url}:`, errorData);
      throw new ApiError(response.status, errorData);
    }

    if (responseType === 'blob') {
      return response.blob();
    }

    return response.json();
  } catch (err: any) {
    console.error(`[apiClient] Fetch failed on ${url}:`, err.message);
    throw err;
  }
}

/**
 * Convenience wrapper that attempts to inject the session token.
 * Use this in Client Components. In Server Components/Middleware, 
 * prefer passing the token explicitly to baseApiClient.
 */
export async function apiClient(endpoint: string, options: any = {}) {
  const isBrowser = typeof window !== 'undefined';
  let token = options.token;

  if (!token && isBrowser) {
    // Dynamic import to avoid server-side issues with next-auth/react
    const { getSession } = await import('next-auth/react');
    const session = await getSession() as any;
    token = session?.accessToken;
  }

  return baseApiClient(endpoint, { ...options, token });
}
