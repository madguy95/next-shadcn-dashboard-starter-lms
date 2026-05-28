// Client-side login flow.
//
// Why not a Server Action: when the Next.js server (Node) calls the backend, the request goes
// out from the dev machine (or Next.js server in prod). On a corporate network with SSL
// inspection, Node's TLS validation will reject the proxy-issued cert and login silently fails.
// Browser fetch uses the OS trust store (which has the corporate CA already installed by IT),
// so going client-side bypasses that pain entirely. As a bonus the call shows up in the
// browser Network tab — easier to debug.

import { apiClient, ApiError } from './api-client';
import { AUTH_COOKIE_NAME, pickAppRole, type AuthUser } from './auth-shared';

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  type: string;
  user: {
    username: string;
    email: string;
    roles: string[];
  };
};

export type LoginResult = { ok: true; user: AuthUser } | { ok: false; message: string };

function writeAuthCookie(user: AuthUser): void {
  // Not httpOnly — apiClient needs to read accessToken from cookie for Authorization headers.
  // Same shape as the server-side cookies().set() in auth-actions.ts so existing readers don't care.
  const value = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${ONE_WEEK_SECONDS}; samesite=lax`;
}

export async function login(phone: string, password: string): Promise<LoginResult> {
  try {
    const res = await apiClient<LoginResponse>('/api/auth/', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });

    const role = pickAppRole(res.user.roles);
    const user: AuthUser = {
      username: res.user.username,
      name: res.user.username,
      phone,
      email: res.user.email,
      role,
      roles: res.user.roles,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken
    };

    writeAuthCookie(user);
    return { ok: true, user };
  } catch (e) {
    // ApiError carries the BE's message (e.g., "Sai mật khẩu"); fall back to a generic
    // string for network failures so the form always has something to surface.
    const message =
      e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Đăng nhập thất bại';
    return { ok: false, message };
  }
}
