export const revalidate = 60;
export const fetchCache = 'default-cache';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { publicCoursesOptions, PUBLIC_COURSES_PAGE_SIZE } from '@/api/courses/queries';
import { CoursesHero, EnrollmentView } from '@/features/parent/components/enrollment-view';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata() {
  const t = await getTranslations('coursesCatalog');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: {
      canonical: '/courses',
      languages: { 'x-default': '/courses' }
    },
    openGraph: {
      title,
      description,
      url: '/courses',
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

// Public course list is rendered server-side and hydrated into React Query so the page paints
// with real data on first byte (good for SEO + perceived speed). Per project rule:
// public endpoints → server prefetch, authed endpoints → client fetch.
export default async function CoursesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    publicCoursesOptions({ page: 1, size: PUBLIC_COURSES_PAGE_SIZE })
  );

  return (
    <>
      <CoursesHero />
      <section className='bg-gray-50 py-12 md:py-16'>
        <div className='mx-auto max-w-6xl px-6 md:px-10'>
          <Suspense>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <EnrollmentView />
            </HydrationBoundary>
          </Suspense>
        </div>
      </section>
    </>
  );
}
