/**
 * ApiError class for structured error handling
 */
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
 * baseApiClient
 * Core fetch wrapper. Safe for both Client and Server components.
 * Does NOT automatically fetch session to avoid circular dependencies.
 */
export async function baseApiClient(endpoint: string, options: any = {}) {
  const { responseType = 'json', token, timeout = 60000, ...fetchOptions } = options;
  
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
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    ...fetchOptions,
    headers,
    signal: controller.signal,
  };

  const startTime = Date.now();
  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    if (duration > 2000) {
      console.warn(`[baseApiClient] Slow response from ${url}: ${duration}ms`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No response body');
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      console.error(`[baseApiClient] Error ${response.status} on ${url}:`, errorData);
      throw new ApiError(response.status, errorData);
    }

    if (responseType === 'blob') {
      return response.blob();
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    if (err.name === 'AbortError') {
      console.error(`[baseApiClient] Timeout after ${duration}ms on ${url}`);
    }
    throw err;
  }
}
