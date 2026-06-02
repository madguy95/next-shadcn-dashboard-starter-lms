import Providers from '@/components/layout/providers';
import { ClientLocaleProvider } from '@/components/layout/client-locale-provider';
import { SPLASH_INIT_SCRIPT, SplashScreen } from '@/components/layout/splash-screen';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import { DEFAULT_LOCALE } from '@/i18n/config';
import type { Metadata, Viewport } from 'next';
import { getMessages } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

// Inline script: reads active_theme cookie before first paint so there's no
// flash when the user has a non-default theme.
const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)active_theme=([^;]+)/);if(m)document.documentElement.setAttribute('data-theme',decodeURIComponent(m[1]));}catch(_){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iqode.vn'),
  title: {
    default: 'IQode Lab',
    template: '%s | IQode Lab'
  },
  description:
    'IQode Lab — Trung tâm công nghệ giáo dục dành cho trẻ em với các khóa học lập trình Scratch, mBot2, mTiny và AI thực hành.'
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning data-theme={DEFAULT_THEME}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <ClientLocaleProvider defaultMessages={messages}>
          <NuqsAdapter>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
              enableColorScheme
            >
              <Providers>
                <SplashScreen />
                <Toaster />
                {children}
              </Providers>
            </ThemeProvider>
          </NuqsAdapter>
        </ClientLocaleProvider>
      </body>
    </html>
  );
}
