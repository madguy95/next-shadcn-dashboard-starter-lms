import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { blogDetailOptions, getBlogPostBySlug } from '@/api/blog';
import { BlogEditorView } from '@/features/blog/components/blog-editor-view';
import { getAuthUser } from '@/lib/auth';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, t] = await Promise.all([getBlogPostBySlug(slug), getTranslations('blog')]);
  return {
    title: post ? t('metaTitleEdit', { title: post.title }) : t('metaTitleDetailFallback')
  };
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
        <Suspense>
          <BlogEditorView mode='edit' slug={slug} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
