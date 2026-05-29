export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const DEFAULT_LOCALE = 'vi' as const;
export const LOCALES = ['en', 'vi'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt'
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
