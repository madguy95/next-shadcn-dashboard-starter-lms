'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { LanguageSwitcher } from './language-switcher';
import { logout } from '@/lib/auth-actions';
import type { AppRole } from '@/config/nav-config';

type AuthUser = { name?: string | null; phone?: string; role: AppRole };
type WorkspaceMeta = { label: string; basePath: string };

const NAV_ITEMS: {
  href: string;
  labelKey: 'navHome' | 'navCourses' | 'navMethod' | 'navAbout' | 'navBlog' | 'navContact';
  exact: boolean;
  skipActive?: boolean;
}[] = [
  { href: '/', labelKey: 'navHome', exact: true },
  { href: '/courses', labelKey: 'navCourses', exact: false },
  { href: '/method', labelKey: 'navMethod', exact: false },
  { href: '/about', labelKey: 'navAbout', exact: false },
  { href: '/blog', labelKey: 'navBlog', exact: false },
  { href: '/contact', labelKey: 'navContact', exact: false }
];

function Logo() {
  return (
    <Link href='/' className='flex items-center gap-0.5'>
      <span className='text-lg font-bold text-gray-900 dark:text-white'>IQode</span>
      <span className='text-lg font-bold text-orange-500'> Lab</span>
    </Link>
  );
}

export function PublicTopNav({
  user,
  workspace
}: {
  user?: AuthUser | null;
  workspace?: WorkspaceMeta | null;
}) {
  const t = useTranslations('home.header');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean, skipActive?: boolean) => {
    if (skipActive) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className='sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm dark:border-border dark:bg-background'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8'>
        <Logo />

        {/* Desktop nav */}
        <nav className='hidden items-center gap-0.5 lg:flex' aria-label='Main navigation'>
          {NAV_ITEMS.map(({ href, labelKey, exact, skipActive }) => {
            const active = isActive(href, exact, skipActive);
            return (
              <Link
                key={labelKey}
                href={href}
                className={[
                  'relative px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'font-semibold text-blue-600 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-blue-600 dark:text-blue-400 dark:after:bg-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                ].join(' ')}
              >
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className='flex items-center gap-2'>
          <div className='hidden md:flex'>
            <LanguageSwitcher />
          </div>

          {user && workspace ? (
            <>
              <span className='hidden text-sm text-gray-500 dark:text-gray-400 lg:inline'>
                {user.name || user.phone}
              </span>
              <Link
                href={workspace.basePath}
                className='inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700'
              >
                <span className='hidden sm:inline'>
                  {t('enterWorkspace', { label: workspace.label })}
                </span>
                <span className='sm:hidden'>{workspace.label}</span>
                <Icons.arrowRight className='size-3.5' />
              </Link>
              <form action={logout}>
                <button
                  type='submit'
                  className='hidden text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:inline'
                >
                  {t('logout')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='hidden text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white md:inline'
              >
                {t('login')}
              </Link>
              <Link
                href='/login?mode=register'
                className='inline-flex h-9 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
              >
                {t('navCta')}
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type='button'
            aria-label='Toggle menu'
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className='rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden'
          >
            {mobileOpen ? <Icons.close className='size-5' /> : <Icons.menu className='size-5' />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='border-t border-gray-100 bg-white dark:border-border dark:bg-background lg:hidden'>
          <nav className='flex flex-col px-4 py-3' aria-label='Mobile navigation'>
            {NAV_ITEMS.map(({ href, labelKey, exact, skipActive }) => {
              const active = isActive(href, exact, skipActive);
              return (
                <Link
                  key={labelKey}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'py-2.5 text-sm border-b border-gray-50 last:border-0 dark:border-border',
                    active
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  ].join(' ')}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
            <div className='flex items-center gap-3 py-3'>
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
