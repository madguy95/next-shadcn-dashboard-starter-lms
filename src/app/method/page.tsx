import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PublicTopNav } from '@/components/layout/public-top-nav';
import { MethodPage } from '@/features/public/components/method-page';
import { roleMeta } from '@/config/nav-config';
import { getAuthUser } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('method');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: { canonical: '/method' },
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

export default async function MethodRoute() {
  const user = await getAuthUser();
  const workspace = user ? roleMeta[user.role] : null;

  return (
    <>
      <PublicTopNav user={user} workspace={workspace} />
      <main>
        <MethodPage />
      </main>
    </>
  );
}
