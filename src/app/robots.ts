import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iqodelab.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/courses', '/blog', '/about', '/privacy-policy', '/terms-of-service'],
        disallow: ['/admin/', '/teacher/', '/parent/', '/login']
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
