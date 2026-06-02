export const revalidate = 360;
export const fetchCache = 'default-cache';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactPage } from '@/features/public/components/contact-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: {
      canonical: '/contact',
      languages: { 'x-default': '/contact' }
    },
    openGraph: {
      title,
      description,
      url: '/contact',
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

export default function ContactRoute() {
  return <ContactPage />;
}
