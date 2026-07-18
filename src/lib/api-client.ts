// ---------------------------------------------------------------------------
// Thin fetch wrapper for havenly-backend/src/dashboard.
//
// - Sends the access token as a Bearer header (kept in memory by
//   AuthProvider, never localStorage \u2014 XSS-resistant).
// - Sends credentials so the backend's httpOnly refresh cookie travels
//   with every request.
// - On a 401, calls /auth/refresh once and retries the original request
//   before giving up and forcing a logout.
// - Every call site works whether havenly-backend is live or not: pass a
//   `fallback` to have ApiError swallowed and demo data returned instead
//   (see lib/mock-data.ts). Set NEXT_PUBLIC_DEMO_MODE=false in production
//   once every route below is wired up, so real failures surface as errors
//   instead of silently masking a broken endpoint.
// ---------------------------------------------------------------------------

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3005/api/v1/dashboard";
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** The standard wrapper for all havenly-backend responses. */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string; code: string; details?: unknown };
  timestamp: string;
}

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

let getToken: TokenGetter = () => null;
let onRefresh: RefreshHandler = async () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

/** Wired up once by AuthProvider on mount. */
export function configureApiClient(opts: {
  getToken: TokenGetter;
  onRefresh: RefreshHandler;
  onUnauthorized: UnauthorizedHandler;
}) {
  getToken = opts.getToken;
  onRefresh = opts.onRefresh;
  onUnauthorized = opts.onUnauthorized;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

async function rawRequest<T>(path: string, opts: RequestOptions, token: string | null): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    credentials: "include",
    signal: opts.signal,
    headers: {
      "Content-Type": "application/json",
      ...(token && !opts.skipAuth ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && "error" in payload
        ? String((payload as ApiResponse<unknown>).error?.message)
        : isJson && payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : undefined) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  // If it's a standard wrapped response, return just the data.
  if (isJson && payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = getToken();
  try {
    return await rawRequest<T>(path, opts, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !opts.skipAuth) {
      const refreshed = await onRefresh();
      if (refreshed) {
        return await rawRequest<T>(path, opts, refreshed);
      }
      onUnauthorized();
    }
    throw err;
  }
}

/**
 * Convenience wrapper for read screens: call the real endpoint, and if it
 * fails AND demo mode is on, resolve with seeded data instead of throwing.
 * In production (NEXT_PUBLIC_DEMO_MODE=false) failures always propagate.
 */
export async function apiRequestWithFallback<T>(
  path: string,
  fallback: () => T,
  opts: RequestOptions = {}
): Promise<T> {
  try {
    return await apiRequest<T>(path, opts);
  } catch (err) {
    if (DEMO_MODE) return fallback();
    throw err;
  }
}

export const api = {
  get: <T>(path: string, opts: Omit<RequestOptions, "method"> = {}) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  delete: <T>(path: string, opts: Omit<RequestOptions, "method"> = {}) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
