import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { PublicTopNav } from '@/components/layout/public-top-nav';
import { HomeLanding } from '@/features/public/components/home-landing';
import { roleMeta } from '@/config/nav-config';
import { getAuthUser } from '@/lib/auth';
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
    alternates: { canonical: '/' },
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

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(publicCoursesOptions({ page: 1, size: 3 }));
  void queryClient.prefetchQuery(homeFeedOptions(8));

  const user = await getAuthUser();
  const workspace = user ? roleMeta[user.role] : null;

  return (
    <>
      <PublicTopNav user={user} workspace={workspace} />
      <main>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <HomeLanding user={user} />
        </HydrationBoundary>
      </main>
    </>
  );
}
