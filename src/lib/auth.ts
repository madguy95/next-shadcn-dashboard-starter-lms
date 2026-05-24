import { cookies } from 'next/headers';
import type { AppRole } from '@/config/nav-config';

export const AUTH_COOKIE_NAME = 'iqode_auth';

export type AuthUser = {
  name: string;
  phone: string;
  role: AppRole;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const c = await cookies();
  const raw = c.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      parsed &&
      typeof parsed.phone === 'string' &&
      typeof parsed.name === 'string' &&
      (parsed.role === 'admin' || parsed.role === 'teacher' || parsed.role === 'parent')
    ) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}
