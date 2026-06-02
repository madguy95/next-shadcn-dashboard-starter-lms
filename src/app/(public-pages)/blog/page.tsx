import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { blogListOptions } from '@/api/blog';
import {
  BlogListHeaderAction,
  BlogListSkeleton,
  BlogListView
} from '@/features/blog/components/blog-list-view';
import { getAuthUser } from '@/lib/auth';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  const title = t('metaTitleList');
  const description = t('metaDescriptionList');
  return {
    title,
    description,
    alternates: {
      canonical: '/blog',
      languages: { 'x-default': '/blog' }
    },
    openGraph: {
      title,
      description,
      url: '/blog',
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

const BASE = '/blog';

export default async function BlogPage() {
  const user = await getAuthUser();
  const t = await getTranslations('blog');

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(blogListOptions({ filter: 'all', includeDrafts: false }));

  const role = user?.role ?? 'parent';
  const description = t(`intro.${role}`);

  return (
    <PageContainer
      pageTitle={t('pageTitle')}
      pageDescription={description}
      pageHeaderAction={<BlogListHeaderAction canEdit={false} basePath={BASE} />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogListView canEdit={false} basePath={BASE} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
