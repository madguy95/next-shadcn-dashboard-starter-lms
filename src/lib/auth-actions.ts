'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiClientRaw } from './api-client';
import { AUTH_COOKIE_NAME } from './auth-shared';

// Note: `login` lives in `auth-client.ts` (client-side) so the request is visible in the
// browser Network tab and uses the OS trust store — avoids corporate proxy SSL issues that
// Node's TLS validator runs into. Only `logout` stays as a Server Action because it needs
// to delete the cookie via Next.js cookies() helper.

export async function logout() {
  const c = await cookies();
  // Best-effort revoke; ignore failures so logout always succeeds locally.
  const raw = c.get(AUTH_COOKIE_NAME)?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { accessToken?: string };
      if (parsed.accessToken) {
        await apiClientRaw('/api/auth/revoke', {
          method: 'POST',
          headers: { Authorization: `Bearer ${parsed.accessToken}` }
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }
  c.delete(AUTH_COOKIE_NAME);
  redirect('/');
}
