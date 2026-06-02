import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { blogDetailOptions, getBlogPostBySlug, getBlogPosts } from '@/api/blog';
import type { BlogPost } from '@/api/blog';
import { BlogDetailSkeleton, BlogDetailView } from '@/features/blog/components/blog-detail-view';
import { getQueryClient } from '@/lib/query-client';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const result = await getBlogPosts({ filter: 'all', includeDrafts: false });
    return result.data.filter((p) => p.status === 'published').map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, t] = await Promise.all([getBlogPostBySlug(slug), getTranslations('blog')]);
  const title = post ? t('metaTitleDetail', { title: post.title }) : t('metaTitleDetailFallback');
  const description = post?.excerpt ?? '';
  const canonicalUrl = `/blog/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'x-default': canonicalUrl }
    },
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iqode.vn';

function buildArticleJsonLd(post: BlogPost, slug: string) {
  const url = `${SITE_URL}/blog/${slug}`;
  const datePublished = (() => {
    const d = new Date(post.publishedAt);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  })();
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    ...(datePublished ? { datePublished } : {}),
    ...(post.coverUrl ? { image: post.coverUrl } : {}),
    author: { '@type': 'Person', name: post.author.name },
    publisher: {
      '@type': 'Organization',
      name: 'IQode Lab',
      url: SITE_URL
    }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(blogDetailOptions(slug));

  const post = queryClient.getQueryData<BlogPost>(blogDetailOptions(slug).queryKey);
  if (!post) notFound();
  if (post.status === 'draft') notFound();

  return (
    <PageContainer scrollable={true}>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleJsonLd(post, slug))
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
        }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BlogDetailSkeleton />}>
          <BlogDetailView slug={slug} canEdit={false} basePath='/blog' />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
