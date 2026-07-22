// ---------------------------------------------------------------------------
// Thin fetch wrapper for havenly-backend/src/dashboard.
// ---------------------------------------------------------------------------

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3005";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

let getToken: TokenGetter = () => null;
let onRefresh: RefreshHandler = async () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

let refreshPromise: Promise<string | null> | null = null;

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

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : undefined) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  // Automatically unwrap standard backend envelope { success: true, data: T }
  if (
    isJson &&
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    payload.success === true &&
    "data" in payload
  ) {
    return payload.data as T;
  }

  return payload as T;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = getToken();
  try {
    return await rawRequest<T>(path, opts, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !opts.skipAuth) {
      if (!refreshPromise) {
        refreshPromise = onRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      if (refreshed) {
        return await rawRequest<T>(path, opts, refreshed);
      }
      onUnauthorized();
    }
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
