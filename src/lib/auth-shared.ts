import type { AppRole } from '@/config/nav-config';

export const AUTH_COOKIE_NAME = 'iqode_auth';

export type AuthUser = {
  username: string;
  name: string;
  phone: string;
  email: string;
  role: AppRole;
  roles: string[];
  accessToken: string;
  refreshToken: string;
};

// Backend returns roles like 'ROLE_ADMIN' | 'ROLE_TEACHER' | 'ROLE_PARENT'.
// Pick the most-privileged matching app role.
export function pickAppRole(roles: string[] | undefined | null): AppRole {
  const set = new Set((roles ?? []).map((r) => r.toUpperCase()));
  if (set.has('ROLE_ADMIN')) return 'admin';
  if (set.has('ROLE_TEACHER')) return 'teacher';
  return 'parent';
}
