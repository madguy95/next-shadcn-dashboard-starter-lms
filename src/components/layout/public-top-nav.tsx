'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { LanguageSwitcher } from './language-switcher';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { logout } from '@/lib/auth-actions';
import type { AppRole } from '@/config/nav-config';
import { roleMeta } from '@/config/nav-config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

function CircuitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className={className} aria-hidden='true'>
      <circle cx='12' cy='12' r='2' />
      <line x1='12' y1='10' x2='12' y2='5.5' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='12' cy='4.5' r='1.5' />
      <line x1='13.4' y1='10.6' x2='17.2' y2='6.8' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='18' cy='6' r='1.5' />
      <line x1='14' y1='12' x2='18.5' y2='12' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='19.5' cy='12' r='1.5' />
      <line x1='13.4' y1='13.4' x2='17.2' y2='17.2' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='18' cy='18' r='1.5' />
      <line x1='10.6' y1='13.4' x2='6.8' y2='17.2' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='6' cy='18' r='1.5' />
      <line x1='10' y1='12' x2='5.5' y2='12' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='4.5' cy='12' r='1.5' />
    </svg>
  );
}

function Logo() {
  return (
    <Link href='/' className='flex items-baseline font-[family-name:var(--font-outfit)]'>
      <span className='leading-none text-xl font-black tracking-tight text-cyan-500 dark:text-cyan-400'>
        IQode
      </span>
      <span className='leading-none text-sm font-medium tracking-tight text-amber-500 dark:text-amber-400'>
        Lab
      </span>
      <CircuitIcon className='ml-0.5 size-3.5 -translate-y-2 text-amber-500 dark:text-amber-400' />
    </Link>
  );
}

function getInitials(name?: string | null, phone?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (phone ?? '?').slice(0, 2).toUpperCase();
}

function UserMenu({ user, workspace }: { user: AuthUser; workspace: WorkspaceMeta }) {
  const t = useTranslations('home.header');
  const displayName = user.name || user.phone || '';
  const initials = getInitials(user.name, user.phone);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <Avatar className='size-8'>
            <AvatarFallback className='bg-blue-600 text-xs font-semibold text-white'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <Icons.chevronDown className='size-3.5 text-gray-500 dark:text-gray-400' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuLabel className='font-normal'>
          <p className='text-sm font-medium'>{displayName}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={workspace.basePath} className='flex items-center gap-2'>
            <Icons.arrowRight className='size-4' />
            {t('enterWorkspace', { label: workspace.label })}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400'
          onSelect={() => logout()}
        >
          <Icons.logout className='size-4' />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PublicTopNav() {
  const { user } = useAuth();
  const workspace = user ? roleMeta[user.role] : null;
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
          <ThemeModeToggle />

          {user && workspace ? (
            <UserMenu user={user} workspace={workspace} />
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
