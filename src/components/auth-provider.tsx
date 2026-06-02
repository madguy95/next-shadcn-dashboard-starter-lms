'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '@/lib/auth-shared';
import { AUTH_COOKIE_NAME } from '@/lib/auth-shared';

type AuthContextValue = { user: AuthUser | null; clearUser: () => void };

const AuthContext = createContext<AuthContextValue>({ user: null, clearUser: () => {} });

function readAuthCookie(): AuthUser | null {
  try {
    const match = document.cookie.split('; ').find((r) => r.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (!match) return null;
    const raw = decodeURIComponent(match.slice(AUTH_COOKIE_NAME.length + 1));
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      parsed &&
      typeof parsed.phone === 'string' &&
      typeof parsed.accessToken === 'string' &&
      (parsed.role === 'admin' || parsed.role === 'teacher' || parsed.role === 'parent')
    )
      return parsed as AuthUser;
  } catch {}
  return null;
}

export function AuthProvider({
  user: serverUser,
  children
}: {
  user?: AuthUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(serverUser ?? null);

  useEffect(() => {
    // No server-provided user (static page): resolve auth state from cookie on client.
    if (serverUser === undefined) setUser(readAuthCookie());
  }, [serverUser]);

  const clearUser = useCallback(() => setUser(null), []);

  return <AuthContext.Provider value={{ user, clearUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
