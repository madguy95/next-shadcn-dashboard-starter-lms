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
  const description = post?.excerpt ?? '';
  const canonicalUrl = `/blog/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'IQode Lab',
      type: 'article',
      locale: 'vi_VN',
      ...(post?.coverUrl
        ? { images: [{ url: post.coverUrl, width: 1200, height: 630, alt: post.title }] }
        : {})
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post?.coverUrl ? { images: [post.coverUrl] } : {})
    }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [user, post] = await Promise.all([getAuthUser(), getBlogPostBySlug(slug)]);
  if (!post) notFound();

  const canEdit = user?.role === 'admin';
  // Drafts never reach non-admin viewers, regardless of how the URL was obtained.
  if (post.status === 'draft' && !canEdit) notFound();

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(blogDetailOptions(slug));

  return (
    <PageContainer scrollable={true}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BlogDetailSkeleton />}>
          <BlogDetailView slug={slug} canEdit={canEdit} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
