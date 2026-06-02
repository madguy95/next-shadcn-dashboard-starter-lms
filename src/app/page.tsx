import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { AuthProvider } from '@/components/auth-provider';
import { PublicTopNav } from '@/components/layout/public-top-nav';
import { HomeLanding } from '@/features/public/components/home-landing';
import { publicCoursesOptions } from '@/api/courses/queries';
import { homeFeedOptions } from '@/api/blog/queries';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata() {
  const t = await getTranslations('home');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: {
      canonical: '/',
      languages: { 'x-default': '/' }
    },
    openGraph: {
      title,
      description,
      url: '/',
      siteName: 'IQode Lab',
      type: 'website',
      locale: 'vi_VN'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iqode.vn';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'IQode Lab',
  url: SITE_URL,
  description:
    'IQode Lab — Trung tâm công nghệ giáo dục dành cho trẻ em với các khóa học lập trình Scratch, mBot2, mTiny và AI thực hành.',
  inLanguage: ['vi', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/courses?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
};

export default async function LandingPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(publicCoursesOptions({ page: 1, size: 3 })),
    queryClient.prefetchQuery(homeFeedOptions(8))
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
        }}
      />
      <AuthProvider>
        <PublicTopNav />
        <main>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeLanding />
          </HydrationBoundary>
        </main>
      </AuthProvider>
    </>
  );
}
