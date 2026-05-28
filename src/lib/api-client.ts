import { AUTH_COOKIE_NAME, type AuthUser } from './auth-shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIGN_IN_PATH = '/';

export type FieldError = { paramName: string; errorMessage: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | null,
    message: string,
    public details?: unknown,
    public fieldErrors: FieldError[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiResult<T> = {
  result?: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

function isFieldErrorArray(v: unknown): v is FieldError[] {
  return (
    Array.isArray(v) &&
    v.every(
      (e) =>
        e &&
        typeof e === 'object' &&
        typeof (e as FieldError).paramName === 'string' &&
        typeof (e as FieldError).errorMessage === 'string'
    )
  );
}

function buildError(status: number, statusText: string, body: ApiResult<unknown> | null): ApiError {
  const fieldErrors = isFieldErrorArray(body?.error) ? body.error : [];
  const code = !isFieldErrorArray(body?.error)
    ? ((body?.error as { code?: string } | undefined)?.code ??
      (typeof body?.data === 'string' ? (body.data as string) : null))
    : null;

  const summary =
    body?.message ??
    (fieldErrors.length > 0
      ? fieldErrors.map((e) => `${e.paramName}: ${e.errorMessage}`).join('; ')
      : `API error: ${status} ${statusText}`);

  return new ApiError(status, code, summary, body?.error, fieldErrors);
}

type PagedResult<T> = {
  status?: string;
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

function readAuthCookie(): AuthUser | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.split('=').slice(1).join('='));
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeAuthCookie(user: AuthUser) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function readAccessToken(): string | null {
  return readAuthCookie()?.accessToken ?? null;
}

// Server-side token read. Dynamic-imports `next/headers` so it never lands in client bundles.
async function readServerAccessToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const raw = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

// Singleton in-flight refresh so concurrent 401s share one refresh round-trip.
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const current = readAuthCookie();
  if (!current?.refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken })
    });
    if (!res.ok) return null;
    const body = (await safeJson(res)) as {
      data?: { accessToken?: string; refreshToken?: string };
    } | null;
    const data = body?.data;
    if (!data?.accessToken || !data?.refreshToken) return null;

    writeAuthCookie({
      ...current,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
    return data.accessToken;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function rawFetch(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const isServer = typeof document === 'undefined';
  const token = isServer ? await readServerAccessToken() : readAccessToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Auto-refresh: only client-side, only once per call, never for auth endpoints themselves
  // (refresh/login/revoke responding 401 must not loop).
  if (res.status === 401 && retry && !isServer && !endpoint.startsWith('/api/auth/')) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return rawFetch(endpoint, options, false);
    }
    clearAuthCookie();
    if (typeof window !== 'undefined' && window.location.pathname !== SIGN_IN_PATH) {
      window.location.href = SIGN_IN_PATH;
    }
  }

  return res;
}

// Calls returning ApiResult<T> wrapper: { result, message, data, error }
export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await rawFetch(endpoint, options);
  const body = (await safeJson(res)) as ApiResult<T> | null;

  if (!res.ok) {
    throw buildError(res.status, res.statusText, body);
  }
  if (body?.result === false) {
    throw buildError(res.status, res.statusText, body);
  }
  return body?.data as T;
}

// Calls returning PagedResult<T> (list endpoints).
export async function apiClientPaged<T>(
  endpoint: string,
  options?: RequestInit
): Promise<PagedResult<T>> {
  const res = await rawFetch(endpoint, options);
  const body = (await safeJson(res)) as PagedResult<T> | null;
  if (!res.ok || !body) {
    throw buildError(res.status, res.statusText, body as unknown as ApiResult<unknown> | null);
  }
  return body;
}

// Raw call for auth endpoints (login/refresh) that return their own shape, not ApiResult.
export async function apiClientRaw<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await rawFetch(endpoint, options);
  const body = (await safeJson(res)) as T | (ApiResult<unknown> & { error?: unknown }) | null;
  if (!res.ok) {
    throw buildError(res.status, res.statusText, body as ApiResult<unknown> | null);
  }
  return body as T;
}

// UX helper: turn any thrown error into { title, description } for toast/banner.
// Field-level errors from the backend get listed in the description.
export function formatApiError(
  err: unknown,
  fallback = 'Đã có lỗi xảy ra'
): { title: string; description?: string } {
  if (err instanceof ApiError) {
    if (err.fieldErrors.length > 0) {
      return {
        title: err.message || fallback,
        description: err.fieldErrors.map((e) => `• ${e.paramName}: ${e.errorMessage}`).join('\n')
      };
    }
    return { title: err.message || fallback };
  }
  if (err instanceof Error) return { title: err.message || fallback };
  return { title: fallback };
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
