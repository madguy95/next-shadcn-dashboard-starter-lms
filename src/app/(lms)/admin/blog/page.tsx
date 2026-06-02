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
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  return { title: t('metaTitleList') };
}

const BASE = '/admin/blog';

export default async function AdminBlogPage() {
  const t = await getTranslations('blog');

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(blogListOptions({ filter: 'all', includeDrafts: true }));

  return (
    <PageContainer
      pageTitle={t('pageTitle')}
      pageDescription={t('intro.admin')}
      pageHeaderAction={<BlogListHeaderAction canEdit basePath={BASE} />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogListView canEdit basePath={BASE} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
