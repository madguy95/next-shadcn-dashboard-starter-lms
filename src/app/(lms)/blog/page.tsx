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
  return { title: t('metaTitleList') };
}

export default async function BlogPage() {
  const user = await getAuthUser();
  const canEdit = user?.role === 'admin';
  const t = await getTranslations('blog');

  const queryClient = getQueryClient();
  // Default tab view — prefetch only the "all" filter. Other filters fetch on
  // navigation, which is cheap and keeps the initial payload small.
  void queryClient.prefetchQuery(blogListOptions({ filter: 'all', includeDrafts: canEdit }));

  const role = user?.role ?? 'parent';
  const description = t(`intro.${role}`);

  return (
    <PageContainer
      pageTitle={t('pageTitle')}
      pageDescription={description}
      pageHeaderAction={<BlogListHeaderAction canEdit={canEdit} />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogListView canEdit={canEdit} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
