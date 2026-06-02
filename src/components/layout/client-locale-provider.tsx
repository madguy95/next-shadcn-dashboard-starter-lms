'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { useLocaleStore } from '@/stores/locale-store';
import { DEFAULT_LOCALE } from '@/i18n/config';

interface Props {
  defaultMessages: AbstractIntlMessages;
  children: React.ReactNode;
}

export function ClientLocaleProvider({ defaultMessages, children }: Props) {
  const { locale } = useLocaleStore();
  const [messages, setMessages] = useState<AbstractIntlMessages>(defaultMessages);

  useEffect(() => {
    document.documentElement.lang = locale;

    if (locale === DEFAULT_LOCALE) {
      setMessages(defaultMessages);
      return;
    }

    import(`@/i18n/messages/${locale}.json`).then((m) => {
      setMessages(m.default as AbstractIntlMessages);
    });
  }, [locale, defaultMessages]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone='Asia/Ho_Chi_Minh'>
      {children}
    </NextIntlClientProvider>
  );
}
