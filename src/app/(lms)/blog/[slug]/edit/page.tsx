import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { blogDetailOptions, getBlogPostBySlug } from '@/api/blog';
import { BlogDetailSkeleton } from '@/features/blog/components/blog-detail-view';
import { BlogEditorView } from '@/features/blog/components/blog-editor-view';
import { getAuthUser } from '@/lib/auth';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  return { title: t('metaTitleEdit') };
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
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
          <BlogEditorView mode='edit' slug={slug} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
