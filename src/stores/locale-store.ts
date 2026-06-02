import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config';

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        if (isLocale(locale)) set({ locale });
      }
    }),
    {
      name: 'locale-preference',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
