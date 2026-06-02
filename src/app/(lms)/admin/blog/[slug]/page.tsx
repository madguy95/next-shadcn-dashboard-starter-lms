import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { blogDetailOptions, getBlogPostBySlug } from '@/api/blog';
import { BlogDetailSkeleton, BlogDetailView } from '@/features/blog/components/blog-detail-view';
import { getAuthUser } from '@/lib/auth';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, t] = await Promise.all([getBlogPostBySlug(slug), getTranslations('blog')]);
  const title = post ? t('metaTitleDetail', { title: post.title }) : t('metaTitleDetailFallback');
  return { title };
}

export default async function AdminBlogDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, post] = await Promise.all([getAuthUser(), getBlogPostBySlug(slug)]);
  if (user?.role !== 'admin') notFound();
  if (!post) notFound();

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(blogDetailOptions(slug));

  return (
    <PageContainer scrollable={true}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BlogDetailSkeleton />}>
          <BlogDetailView slug={slug} canEdit basePath='/admin/blog' />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
