import 'server-only';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, type AuthUser } from './auth-shared';

export { AUTH_COOKIE_NAME, pickAppRole } from './auth-shared';
export type { AuthUser } from './auth-shared';

export async function getAuthUser(): Promise<AuthUser | null> {
  const c = await cookies();
  const raw = c.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      parsed &&
      typeof parsed.phone === 'string' &&
      typeof parsed.accessToken === 'string' &&
      (parsed.role === 'admin' || parsed.role === 'teacher' || parsed.role === 'parent')
    ) {
      return {
        username: parsed.username ?? '',
        name: parsed.name ?? parsed.username ?? '',
        phone: parsed.phone,
        email: parsed.email ?? '',
        role: parsed.role,
        roles: parsed.roles ?? [],
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken ?? ''
      };
    }
    return null;
  } catch {
    return null;
  }
}
