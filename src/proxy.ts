import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'iqode_auth';

const ROLE_BASE: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher/classes',
  parent: '/parent/children'
};

function getRole(request: NextRequest): string | null {
  const raw = request.cookies.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { role?: string; accessToken?: string };
    if (parsed?.role && parsed?.accessToken) return parsed.role;
    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth logic on relevant paths
  const isLoginPage = pathname === '/login';
  const isProtected =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/parent');

  if (!isLoginPage && !isProtected) return NextResponse.next();

  const role = getRole(request);

  // Logged-in users visiting /login → redirect to their workspace
  if (isLoginPage) {
    if (role && ROLE_BASE[role]) {
      return NextResponse.redirect(new URL(ROLE_BASE[role], request.url));
    }
    return NextResponse.next();
  }

  // Protected routes — must be logged in
  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role mismatch — redirect to correct workspace
  const expectedRole = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/teacher')
      ? 'teacher'
      : 'parent';

  if (role !== expectedRole) {
    return NextResponse.redirect(new URL(ROLE_BASE[role] ?? '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
