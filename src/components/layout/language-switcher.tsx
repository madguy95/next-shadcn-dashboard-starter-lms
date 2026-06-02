'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useLocaleStore } from '@/stores/locale-store';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/config';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale: currentLocale, setLocale } = useLocaleStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={cn('h-8 gap-1.5 px-2 text-[12px] uppercase', className)}
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
              if (locale !== currentLocale) setLocale(locale as Locale);
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
