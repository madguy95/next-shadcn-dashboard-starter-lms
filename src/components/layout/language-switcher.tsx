'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { setLocale } from '@/i18n/actions';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/config';

// className escape hatch so the same switcher can sit in both the themed app
// header (uses tokens) and the hard-coded dark landing page (needs white-on-
// black overrides). Defaulting keeps existing call sites unchanged.
export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={cn('h-8 gap-1.5 px-2 text-[12px] uppercase', className)}
          disabled={isPending}
          aria-label='Change language'
        >
          {currentLocale}
          <Icons.chevronDown className='size-3' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-36'>
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            disabled={locale === currentLocale}
            onSelect={() => {
              if (locale === currentLocale) return;
              startTransition(() => {
                void setLocale(locale);
              });
            }}
          >
            {LOCALE_LABELS[locale]}
            {locale === currentLocale ? <Icons.check className='ml-auto size-3.5' /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
