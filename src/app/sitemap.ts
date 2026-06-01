import type { MetadataRoute } from 'next';
import { getBlogPosts } from '@/api/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iqode.vn';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/courses`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/method`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 }
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await getBlogPosts({ filter: 'all', includeDrafts: false });
    blogRoutes = data
      .filter((p) => p.status === 'published')
      .map((p) => ({
        url: `${siteUrl}/blog/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7
      }));
  } catch {
    // Blog API unavailable at build time — sitemap still serves static pages
  }

  return [...staticRoutes, ...blogRoutes];
}
