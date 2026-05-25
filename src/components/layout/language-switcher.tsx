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
import { setLocale } from '@/i18n/actions';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 gap-1.5 px-2 text-[12px] uppercase'
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
