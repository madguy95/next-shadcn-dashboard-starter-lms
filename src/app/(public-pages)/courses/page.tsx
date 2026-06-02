export const revalidate = 60;

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
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
export default async function CoursesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; q?: string; tool?: string; sort?: string }>;
}) {
  const { page: pageStr, q, tool, sort } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    publicCoursesOptions({
      page,
      size: PUBLIC_COURSES_PAGE_SIZE,
      search: q || undefined,
      tool: tool || undefined,
      sort: sort || undefined
    })
  );

  return (
    <>
      <CoursesHero />
      <section className='bg-gray-50 py-12 md:py-16'>
        <div className='mx-auto max-w-6xl px-6 md:px-10'>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <EnrollmentView page={page} />
          </HydrationBoundary>
        </div>
      </section>
    </>
  );
}
