import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE } from './config';

export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  timeZone: 'Asia/Ho_Chi_Minh',
  messages: (await import(`./messages/${DEFAULT_LOCALE}.json`)).default
}));
