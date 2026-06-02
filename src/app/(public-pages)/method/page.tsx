export const revalidate = 360;
export const fetchCache = 'default-cache';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MethodPage } from '@/features/public/components/method-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('method');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: {
      canonical: '/method',
      languages: { 'x-default': '/method' }
    },
    openGraph: {
      title,
      description,
      url: '/method',
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

export default function MethodRoute() {
  return <MethodPage />;
}
