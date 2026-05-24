'use client';

import { createContext, useContext } from 'react';
import type { AuthUser } from '@/lib/auth';

type AuthContextValue = { user: AuthUser | null };

const AuthContext = createContext<AuthContextValue>({ user: null });

export function AuthProvider({
  user,
  children
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
