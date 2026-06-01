import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PublicTopNav } from '@/components/layout/public-top-nav';
import { roleMeta } from '@/config/nav-config';
import { ContactPage } from '@/features/public/components/contact-page';
import { getAuthUser } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: { canonical: '/contact' },
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

export default async function ContactRoute() {
  const user = await getAuthUser();
  const workspace = user ? roleMeta[user.role] : null;

  return (
    <>
      <PublicTopNav user={user} workspace={workspace} />
      <main>
        <ContactPage />
      </main>
    </>
  );
}
