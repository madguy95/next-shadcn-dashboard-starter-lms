'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AppRole } from '@/config/nav-config';
import { AUTH_COOKIE_NAME, type AuthUser } from './auth';

const ONE_WEEK = 60 * 60 * 24 * 7;

const defaultNames: Record<AppRole, string> = {
  parent: 'Phụ huynh',
  teacher: 'Giảng viên',
  admin: 'Quản trị viên'
};

export async function loginAs(role: AppRole, data: { name?: string; phone: string }) {
  const user: AuthUser = {
    name: data.name?.trim() || defaultNames[role],
    phone: data.phone,
    role
  };
  const c = await cookies();
  c.set(AUTH_COOKIE_NAME, JSON.stringify(user), {
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK
  });
}

export async function logout() {
  const c = await cookies();
  c.delete(AUTH_COOKIE_NAME);
  redirect('/');
}
