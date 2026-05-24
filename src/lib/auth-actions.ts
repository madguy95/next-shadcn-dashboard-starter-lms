'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME, type AuthUser } from './auth';

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function loginAsParent(data: { name?: string; phone: string }) {
  const user: AuthUser = {
    name: data.name?.trim() || 'Phụ huynh',
    phone: data.phone,
    role: 'parent'
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
